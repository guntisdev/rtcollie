import { createWebSocketSignaling } from '../utils/signaling'
import { createButton, createRedPoint } from './ui'

export function createBroadcast(container: HTMLDivElement) {
    document.title = 'Broadcast'
    document.body.style.backgroundColor = '#ccc'
    container.innerHTML = `<p>broadcast</p>`
    container.style.position = 'relative'
    createButton(container)
    init(container)
}


async function init(container: HTMLDivElement) {
    const signaling = await createWebSocketSignaling('broadcast')
    const peerConnection = new RTCPeerConnection()

    // @ts-ignore
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false, preferCurrentTab: true, })
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream))
    console.log("Stream added. send to:", peerConnection.getSenders().length)

    const dataChannel = peerConnection.createDataChannel("mouse-coordinates")
    dataChannel.onopen = () => console.log("Data channel for broadcast is open!")
    
    let red: HTMLDivElement
    dataChannel.onmessage = (event) => {
        const { x, y } = JSON.parse(event.data)
        console.log(`Received x:${x}, y:${y}`)
        if (!red) red = createRedPoint(container)
        red.style.left = `${x-5}px`
        red.style.top = `${y-5}px`
        const targetElement = document.elementFromPoint(x, y)
        if (targetElement) {
            console.log(`Element at click position:`, targetElement)
            const clickEvent = new MouseEvent("click", { clientX: x, clientY: y, bubbles: true, cancelable: true,})
            targetElement.dispatchEvent(clickEvent)
        } else {
            console.log('No target element found')
        }
    }

    // SDP offer
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    signaling.send({ type: 'offer', offer })

    signaling.onMessage(async (message: any) => {
        if (message.type === 'answer') {
            console.log('answer from user', message)
            await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer))
        }
        else if (message.type === 'candidate') {
            console.log("ICE candidate from user", message);
            await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
    })
}
