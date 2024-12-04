import { createWebSocketSignaling } from '../utils/signaling'
import { createPeerConnection } from '../utils/webrtc'

export function createBroadcast(container: HTMLDivElement) {
    document.title = 'Broadcast'
    container.innerHTML = `<p>broadcast</p>`

    init()
}


async function init() {
    const signaling = await createWebSocketSignaling('broadcast');
    const peerConnection = createPeerConnection(signaling);

    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
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
        } else if (message.type === 'candidate') {
            console.log("ICE candidate from user", message);
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
    };
}


function handleMouseInput(data: string) {
  try {
    const { x, y, click } = JSON.parse(data);

    // Simulate mouse movement (optional)
    console.log(`Mouse moved to (${x}, ${y})`);

    if (click) {
      console.log('Mouse clicked');
      // Simulate a click action
      // Example: Trigger an element interaction (if needed)
      const element = document.elementFromPoint(x, y) as HTMLElement;
      if (element) {
        element.click();
        console.log('Element clicked:', element);
      }
    }
  } catch (error) {
    console.error('Invalid mouse input data:', data, error);
  }
}
