import { createWebSocketSignaling } from '../utils/signaling'
import { createPeerConnection } from '../utils/webrtc'

export function createBroadcast(container: HTMLDivElement) {
    document.title = 'Broadcast'
    document.body.style.backgroundColor = '#ccc'
    // document.body.style.cursor = 'none'
    container.innerHTML = `<p>broadcast</p>`
    container.style.position = 'relative'

    const button = document.createElement('input')
    button.type = 'button'
    button.value = 'clickable button'
    button.style.width = '200px'
    button.style.height = '50px'
    button.addEventListener('click', () => console.log('BUTTON CLICKED'))
    button.addEventListener('click', () => button.style.backgroundColor = getRandomColor())
    container.appendChild(button)

    init(container)
}


async function init(container: HTMLDivElement) {
    const signaling = await createWebSocketSignaling('broadcast')
    const peerConnection = createPeerConnection(signaling)

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
            const clickEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y,
            });
            targetElement.dispatchEvent(clickEvent)
        } else {
            console.log('No target element found')
        }
    }

    // SDP offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    signaling.send({ type: 'offer', offer });

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


function createRedPoint(container: HTMLDivElement): HTMLDivElement {
    const red = document.createElement('div')
    red.style.position = 'absolute'
    red.style.width = '10px'
    red.style.height = '10px'
    red.style.borderRadius = '5px'
    red.style.top = '0'
    red.style.left = '0'
    red.style.backgroundColor = 'red'
    red.style.pointerEvents = 'none'

    container.appendChild(red)
    return red
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }