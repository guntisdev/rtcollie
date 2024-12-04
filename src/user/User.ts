import { createWebSocketSignaling } from '../utils/signaling'
import { createPeerConnection } from '../utils/webrtc'

export function createUser(container: HTMLDivElement) {
    document.title = 'User'
    // container.innerHTML = `<p>user</p>`
    init(container)
}


async function init(container: HTMLDivElement) {
    console.log("init user")
    const signaling = await createWebSocketSignaling('user');
    const peerConnection = createPeerConnection(signaling);

    signaling.onMessage(async (message: any) => {
        if (message.type === 'offer') {
            console.log('onmessage from broadcaster', message);
            await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            signaling.send({ type: 'answer', answer });
        }
        // else if (message.type === 'candidate') {
        //     console.log("ICE candidate from broadcast", message);
        //     await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
        // }
    })

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            console.log("send ice candidate")
            signaling.send({ type: "candidate", candidate: event.candidate })
        }
    }

    // let dataChannel: RTCDataChannel
    peerConnection.ontrack = (event) => {
        console.log('on video received', event)
        const videoElement = document.createElement('video')
        videoElement.srcObject = event.streams[0]
        videoElement.autoplay = true
        videoElement.style.width = '100%'
        videoElement.style.height = '100%'
        container.innerHTML = ''
        container.appendChild(videoElement)
        videoElement.addEventListener('click', () => videoElement.play())

        // enableMouseTracking(videoElement);
        // dataChannel = peerConnection.createDataChannel("mouse-coordinates");
    };

    console.log('Waiting for video stream...')
}
