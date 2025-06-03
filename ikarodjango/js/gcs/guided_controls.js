import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
// import Joystick from 'react-joystick'

import { RC_CHANNELS_OVERRIDE_INTERVAL, MAX_THROTTLE, MIN_THROTTLE, ROLL_LEFT, ROLL_RIGHT, ROLL_NEUTRAL } from '@/util/constants'
import { rover_rc_channels_override, set_servo_trim } from '@/reducers/mavlink'


// ====================[[ Keyboard ]]=====================
const VALID_KEYS = ['w', 'a', 's', 'd']

export const KeyboardControl = (props) => {
    const dispatch = useDispatch()
    const [keys, setKeys] = useState(
        VALID_KEYS.reduce((acc, key) => ({ ...acc, [key]: false }), {})
    )

    // Internal PWM value for throttle
    const [maxThrottle, setMaxThrottle] = useState(MAX_THROTTLE / 2)

    // User-friendly display values
    const [servo1TrimDisplay, setServo1TrimDisplay] = useState(pwmToNormalized(1500))
    const [servo2TrimDisplay, setServo2TrimDisplay] = useState(pwmToNormalized(1500))
    const [maxThrottleDisplay, setMaxThrottleDisplay] = useState(pwmToThrottlePercent(MAX_THROTTLE / 2))

    // Keyboard state reference for interval access
    const keysRef = useRef()
    keysRef.current = keys

    // Values reference for interval access
    const valuesRef = useRef({
        maxThrottle: MAX_THROTTLE / 2
    })

    // Keep throttle ref in sync with state
    useEffect(() => {
        valuesRef.current.maxThrottle = maxThrottle
    }, [maxThrottle])

    // Convert PWM (1000-2000) to normalized (-1.00 to 1.00)
    function pwmToNormalized(pwm) {
        return ((pwm - 1500) / 500).toFixed(2)
    }

    // Convert normalized (-1.00 to 1.00) to PWM (1000-2000)
    function normalizedToPwm(normalized) {
        return Math.round(1500 + (normalized * 500))
    }

    // Convert PWM throttle to percentage (0-100%)
    function pwmToThrottlePercent(pwm) {
        return Math.round((pwm / MAX_THROTTLE) * 100)
    }

    // Convert percentage (0-100%) to PWM throttle
    function throttlePercentToPwm(percent) {
        return Math.round((percent / 100) * MAX_THROTTLE)
    }

    const dispatchOverrides = useCallback(() => {
        const currentKeys = keysRef.current
        const currentThrottle = valuesRef.current.maxThrottle

        dispatch(rover_rc_channels_override(
            currentKeys.w !== currentKeys.s ? currentThrottle : MIN_THROTTLE, // throttle
            currentKeys.a ? ROLL_LEFT : currentKeys.d ? ROLL_RIGHT : ROLL_NEUTRAL, // roll
            !currentKeys.s // direction
        ))
    }, [dispatch])

    const keyHandler = (event) => {
        if (VALID_KEYS.includes(event.key)) {
            setKeys(oldKeys => {
                // Ignore repeated keydown events
                if (event.type === 'keydown' && oldKeys[event.key]) return oldKeys

                return {
                    ...oldKeys,
                    [event.key]: event.type === 'keydown'
                }
            })
        }
    }

    // Send commands when keys change
    useEffect(() => {
        dispatchOverrides()
    }, [keys, dispatchOverrides])

    useEffect(() => {
        window.addEventListener('keydown', keyHandler)
        window.addEventListener('keyup', keyHandler)
        const interval = setInterval(dispatchOverrides, RC_CHANNELS_OVERRIDE_INTERVAL)

        return () => {
            window.removeEventListener('keydown', keyHandler)
            window.removeEventListener('keyup', keyHandler)
            clearInterval(interval)
        }
    }, [dispatchOverrides])

    const handleServoTrimChange = (servoNum, e) => {
        const displayValue = parseFloat(e.target.value)
        if (!isNaN(displayValue)) {
            // Convert from normalized display value to internal PWM value
            const pwmValue = normalizedToPwm(displayValue)

            if (servoNum === 1) {
                setServo1TrimDisplay(displayValue)
            } else if (servoNum === 2) {
                setServo2TrimDisplay(displayValue)
            }

            // Send servo trim command to vehicle
            dispatch(set_servo_trim(servoNum, pwmValue))
        }
    }

    const handleMaxThrottleChange = (e) => {
        const percentValue = parseInt(e.target.value)
        if (!isNaN(percentValue)) {
            // Convert from percentage to internal PWM value
            const pwmValue = throttlePercentToPwm(percentValue)

            setMaxThrottle(pwmValue)
            setMaxThrottleDisplay(percentValue)
            valuesRef.current.maxThrottle = pwmValue
        }
    }

    return (
        <div className='text-white w-100 d-flex flex-column align-items-center'>
            <div>
                <b>W: </b>Forward / <b>S: </b>Backwards<br />
                <b>A: </b>Turn left / <b>D: </b>Turn right
            </div>
            <div className="mt-2 d-flex justify-content-around w-100">
                <div className="mb-3 d-flex flex-column">
                    <label className="mb-1 text-gray-300">Servo 1 Trim</label>
                    <div className="d-flex align-items-center">
                        <input
                            type="number"
                            value={servo1TrimDisplay}
                            onChange={(e) => handleServoTrimChange(1, e)}
                            className="px-2 py-1 w-20 rounded text-black"
                            min="-1.00"
                            max="1.00"
                            step="0.05"
                        />
                    </div>
                </div>
                <div className="mb-3 d-flex flex-column">
                    <label className="mb-1 text-gray-300">Servo 2 Trim</label>
                    <div className="d-flex align-items-center">
                        <input
                            type="number"
                            value={servo2TrimDisplay}
                            onChange={(e) => handleServoTrimChange(2, e)}
                            className="px-2 py-1 w-20 rounded text-black"
                            min="-1.00"
                            max="1.00"
                            step="0.05"
                        />
                    </div>
                </div>
                <div className="mb-3 d-flex flex-column">
                    <label className="mb-1 text-gray-300">Max Throttle</label>
                    <div className="d-flex align-items-center">
                        <input
                            type="number"
                            value={maxThrottleDisplay}
                            onChange={handleMaxThrottleChange}
                            className="px-2 py-1 w-20 rounded text-black"
                            min="0"
                            max="100"
                            step="5"
                        />
                    </div>
                </div>
            </div>
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
