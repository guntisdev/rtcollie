const WebSocket = require('ws')
const url = require('url')

const port = 8080
const wss = new WebSocket.Server({ port })

console.log(`WebSocket on ws://localhost:${port}`)


let broadcastSocket = null
let userSocket = null
const userCachedMessages = []

wss.on('connection', (ws, request) => {
    const role = url.parse(request.url, true).query.role;
    console.log('Connected:', role);
    if (!broadcastSocket && role === 'broadcast') broadcastSocket = ws
    if (!userSocket && role === 'user') userSocket = ws

    if (userCachedMessages.length > 0 && userSocket) {
        userCachedMessages.forEach(userSocket.send)
        userCachedMessages.splice(0, userCachedMessages.length)
    }

    ws.on('message', rawMessage => {
        const message = JSON.parse(rawMessage)
        console.log("Message from:", message.role)

        if (message.role === 'broadcast') {
            if (userSocket) {
                userSocket.send(rawMessage)
            } else {
                userCachedMessages.push(rawMessage)
            }
        } else if (message.role === 'user') {
            if (broadcastSocket) {
                broadcastSocket.send(rawMessage)
            } else { console.log('ERROR, no broadcast socket') }
        } else { console.log('ERROR on ws message', message) }
    })

    ws.on('close', () => {
        console.log('Disconnected', role);
        if (ws === broadcastSocket) broadcastSocket = null
        else if (ws === userSocket) userSocket = null
    })
})
