import React, { useEffect, useRef } from 'react'
import { Janus } from 'janus-videoroom-client'


const pc_create_negotiate = async (listenerHandle, onTrack) => {
    const pc = new RTCPeerConnection({ sdpSemantics: 'unified-plan' });
    pc.addEventListener('track', onTrack);
    pc.setRemoteDescription({ sdp: listenerHandle.getOffer(), type: "offer" });
    pc.addTransceiver('video', { direction: 'recvonly' });
    // pc.addTransceiver('audio', { direction: 'recvonly' });

    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    await new Promise((resolve) => {
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
    await listenerHandle.setRemoteAnswer(pc.localDescription.sdp)
}

export const VideoVisor = () => {
    const videoRef = useRef(null)

    const client = new Janus({
        url: global.props.JANUS_ENDPOINT,
        token: '123456789',
    });

    // const room_id = window.location.pathname.slice(-8)
    const room_id = '1234'

    const onTrack = (evt) => {
        if (evt.track.kind === 'video') {
            if (videoRef.current) videoRef.current.srcObject = evt.streams[0]
        }
        // if (evt.track.kind === 'audio') {
        //     document.getElementById('audio_id').srcObject = evt.streams[0];
        // }
    }

    useEffect(() => {
        if (!room_id) return

        client.onConnected(async () => {
            const session = await client.createSession()
            const feeds = await session.videoRoom().getFeeds(room_id)
            if (feeds.length == 0) return console.log("No feeds for room:", room_id)

            const listenerHandle = await session.videoRoom().listenFeed(room_id, feeds[0])
            pc_create_negotiate(listenerHandle, onTrack)
        });
        client.onDisconnected(() => console.log("DISCONNECTED"));
        client.onError((err) => console.log("ERROR", err));
        client.connect();
    }, [])

    return (
        <div className="video-container">
            <video
                ref={videoRef}
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

