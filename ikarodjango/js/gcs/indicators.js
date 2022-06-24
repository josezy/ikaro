import React from 'react'
import { reduxify } from '@/util/reduxify'
import { createSelector } from 'reselect'

import Draggable from 'react-draggable';

const Attitude = reduxify({
    mapStateToProps: (state, props) => ({
        roll: createSelector(
            state => state.mavlink.ATTITUDE,
            ATTITUDE => ATTITUDE && ATTITUDE.roll * 180 / 3.14159,
        )(state),
        pitch: createSelector(
            state => state.mavlink.ATTITUDE,
            ATTITUDE => ATTITUDE && ATTITUDE.pitch * 180 / 3.14159,
        )(state),
    }),
    mapDispatchToProps: {},
    render: ({ roll, pitch }) => {
        let _pitch = pitch
        if (_pitch > 30) _pitch = 30
        else if (_pitch < -30) _pitch = -30

        _pitch *= 0.7

        return <span id="attitude">
            <div className="instrument attitude">
                {/* <img src="/static/img/indicators/fi_box.svg" className="background box" /> */}
                <div className="roll box" style={{ transform: `rotate(${roll}deg)` }}>
                    <img src="/static/img/indicators/horizon_back.svg" className="box" />
                    <div className="pitch box" style={{ top: `${_pitch}%` }}>
                        <img src="/static/img/indicators/horizon_ball.svg" className="box" />
                    </div>
                    <img src="/static/img/indicators/horizon_circle.svg" className="box" />
                </div>
                <div className="mechanics box">
                    <img src="/static/img/indicators/horizon_mechanics.svg" className="box" />
                    <img src="/static/img/indicators/fi_circle.svg" className="box" />
                </div>
            </div>
        </span>
    }
})


const Heading = reduxify({
    mapStateToProps: (state, props) => ({
        heading: createSelector(
            state => state.mavlink.VFR_HUD,
            VFR_HUD => VFR_HUD && VFR_HUD.heading
        )(state),
    }),
    mapDispatchToProps: {},
    render: ({ heading }) => <span id="heading">
        <div className="instrument heading">
            {/* <img src={`${images_path}/fi_box.svg`} className="background box" /> */}
            <div className="heading box">
                <img src="/static/img/indicators/heading_yaw.svg" className="box" />
            </div>
            <div className="mechanics box" style={{ transform: `rotate(${heading}deg)` }}>
                <img src="/static/img/indicators/heading_mechanics.svg" className="box" />
                <img src="/static/img/indicators/fi_circle.svg" className="box" />
            </div>
        </div>
    </span>
})

export const Indicators = () => <>

    <div style={{ position: 'absolute', right: 0 }}>
        <Draggable handle=".indicator-container">
            <div className="indicator-container">
                <Attitude />
                <Heading />
            </div>
        </Draggable>
    </div>
</>
