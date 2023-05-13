import React, { useState, useEffect } from 'react'
import { reduxify } from '@/util/reduxify'
import { createSelector } from 'reselect'

import { Button } from 'react-bootstrap'
import { Modal } from 'antd'

import { send_mavmsg } from '@/reducers/mavlink'
import { RC_CHANNELS_OVERRIDE_INTERVAL, MANUAL_CONTROL_TYPES, MANUAL_CONTROL_TYPES_OPTIONS } from '@/util/constants'
import { JoystickControls, DoubleJoystickControls } from '@/gcs/manual_control/virtual_joystick.js';
import { KeyboardControl } from '@/gcs/manual_control/keyboard.js';
import { flightmode_from_heartbeat } from '@/util/mavutil'

import Select from 'react-select';




export const ManualControl = reduxify({
    mapStateToProps: (state, props) => ({
        takeControlFlag: props.takeControlFlag,
        ctrlSelected: props.ctrlSelected,
        target_system: state.mavlink.target_system,
        target_component: state.mavlink.target_component,
        armed: createSelector(
            state => state.mavlink.HEARTBEAT,
            HEARTBEAT => HEARTBEAT && Boolean(HEARTBEAT.base_mode & 10 ** 7)
        )(state),
        flight_mode: createSelector(
            state => state.mavlink.HEARTBEAT,
            HEARTBEAT => HEARTBEAT && flightmode_from_heartbeat(HEARTBEAT)
        )(state),
        raw_imu: createSelector(
            state => state.mavlink.RAW_IMU,
            RAW_IMU => RAW_IMU && {
                xacc: RAW_IMU.xacc,
                yacc: RAW_IMU.yacc,
                zacc: RAW_IMU.zacc,
            }
        )(state),
    }),
    mapDispatchToProps: { send_mavmsg },
    render: (props) => <ManualControlComponent {...props} />
})

const ManualControlComponent = ({
    takeControlFlag,
    ctrlSelected,
    send_mavmsg,
    target_system,
    target_component,
    armed,
    flight_mode
}) => {

    const [roll, setRoll] = useState(1500)
    const [throttle, setThrottle] = useState(1000)
    const [orientation, setOrientation] = useState(0)
    const [vehicleParams, setVehicleParams] = useState(
        {

            throttleParams: {
                throttle: 1100,//Current throttle value
                maxThrottle: 1100, // Max throttle value
                throttleStep: 50,
                maxPwm: 1800,
                minPwm: 1100,
                orientation: 2
            },
            rollParams: {
                roll: 1500,
                rollLeft: 1900, //(1500-1900]
                rollRight: 1100, //[1100-1500)
                maxPwm: 1900,
                minPwm: 1100
            },
            servoTrimParams: {
                servo1: 1500,
                servo2: 1500,
                pwmStep: 50,
                maxPwm: 1900,
                minPwm: 1100
            }
        }
    )

    let controller = "NO CONTROLS"
    if (ctrlSelected[0]) {
        switch (ctrlSelected[0].value) {
            case MANUAL_CONTROL_TYPES.KEYBOARD:
                controller = <KeyboardControl takeControlFlag={takeControlFlag[0]} vehicleParams={vehicleParams} />
                break;
            case MANUAL_CONTROL_TYPES.JOYSTICK:
                controller = <JoystickControls takeControlFlag={takeControlFlag[0]} vehicleParams={vehicleParams} />
                break;
            case MANUAL_CONTROL_TYPES.DOUBLE_JOYSTICK:
                controller = <DoubleJoystickControls takeControlFlag={takeControlFlag[0]} vehicleParams={vehicleParams} />
                break;
            default:
                console.log("NONE")
                break;
        }
    }

    const setServoTrim = (pwm, servo) => {
        let param_id = 'SERVO1_TRIM';
        if (servo == 2) {
            param_id = 'SERVO2_TRIM';
        }
        send_mavmsg('PARAM_SET', {
            target_system,
            target_component,
            param_id: param_id,
            param_value: pwm,
            param_type: 4
        })
    }

    const move = (roll, throttle, orientation) => {
        let ch7_raw = 2000;
        let ch8_raw = 2000

        if (orientation == 1) {
            ch7_raw = 1000;
            ch8_raw = 2000;
        } else if (orientation == 0) {
            ch7_raw = 2000;
            ch8_raw = 1000;
        }

        send_mavmsg('RC_CHANNELS_OVERRIDE', {
            target_system,
            target_component,
            chan1_raw: roll,
            chan2_raw: 0,
            chan3_raw: throttle,
            chan4_raw: 0,
            chan5_raw: 0,
            chan6_raw: 0,
            chan7_raw: ch7_raw,
            chan8_raw: ch8_raw,
        })

    }

    const doMove = async () => {
        if (takeControlFlag[0]) {

            setThrottle(vehicleParams.throttleParams.throttle)
            setOrientation(vehicleParams.throttleParams.orientation)
            setRoll(vehicleParams.rollParams.roll)
            move(roll, throttle, orientation)
            console.log(roll, throttle, orientation)
        }

        //move(roll, throttle, orientation)
    }
    useEffect(() => {

        const interval = setInterval(doMove, RC_CHANNELS_OVERRIDE_INTERVAL);

        return () => {
            clearInterval(interval);
        }
    }, [takeControlFlag, roll, throttle, orientation, armed, flight_mode, target_system])


    return (
        <div className='manual-control-container'>
            <div className='manual-control-inner'>
                <div className='manual-control-inner-info'>
                    Throttle: {throttle ? throttle : '--'}
                    <br />

                    Roll: {roll ? roll : '--'}
                    <br />

                    Orientation: {orientation ? orientation : '--'}
                </div>
                {controller}

            </div>

        </div>
    )
}

