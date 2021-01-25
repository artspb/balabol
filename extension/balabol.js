const logging = false
const storage = load()

function log(...data) {
    if (logging) {
        console.log(...data)
    }
}

function load() {
    const storage = JSON.parse(sessionStorage.getItem(`__balabol_map`))
    if (storage) {
        log(`[Balabol] Loaded data for ${location.pathname}`)
        return storage
    }
    return {}
}

setInterval(() => {
    sessionStorage.setItem(`__balabol_map`, JSON.stringify(storage))

    if (!window.default_MeetingsUi) {
        return
    }
    for (const [, entry] of Object.entries(window.default_MeetingsUi)) {
        if (!entry || !entry.prototype) {
            continue
        }
        for (const key of Object.keys(entry.prototype)) {
            const property = Object.getOwnPropertyDescriptor(entry.prototype, key)
            if (!property || !property.value || entry.prototype[key].__grid_ran) {
                continue
            }
            const method = /this\.([A-Za-z]+)\.getVolume\(\)/.exec(property.value.toString())
            if (!method) {
                continue
            }
            log('[Balabol] Successfully augmented this.*.getVolume()')
            const proxy = new Proxy(entry.prototype[key], VolumeProxyHandler(method[1]))
            proxy.__grid_ran = true
            entry.prototype[key] = proxy
            break
        }
    }
}, 1000)

function VolumeProxyHandler(object) {
    return {
        apply: function (target, thisArgument, argumentsList) {
            if (thisArgument.isDisposed()) {
                return target.apply(thisArgument, argumentsList)
            }
            if (!thisArgument.__balabol_video) {
                for (const v of Object.values(thisArgument)) {
                    if (v instanceof HTMLElement) {
                        thisArgument.__balabol_video = v.parentElement.parentElement.parentElement
                    }
                }
            }
            const name = thisArgument.__balabol_video.querySelector("div[data-self-name='You']").textContent
            if (name) {
                let map = storage[location.pathname]
                if (!map) {
                    storage[location.pathname] = (map = {})
                }
                if (!map.participants) {
                    map.participants = {}
                }
                let events = map.participants[name]
                if (!events) {
                    map.participants[name] = (events = [])
                }
                const last = events[events.length - 1]
                if (thisArgument[object].getVolume() > 0) {
                    if (!last || last['stopped']) {
                        log('[Balabol] Speaking', name)
                        events.push({'started': new Date()})
                    }
                } else {
                    if (last && !last['stopped']) {
                        log('[Balabol] Stopped', name)
                        last['stopped'] = new Date()
                    }
                }
            }
            return target.apply(thisArgument, argumentsList)
        },
    }
}

window.addEventListener('message', event => {
    if (event.source !== window || event.data.sender !== '__balabol_content') {
        return
    }
    try {
        switch (event.data.type) {
            case 'getMap':
                window.postMessage({
                    id: event.data.id,
                    sender: '__balabol_extension',
                    map: storage[location.pathname],
                })
                break;
            case 'clear':
                storage[location.pathname] = {participants: {}}
                window.postMessage({
                    id: event.data.id,
                    sender: '__balabol_extension',
                })
                break;
            default:
                window.postMessage({
                    id: event.data.id,
                    sender: '__balabol_extension',
                    error: 'Unknown message',
                })
                break;
        }
    } catch (error) {
        window.postMessage({
            id: event.data.id,
            sender: '__balabol_extension',
            error,
        })
    }
})
