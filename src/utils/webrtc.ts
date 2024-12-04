export function createPeerConnection(signaling: any) {
    const peerConnection = new RTCPeerConnection()
  
    // peerConnection.onicecandidate = (event) => {
    //     if (event.candidate) {
    //         signaling.send({ type: 'ice-candidate', candidate: event.candidate });
    //     }
    // }
  
    // signaling.onMessage((message: any) => {
    //     if (message.type === 'offer') {
    //         console.log("offer", message)
    //         peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
    //         peerConnection.createAnswer().then((answer) => {
    //         peerConnection.setLocalDescription(answer);
    //         signaling.send({ type: 'answer', answer });
    //         });
    //     } else if (message.type === 'ice-candidate') {
    //         console.log('ice-candidate', message)
    //         peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
    //     }
    // })
  
    return peerConnection;
  }
  