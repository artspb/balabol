setInterval(updater, 1000)
updater()

function updater() {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'getMap'}, response => {
            let info = document.getElementById('__balabol_info')
            if (chrome.runtime.lastError || !response || !response.map) {
                info.innerHTML = 'No meeting information available'
                return
            }

            const map = response.map
            const participants = map.participants
            if (!participants) {
                info.innerHTML = 'Meeting has not yet been started'
                return
            }

            const durations = []
            for (const [name, events] of Object.entries(participants)) {
                let duration = 0
                for (let i = 0; i < events.length; i++) {
                    const event = events[i]
                    const started = event['started']
                    const stopped = event['stopped']
                    if (started && stopped) {
                        duration += Math.floor((stopped - started) / 1000)
                    }
                }
                if (duration !== 0) {
                    durations.push([name, duration])
                }
            }
            durations.sort((a, b) => b[1] - a[1])
            let html = '<div id="__balabol_buttons">'
            html += '<a id="__balabol_copy_button" href="#">Copy</a>'
            html += '&nbsp;'
            html += '<a id="__balabol_clear_button" href="#">Clear</a>'
            html += '</div>'
            html += '<table>'
            for (const duration of durations) {
                html +=
                    `<tr>
<td>${duration[0]}</td>
<td class="right">${hours(duration[1])}</td>
<td class="right">${minutes(duration[1])}</td>
<td class="right">${seconds(duration[1])}</td>
</tr>`
            }
            html += '</table>'
            info.innerHTML = html

            const copyButton = document.getElementById('__balabol_copy_button')
            copyButton.onclick = copy

            const clearButton = document.getElementById('__balabol_clear_button')
            clearButton.onclick = clear
        })
    })
}

function seconds(duration) {
    const seconds = duration % 60;
    return seconds > 0 ? `${seconds}s` : ''
}

function minutes(duration) {
    const minutes = Math.floor(duration / 60) % 60
    return minutes > 0 ? `${minutes}m` : ''
}

function hours(duration) {
    const hours = Math.floor(duration / 60 / 60)
    return hours > 0 ? `${hours}h` : ''
}

function copy() {
    const buttons = document.getElementById('__balabol_buttons');
    buttons.hidden = true

    const info = document.getElementById('__balabol_info');
    const text = info.innerText
    navigator.clipboard.writeText(text)

    buttons.hidden = false
}

function clear() {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'clear'}, () => {
        })
    })
}
