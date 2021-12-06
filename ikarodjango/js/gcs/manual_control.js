import React, { useState, useEffect } from 'react'
import { reduxify } from '@/util/reduxify'
import { createSelector } from 'reselect'

import { Button } from 'react-bootstrap'
import {  Modal } from 'antd'

import { send_mavmsg } from '@/reducers/mavlink'
import { RC_CHANNELS_OVERRIDE_INTERVAL } from '@/util/constants'
import { JoystickControls } from '@/gcs/manual_control/virtual_joystick.js';
import { KeyboardControl } from '@/gcs/manual_control/keyboard.js';
import { GamepadCursor } from '@/gcs/manual_control/gamepad_cursor.js'
import { PidController,VelocityCalc } from '@/gcs/manual_control/pid.js'
import { flightmode_from_heartbeat } from '@/util/mavutil'




const ManualDriveButton = reduxify({
    mapStateToProps: (state, props) => ({
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
        position: createSelector(
            state => state.mavlink.GLOBAL_POSITION_INT,
            GLOBAL_POSITION_INT => GLOBAL_POSITION_INT && {
                lat: GLOBAL_POSITION_INT.lat / 10 ** 7,
                lon: GLOBAL_POSITION_INT.lon / 10 ** 7,
                alt: GLOBAL_POSITION_INT.alt / 10 ** 3,
                vx: GLOBAL_POSITION_INT.vx,
                vy: GLOBAL_POSITION_INT.vy,
                vz: GLOBAL_POSITION_INT.vz ,
                relative_alt: GLOBAL_POSITION_INT.relative_alt ,
            }
        )(state),        
        raw_imu:  createSelector(
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

const velCalc=VelocityCalc()

const ManualControlComponent = ({ send_mavmsg, target_system, target_component,armed,flight_mode, position,raw_imu }) => {
   
    const [takeControlFlag, setTakeControlFlag] = useState(false)
    const [roll, setRoll] = useState(1500)
    const [throttle, setThrottle] = useState(1000)
    const [orientation, setOrientation] = useState(0)
    console.log(velCalc.run(raw_imu.xacc))
    const [vehicleParams, setVehicleParams] = useState(
        {
            
            throttleParams:{
                throttle:1700,
                maxThrottle:1700,
                throttleStep:50,
                maxPwm:1850,
                minPwm:1100,
                orientation:2
            },
            rollParams:{
                roll:1500,
                rollLeft:1900, //(1500-1900]
                rollRight:1100, //[1100-1500)
                maxPwm:1900,
                minPwm:1100
            },
            servoTrimParams:{
                servo1: 1500,
                servo2: 1500,
                pwmStep: 50,
                maxPwm:1900,
                minPwm:1100
            }
        }
    )
   
    const setServoTrim =  (pwm,servo) => {
        let param_id='SERVO1_TRIM';
        if(servo==2){
            param_id='SERVO2_TRIM';
        }
        send_mavmsg('PARAM_SET', {
            target_system,
            target_component,            
            param_id: param_id,
            param_value: pwm,
            param_type: 4       
        })
    }
    const move =  (roll,throttle, orientation) => {
        let ch7_raw=2000;
        let ch8_raw=2000
      
        if (orientation==1){
            ch7_raw=1000;
            ch8_raw=2000;
        } else if( orientation==0){

            ch7_raw=2000;
            ch8_raw=1000; 
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
    
    const  doMove = async () => {
        if(takeControlFlag ){   
            
            setThrottle(vehicleParams.throttleParams.throttle)
            setOrientation(vehicleParams.throttleParams.orientation)  
            setRoll( vehicleParams.rollParams.roll)
            move(roll, throttle, orientation)
        }  
        setTakeControlFlag(flight_mode=="MANUAL" && armed)      
        
        //move(roll, throttle, orientation)
    }
    useEffect(() => {
    
        const interval = setInterval( doMove, RC_CHANNELS_OVERRIDE_INTERVAL);

        return () => {
            clearInterval(interval);
        }
    }, [takeControlFlag,roll, throttle, orientation,armed,flight_mode,target_system])

   
  
    return    <div className='manual-control-inner'>
                    
        {/* <KeyboardControl takeControlFlag={takeControlFlag} vehicleParams={vehicleParams}/> */}

        <JoystickControls takeControlFlag={takeControlFlag} vehicleParams={vehicleParams}/>
        {/* <GamepadCursor  takeControlFlag={takeControlFlag} vehicleParams={vehicleParams} /> */}
        
    </div>
}




export const ManualControl= () => <>
    <div className='manual-control-container'>
            <ManualDriveButton />
    </div>
</>


export const ManualControlPanel = reduxify({
    mapStateToProps: (state, props) => ({
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

const ManualControlPanelComponent = ({ send_mavmsg, target_system, target_component,armed }) => {
    
    const [showModal, setShowModal] = useState(false)
    const takeControl =  (doControl) => {
        if(!doControl)
            //HOLD
            send_mavmsg('SET_MODE', {
                target_system,
                base_mode: 193,
                custom_mode: 4
            })
           
        else if(doControl && armed ){
            //SET TO MANUAL MODE            
            send_mavmsg('SET_MODE', {
                target_system,
                base_mode: 129,
                custom_mode: 0
            })
            console.log("MANUAL MODE!")
        }
        setShowModal(false)
        
     
    }
  
    return  <div>
        <Button
            variant='outline-warning'
            style={{ maxWidth: '100%' }}
            className='main-button'
            onClick={_ => setShowModal(true)}
            disabled={!armed}
        >
            <img src='/static/img/takeoff.png' width='100' style={{ maxWidth: '100%' }} />
        </Button>

        
        <Modal
            visible={showModal}
            centered
            onOk={_ => takeControl(true)}

            onCancel={_ => takeControl(false)}
            closable={false}
            title='Set takeoff altitude (meters)'
            width={350}
        >
            <p>  You will take control off vehicle:</p>
        
        </Modal> 
      
    </div>
}
 