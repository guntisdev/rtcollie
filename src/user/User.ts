import { createWebSocketSignaling } from '../utils/signaling'
import { createPeerConnection } from '../utils/webrtc'

export function createUser(container: HTMLDivElement) {
    document.title = 'User'
    init(container)
}


async function init(container: HTMLDivElement) {
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
    })

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            console.log("send ice candidate")
            signaling.send({ type: "candidate", candidate: event.candidate })
        }
    }

    let dataChannel: RTCDataChannel
    peerConnection.ondatachannel = (event) => {
        console.log("user ondatachannel")
        dataChannel = event.channel;

        dataChannel.onopen = () => {
            console.log("Data channel is open on user")
        }
    }

    const videoTag = document.createElement('video')
    peerConnection.ontrack = (event) => {
        console.log('on video received', event)
        videoTag.srcObject = event.streams[0]
        videoTag.autoplay = true
        videoTag.style.width = '100%'
        videoTag.style.height = '100%'
        container.innerHTML = ''
        container.appendChild(videoTag)
        videoTag.addEventListener('click', () => videoTag.play())
    }

    videoTag.addEventListener("click", event => {
        const rect = videoTag.getBoundingClientRect()
        const displayWidth = rect.width
        const displayHeight = rect.height
    
        // const actualWidth = videoTag.videoWidth
        // const actualHeight = videoTag.videoHeight
    
        const clickX = event.clientX - rect.left
        const clickY = event.clientY - rect.top
    
        const x = clickX * (window.innerWidth / displayWidth)
        const y = clickY * (window.innerHeight / displayHeight)
    
        console.log(`Mouse clicked x:${x}, y:${y}, ${clickX}x${clickY}`)

        dataChannel.send(JSON.stringify({ x: x, y: y }))
    })

    console.log('Waiting for video stream...')
}
