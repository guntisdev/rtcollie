type ROLE = 'user' | 'broadcast'
const wsUrl = 'ws://localhost:8080'

export function createWebSocketSignaling(
    role: ROLE,
): Promise<{ send: (message: any) => void, onMessage: (callback: (message: any) => void) => void }> {
    return new Promise(resolve => {
        const urlWithRole = `${wsUrl}?role=${role}`
        const socket = new WebSocket(urlWithRole)
        socket.binaryType = 'blob'

        socket.onopen = () => {
            resolve({
                send: (message: any) => {
                    const messageWithRole = { role, message }
                    socket.send(JSON.stringify(messageWithRole))
                },
                onMessage: (callback: (message: any) => void) => {
                    socket.onmessage = async (event) => {
                        const messageWithRole = event.data instanceof Blob
                            ? JSON.parse(await event.data.text())
                            : JSON.parse(event.data);

                        if (messageWithRole.role === role) {
                            // user should not send messages to itself
                            return;
                        }

                        const { message } = messageWithRole
                        callback(message);
                    }
                },
            })
        }
    })
}
  