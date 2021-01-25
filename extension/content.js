const requests = new Map()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        const id = +new Date()
        requests.set(id, sendResponse)
        window.postMessage({
            id,
            sender: '__balabol_content',
            ...request,
        })
        return true
    }
)

window.addEventListener('message', event => {
    if (event.source !== window || event.data.sender !== '__balabol_extension') {
        return
    }
    const sendResponse = requests.get(event.data.id)
    requests.delete(event.data.id)
    delete event.data.id
    delete event.data.sender
    if (sendResponse) {
        sendResponse(event.data)
    }
})

const script = document.createElement('script')
script.src = chrome.extension.getURL('balabol.js')
document.body.appendChild(script)
