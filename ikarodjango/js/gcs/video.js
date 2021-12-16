import React, { useEffect, useRef, useState } from 'react'
import { Janus } from 'janus-videoroom-client'


const client = new Janus({
    url: global.props.JANUS_ENDPOINT,
    token: '123456789',
});

const pc_create_negotiate = async (publisher, onTrack) => {
    const pc = new RTCPeerConnection({ sdpSemantics: 'unified-plan' });
    pc.addEventListener('track', onTrack);

    pc.setRemoteDescription({ sdp: publisher.listenerHandle.getOffer(), type: "offer" });

    pc.addTransceiver('video', { direction: 'recvonly' });
    // pc.addTransceiver('audio', { direction: 'recvonly' });

    await pc.createAnswer().then((answer) => pc.setLocalDescription(answer)).then(() => {
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
    }).then(() => publisher.listenerHandle.setRemoteAnswer(pc.localDescription.sdp))

    console.log("ANSWERD SEND VIDEO IS STARTING...")
}

export const VideoVisor = () => {
    const videoRef = useRef(null)

    // const room_id = window.location.pathname.slice(-8)
    const room_id = '1234'

    const onTrack = (evt) => {
        console.log(evt.track.kind, evt.streams[0])
        if (evt.track.kind === 'video') {
            if (videoRef.current) videoRef.current.srcObject = evt.streams[0]
        }
        // if (evt.track.kind === 'audio') {
        //     document.getElementById('audio_id').srcObject = evt.streams[0];
        // }
    }

    useEffect(() => {
        if (!room_id) return
        client.onConnected(() => {
            client.createSession().then((session) => {
                console.log("Session created, room id:", room_id)
                session.videoRoom().getFeeds(room_id).then((feeds) => {
                    if (feeds.length == 0) return console.warn("No feeds for room:", room_id)
                    console.log("Feeds:", feeds)
                    session.videoRoom().listenFeed(room_id, feeds[0]).then((listenerHandle) => {
                        console.log("listenerHandle", listenerHandle)
                        setTimeout(() => pc_create_negotiate({ listenerHandle }, onTrack), 1000)
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
        <div className="video-container-fullscreen">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="video-elem-fullscreen"
                poster="/static/img/no-signal.gif"
            ></video>
            {/* <audio id={'audio_id'} autoPlay={true}></audio> */}
        </div>
    )
}

