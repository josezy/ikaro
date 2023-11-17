import React, { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
// import Joystick from 'react-joystick'

import { RC_CHANNELS_OVERRIDE_INTERVAL, MAX_THROTTLE, MIN_THROTTLE, ROLL_LEFT, ROLL_RIGHT, ROLL_NEUTRAL } from '@/util/constants'
import { rover_rc_channels_override } from '@/reducers/mavlink'


// ====================[[ Keyboard ]]=====================
const VALID_KEYS = ['w', 'a', 's', 'd']

export const KeyboardControl = (props) => {
    const dispatch = useDispatch()
    const [keys, setKeys] = useState(
        VALID_KEYS.reduce((acc, key) => ({ ...acc, [key]: false }), {})
    )
    const stateRef = useRef()
    stateRef.current = keys

    const dispatchOverrides = () => {
        const _keys = stateRef.current
        dispatch(rover_rc_channels_override(
            _keys.w != _keys.s ? MAX_THROTTLE : MIN_THROTTLE, // throttle
            _keys.a ? ROLL_LEFT : _keys.d ? ROLL_RIGHT : ROLL_NEUTRAL, // roll
            !_keys.s // direction
        ))
    }

    const keyHandler = (event) => {
        if (VALID_KEYS.includes(event.key)) {
            setKeys(oldKeys => {
                if (event.type === 'keydown' && oldKeys[event.key]) return oldKeys // Ignore repeated keydown events
                return {
                    ...oldKeys,
                    [event.key]: event.type === 'keydown'
                }
            })
        }
    }

    useEffect(dispatchOverrides, [keys]) // Dispatch overrides on key change

    useEffect(() => {
        window.addEventListener('keydown', keyHandler)
        window.addEventListener('keyup', keyHandler)
        const interval = setInterval(dispatchOverrides, RC_CHANNELS_OVERRIDE_INTERVAL)

        return () => {
            window.removeEventListener('keydown', keyHandler)
            window.removeEventListener('keyup', keyHandler)
            clearInterval(interval)
        }
    }, [])

    return (
        <div className='m-auto'>
            <b>W: </b>Forward / <b>S: </b>Backwards<br />
            <b>A: </b>Turn left / <b>D: </b>Turn right<br />
            {/* <b>E: </b>Aumentar aceleración<br /> */}
            {/* <b>Q: </b>Disminuir aceleración<br /> */}
        </div>
    )
}

// ====================[[ Joystick ]]=====================


// const joyOptions = {
//     mode: 'semi',
//     color: 'white',
//     size: 75,
//     restOpacity: 10
// }
// const joyStyles = {
//     position: 'relative',
//     opacity: '100%',
//     background: 'rgba(255, 255, 255, 0.0)',
//     borderRadius: '50%',

//     height: '1vh',
//     width: '1vw',
//     marginBottom: '20px'
// }

// export const JoystickControl = React.forwardRef((props, ref) => {


//     const [showGuide, setShowGuide] = React.useState('manual-control-virtual-joystick')
//     const handleMove = (stick) => {
//         let throttle_range = Math.abs(props.vehicleParams.throttleParams.maxPwm - props.vehicleParams.throttleParams.minPwm)
//         let roll_range = Math.abs(props.vehicleParams.rollParams.maxPwm - props.vehicleParams.rollParams.minPwm)
//         let stick_radius = stick.distance / 50
//         let angle_percentage = stick.angle.degree


//         if (props.takeControlFlag) {
//             if (angle_percentage > 180) {
//                 angle_percentage = 1 - (angle_percentage - 180) / 180

//                 props.vehicleParams.throttleParams.orientation = 1
//             } else {
//                 angle_percentage = angle_percentage / 180
//                 props.vehicleParams.throttleParams.orientation = 0

//             }
//             props.vehicleParams.throttleParams.throttle = Math.floor(props.vehicleParams.throttleParams.minPwm + stick_radius * throttle_range)
//             props.vehicleParams.rollParams.roll = Math.floor(props.vehicleParams.rollParams.maxPwm - angle_percentage * roll_range)

//         }
//         console.log(props.takeControlFlag, "JOYYYYYYYYSTIK!!")

//     }
//     const handleStop = () => {
//         props.vehicleParams.throttleParams.throttle = 1100
//         props.vehicleParams.throttleParams.orientation = 2
//         props.vehicleParams.rollParams.roll = 1500

//     }
//     function managerListener(manager) {
//         manager.on('move', (e, stick) => {
//             handleMove(stick)
//         })
//         manager.on('click', () => {
//         })
//         manager.on('end', () => {
//             handleStop()
//         })
//     }
//     return <div className='manual-control-virtual-joystick-contanier'>

//         <div className={showGuide} onClick={_ => setShowGuide("manual-control-virtual-joystick-transparent")}>
//             <Joystick containerStyle={joyStyles} options={joyOptions} managerListener={managerListener} />

//         </div>

//     </div>
// });
