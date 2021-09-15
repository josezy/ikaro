import React, { useEffect } from 'react'
import { Janus } from 'janus-videoroom-client'


const client = new Janus({
    url: 'ws://localhost:8188',
    // url: process.env.JANUS_SERVER || 'wss://ikaro.tucanorobotics.co/video/',
    token: '123456789',
});

const pc_create_negotiate = (publisher) => {
    const pc = new RTCPeerConnection({ sdpSemantics: 'unified-plan' });
    pc.addEventListener('track', (evt) => {
        console.log(evt.track.kind, evt.streams[0])
        if (evt.track.kind === 'video') {
            document.getElementById('video_id').srcObject = evt.streams[0];

        }
        // if (evt.track.kind === 'audio') {
        //     document.getElementById('audio_id').srcObject = evt.streams[0];
        // }
    });

    pc.setRemoteDescription({ sdp: publisher.listenerHandle.getOffer(), type: "offer" });

    pc.addTransceiver('video', { direction: 'recvonly' });
    // pc.addTransceiver('audio', { direction: 'recvonly' });

    pc.createAnswer().then((answer) => {
        console.log("CREATING ANSWER")
        return pc.setLocalDescription(answer);
    }).then(() => {
        // wait for ICE gathering to complete
        return new Promise((resolve) => {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                const checkState = () => {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                }
                pc.addEventListener('icegatheringstatechange', checkState);
            }
        });
    }).then(() => {
        publisher.listenerHandle.setRemoteAnswer(pc.localDescription.sdp).then(() => {
            console.log("ANSWERD SEND VIDEO IS STARTING...")
        });
    })
}

export const VideoVisor = () => {
    const room = '1234'

    useEffect(() => {
        // var JanusClient = require('janus-videoroom-client').Janus;

        // if (this.props.token)
        //     janus_props_session.token = this.props.token

        // var client = new JanusClient(janus_props_session);

        client.onConnected(() => {
            client.createSession().then((session) => {
                console.log("CREATING SESSION", session)
                session.videoRoom().getFeeds(room).then((feeds) => {
                    if (feeds.length == 0) return console.warn("no feeds")
                    console.log("FEEDS", room, feeds)
                    session.videoRoom().listenFeed(room, feeds[0]).then((listenerHandle) => {
                        console.log("listenerHandle", listenerHandle)
                        setTimeout(() => pc_create_negotiate({ listenerHandle }), 3000)
                    });
                })

            }).catch((err) => {
                console.log("SOME ERROR", err)
            })
        });

        client.onDisconnected(() => {
            console.log("DISCONNECTED")
        });
        client.onError((err) => {
            console.log("ERROR", err)
        });

        client.connect();
    }, [])

    return (
        <div className="video-container">
            <video
                id="video_id"
                autoPlay
                muted
                playsInline
                className="video-elem"
                poster="/static/img/no-signal.gif"
            ></video>
            {/* <audio id={'audio_id'} autoPlay={true}></audio> */}
        </div>
    )
}

