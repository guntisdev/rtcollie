export function createUser(container: HTMLDivElement) {
    document.title = 'User'
    container.innerHTML = `<p>user</p>`

    init(container)
}


import { createWebSocketSignaling } from '../utils/signaling'
import { createPeerConnection } from '../utils/webrtc'

async function init(container: HTMLDivElement) {
  // Set up WebSocket signaling
  const signaling = await createWebSocketSignaling('user');
  const peerConnection = createPeerConnection(signaling);

  signaling.onMessage(async (message: any) => {
    if (message.type === 'offer') {
      console.log('onmessage from broadcaster', message);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      signaling.send({ type: 'answer', answer });
    } else if (message.type === 'candidate') {
      console.log("ICE candidate from broadcast", message);
      await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  });

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
        console.log("send ice candidate")
        signaling.send({
            type: "candidate",
            candidate: event.candidate,
        });
    }
  }

  // Handle the incoming video stream
  peerConnection.ontrack = (event) => {
    console.log('on video received', event)
    const videoElement = document.createElement('video');
    videoElement.srcObject = event.streams[0];
    videoElement.autoplay = true;
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    container.appendChild(videoElement);
    videoElement.addEventListener('click', () => videoElement.play())

    // Enable mouse tracking and clicking once the video is displayed
    enableMouseTracking(videoElement);
  };

  // Listen for the data channel from the broadcaster
  peerConnection.ondatachannel = (event) => {
    console.log("user ondatachannel: ", event)
    const dataChannel = event.channel;

    // Enable sending mouse coordinates and clicks
    setupMouseSender(dataChannel);
  };

  console.log('Waiting for video stream...');
}

// Enable mouse tracking and clicking
function enableMouseTracking(videoElement: HTMLVideoElement) {
  videoElement.addEventListener('mousemove', (event) => {
    const rect = videoElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const data = { x: Math.round(x), y: Math.round(y), click: false };
    sendMouseData(data);
  });

  videoElement.addEventListener('click', (event) => {
    const rect = videoElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const data = { x: Math.round(x), y: Math.round(y), click: true };
    sendMouseData(data);
  });

  console.log('Mouse tracking enabled');
}

// Sends mouse data through the data channel
let mouseDataChannel: RTCDataChannel | null = null;

function setupMouseSender(dataChannel: RTCDataChannel) {
  mouseDataChannel = dataChannel;
  console.log('Data channel established for mouse input');
}

function sendMouseData(data: { x: number; y: number; click: boolean }) {
  if (mouseDataChannel && mouseDataChannel.readyState === 'open') {
    mouseDataChannel.send(JSON.stringify(data));
  }
}