export const ManualControlPanel = reduxify({
    mapStateToProps: (state, props) => ({
        takeControlFlag: props.takeControlFlag,
        ctrlSelected: props.ctrlSelected,
        target_system: state.mavlink.target_system,
        target_component: state.mavlink.target_component,
        armed: createSelector(
            state => state.mavlink.HEARTBEAT,
            HEARTBEAT => HEARTBEAT && Boolean(HEARTBEAT.base_mode & 10 ** 7)
        )(state)
    }),
    mapDispatchToProps: { send_mavmsg },
    render: (props) => <ManualControlPanelComponent {...props} />
})

const ManualControlPanelComponent = ({ takeControlFlag, ctrlSelected, send_mavmsg, target_system, target_component, armed }) => {

    const [showKeyBoardControlls, setShowKeyBoardControlls] = useState("manual-control-keyboard-hidden")
    const [showModal, setShowModal] = useState(false)
    const takeControl = (doControl) => {
        if (!doControl) {
            // HOLD
            send_mavmsg('SET_MODE', {
                target_system,
                base_mode: 193,
                custom_mode: 4
            })
            takeControlFlag[1](false)

        } else if (doControl && armed) {
            // SET TO MANUAL MODE            
            send_mavmsg('SET_MODE', {
                target_system,
                base_mode: 129,
                custom_mode: 0
            })
            takeControlFlag[1](true)
        }
        setShowModal(false)


    }
    const handleCtrlChange = (selectedOption) => {
        if (selectedOption.value == MANUAL_CONTROL_TYPES.KEYBOARD) {

            setShowKeyBoardControlls("manual-control-keyboard")
        } else {
            setShowKeyBoardControlls("manual-control-keyboard-hidden")
        }
        ctrlSelected[1](selectedOption);
    }

    return <div>
        <Button
            variant='outline-warning'
            style={{ maxWidth: '100%' }}
            className='main-button'
            onClick={_ => setShowModal(true)}
            disabled={!armed}
        >
            <img src='/static/img/takeoff.png' width='100' style={{ maxWidth: '100%' }} />
        </Button>
        <Select
            value={ctrlSelected[0]}
            onChange={(selectedOption) => handleCtrlChange(selectedOption)}
            options={MANUAL_CONTROL_TYPES_OPTIONS}
        />

        <Modal
            visible={showModal}
            centered
            onOk={_ => takeControl(true)}

            onCancel={_ => takeControl(false)}
            closable={false}
            title='Set takeoff altitude (meters)'
            width={350}
        >
            <p>You will take control off vehicle:</p>
        </Modal>
        {/* <div className={showKeyBoardControlls}>
            <h3>CONTROLES</h3>
            <p>
                <b> w: </b>acelerar hacia adelante<br />
                <b> d: </b>derecha <br />
                <b> a: </b>izquierda <br />
                <b> s: </b>acelerar hacia atras<br />
                <b> e: </b>aumenta la aceleración<br />
                <b> q: </b>disminuye la aceleració<br />
            </p>
        </div> */}
    </div>
}
