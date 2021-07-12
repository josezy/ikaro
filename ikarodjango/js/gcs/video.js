import React, { useEffect } from 'react'
import { Janus } from 'janus-videoroom-client'


export const VideoVisor = (props) => {
    const client = new Janus({
        url: process.env.JANUS_SERVER || 'wss://ikaro.tucanorobotics.co/video/',
        token: '123456789',
    })

    const pc = new RTCPeerConnection({
        sdpSemantics: 'unified-plan',
    })

    useEffect(() => {
        const listen_feed = (listenerHandle) => {
            // Start negotiation
            pc.setRemoteDescription({
                sdp: listenerHandle.getOffer(),
                type: "offer"
            })
            pc.addTransceiver('video', { direction: 'recvonly' })
            // pc.addTransceiver('audio', {direction: 'recvonly'})

            pc.createAnswer().then(answer => pc.setLocalDescription(answer)).then(async () => {
                // wait for ICE gathering to complete
                return new Promise((resolve) => {
                    if (pc.iceGatheringState === 'complete') {
                        resolve()
                    } else {
                        function checkState() {
                            if (pc.iceGatheringState === 'complete') {
                                pc.removeEventListener('icegatheringstatechange', checkState)
                                resolve()
                            }
                        }
                        pc.addEventListener('icegatheringstatechange', checkState)
                    }
                });
            }).then(() => listenerHandle.setRemoteAnswer(pc.localDescription.sdp).then(() => console.log("ANSWERD SEND VIDEO IS STARTING...")))
        }

        const session_created = async (session) => {
            console.log("CREATING SESSION")
            session.videoRoom().getFeeds(props.room).then((feeds) => {
                if (feeds.length === 0) return console.log("NO FEEDS ON THIS ROOM")
                session.videoRoom().listenFeed(props.room, feeds[0]).then(listen_feed)
            })
        }

        const client_connected = async () => {
            client.createSession().then(session_created).catch((err) => console.log("SOME ERROR", err))
        }

        client.onConnected(client_connected)
        client.onDisconnected(() => console.log("Disconnected"))
        client.onError((err) => console.log("Error", err))

        pc.addEventListener('track', (evt) => {
            console.log(evt.track.kind, evt.streams[0], props.room)
            if (evt.track.kind === 'video') {
                document.getElementById(props.room).srcObject = evt.streams[0]
            }
            // if (evt.track.kind === 'audio' && evt.streams[0]) {
            //     document.getElementById(audio_id).srcObject = evt.streams[0]
            // }
        })

        client.connect()
    }, [])

    return (
        <div id='draggable-video' style={{
            position: "absolute",
            zIndex: 19,
            backgroundColor: "#f1f1f1",
            border: "1px solid #d3d3d3",
            textAlign: "center"
        }}>
            <div style={{
                padding: "10px",
                cursor: "move",
                zIndex: 20,
                backgroundColor: "#2196F3",
                color: "#fff"
            }}>Click here to move</div>
            <video id={props.room} autoPlay muted></video>
            {/* <audio id={props.audio_id} autoPlay={true}></audio> */}
        </div>
    )
}

window.addEventListener('load', () => {
    const elem = document.getElementById("draggable-video")
    if (elem) dragElement(elem)
})

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
