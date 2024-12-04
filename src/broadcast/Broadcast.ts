import { createWebSocketSignaling } from '../utils/signaling'
import { createPeerConnection } from '../utils/webrtc'

export function createBroadcast(container: HTMLDivElement) {
    document.title = 'Broadcast'
    document.body.style.backgroundColor = '#ccc'
    // document.body.style.cursor = 'none'
    container.innerHTML = `<p>broadcast</p>`

    init()
}


async function init() {
    const signaling = await createWebSocketSignaling('broadcast');
    const peerConnection = createPeerConnection(signaling);

    // @ts-ignore
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true, preferCurrentTab: true,  });
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    console.log("Stream added. send to:", peerConnection.getSenders().length);

    // Create an offer for the user client
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
    });

    // peerConnection.onicecandidate = event => {
    //     if (event.candidate) {
    //         console.log("send ice candidate")
    //         signaling.send({ type: "candidate", candidate: event.candidate })
    //     }
    // }

    // let dataChannel: RTCDataChannel
    // peerConnection.ondatachannel = (event) => {
    //     dataChannel = event.channel;

    //     dataChannel.onopen = () => {
    //         console.log("Data channel is open on user broadcast");
    //     }
    // }
}
