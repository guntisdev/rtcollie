import { createWebSocketSignaling } from '../utils/signaling'
import { createPeerConnection } from '../utils/webrtc'

export function createBroadcast(container: HTMLDivElement) {
    document.title = 'Broadcast'
    document.body.style.backgroundColor = '#ccc'
    // document.body.style.cursor = 'none'
    container.innerHTML = `<p>broadcast</p>`

    init(container)
}


async function init(container: HTMLDivElement) {
    const signaling = await createWebSocketSignaling('broadcast');
    const peerConnection = createPeerConnection(signaling);

    // @ts-ignore
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false, preferCurrentTab: true,  });
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    console.log("Stream added. send to:", peerConnection.getSenders().length);

    const dataChannel = peerConnection.createDataChannel("mouse-coordinates");
 
    dataChannel.onopen = () => {
        console.log("Data channel for broadcast is open!");
    }
    
    dataChannel.onmessage = (event) => {
        const { x, y } = JSON.parse(event.data);
        console.log(`Received x:${x}, y:${y}`);
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
