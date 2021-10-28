import React, { useRef, useState, useEffect } from 'react'
import { reduxify } from '@/util/reduxify'
import { createSelector } from 'reselect'

import { Button } from 'react-bootstrap'
import {  Modal } from 'antd'

import { send_mavmsg } from '@/reducers/mavlink'
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";


const ManualDriveButton = reduxify({
    mapStateToProps: (state, props) => ({
        target_system: state.mavlink.target_system,
        target_component: state.mavlink.target_component,
        armed: createSelector(
            state => state.mavlink.HEARTBEAT,
            HEARTBEAT => HEARTBEAT && Boolean(HEARTBEAT.base_mode & 10 ** 7)
        )(state),
    }),
    mapDispatchToProps: { send_mavmsg },
    render: (props) => <ManualControlComponent {...props} />
})


const ManualControlComponent = ({ send_mavmsg, target_system, target_component,armed }) => {
    const [showModal, setShowModal] = useState(false)
    const [takeControlFlag, setTakeControlFlag] = useState(false)
    const [roll, setRoll] = useState(1500)
    const [throttle, setThrottle] = useState(1000)
    const [orientation, setOrientation] = useState(0)


    const [vehicleParams, setVehicleParams] = useState(
        {
            
            throttleParams:{
                throttle:1700,
                throttleStep:50,
                maxPwm:1900,
                minPwm:1100
            },
            rollParams:{
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
    const [keyPress, setKeyPress] = useState(
        {
            up:{
                pressed: false,
                keyCode:'w',
                virtualKeyCode:'w',
            },
            down:{
                pressed: false,
                keyCode:'s',
            },
            right:{
                pressed: false,
                keyCode:'d',
            },
            left:{
                pressed: false,
                keyCode:'a',
            },
            more_throttle:{
                pressed: false,
                updated: true,
                keyCode:'8',
            },
            less_throttle:{
                pressed: false,
                updated: true,
                keyCode:'5',
            },
            more_servo1_trim:{
                pressed: false,
                updated: true,
                keyCode:'7',
            },
            less_servo1_trim:{
                pressed: false,
                updated: true,
                keyCode:'9',
            },
            more_servo2_trim:{
                pressed: false,
                updated: true,
                keyCode:'4',
            },
            less_servo2_trim:{
                pressed: false,
                updated: true,
                keyCode:'6',
            },
        }
    )
    const keyDownListener = async (event) => {
        
        let char_press = String.fromCharCode((96 <= event.keyCode && event.keyCode <= 105)? event.keyCode-48 : event.keyCode).toLowerCase() 
        
        if(takeControlFlag){

            Object.entries(keyPress).map(([key, value]) => {
                if(char_press==value.keyCode)
                    value.pressed=true    
                
            })
        }
       
           
    }
    const keyUpListener = async (event) => {
        
        let char_press = String.fromCharCode((96 <= event.keyCode && event.keyCode <= 105)? event.keyCode-48 : event.keyCode).toLowerCase() 

        if(takeControlFlag)           
            Object.entries(keyPress).map(([key, value]) => {
                if(char_press==value.keyCode)
                    value.pressed=false      
                
            })                 

    }
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
        console.log("SERVO TRIM","DONE")
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
                target_system,   
            target_system,
                target_system,   
            target_system,
            target_component,            
                target_component,          
            target_component,            
                target_component,          
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
            })
        })     
            })
        })     
    
    }
    
    const  doMove = async () => {
        if(takeControlFlag ){   
            setThrottle(1000)
            setRoll(1500)
            setOrientation(2)

            //SERVO1_TRIM
            if( keyPress.more_servo1_trim.pressed ){
                if(
                    vehicleParams.servoTrimParams.servo1<vehicleParams.servoTrimParams.maxPwm
                    && keyPress.more_servo1_trim.updated
                ){
                    keyPress.more_servo1_trim.updated=false
                    vehicleParams.servoTrimParams.servo1+=vehicleParams.servoTrimParams.pwmStep
             
                    setServoTrim ( 
                        vehicleParams.servoTrimParams.servo1,1
                    )
                }
            }else{                
                keyPress.more_servo1_trim.updated=true
            } 

            if( keyPress.less_servo1_trim.pressed ){
                if(
                    vehicleParams.servoTrimParams.servo1>vehicleParams.servoTrimParams.minPwm 
                    && keyPress.less_servo1_trim.updated
                ){
                    keyPress.less_servo1_trim.updated=false
                    vehicleParams.servoTrimParams.servo1-=vehicleParams.servoTrimParams.pwmStep
                    setServoTrim( vehicleParams.servoTrimParams.servo1,1)
                }
            }else{                
                keyPress.less_servo1_trim.updated=true
            }
            
            //SERVO2_TRIM
       
            if( keyPress.more_servo2_trim.pressed )    {
                if(
                    vehicleParams.servoTrimParams.servo2<vehicleParams.servoTrimParams.maxPwm
                    && keyPress.more_servo2_trim.updated
                ){
                    keyPress.more_servo2_trim.updated=false
                    vehicleParams.servoTrimParams.servo2+=vehicleParams.servoTrimParams.pwmStep
                    setServoTrim ( 
                        vehicleParams.servoTrimParams.servo2,2
                    )
                }
            }else{                
                keyPress.more_servo2_trim.updated=true
            } 

            if( keyPress.less_servo2_trim.pressed )    {
                if(
                    vehicleParams.servoTrimParams.servo2>vehicleParams.servoTrimParams.minPwm 
                    && keyPress.less_servo2_trim.updated
                ){
                    keyPress.less_servo2_trim.updated=false
                    vehicleParams.servoTrimParams.servo2-=vehicleParams.servoTrimParams.pwmStep
                    setServoTrim ( 
                        vehicleParams.servoTrimParams.servo2,2
                    )   
                }
            }else{                
                keyPress.less_servo2_trim.updated=true
            } 

            //THROTTLE
            if( keyPress.more_throttle.pressed ){
                if(
                    vehicleParams.throttleParams.throttle<vehicleParams.throttleParams.maxPwm 
                    && keyPress.more_throttle.updated
                ){
                    keyPress.more_throttle.updated=false
                    vehicleParams.throttleParams.throttle+=vehicleParams.throttleParams.throttleStep
                }
            }else{                
                keyPress.more_throttle.updated=true
            } 

            if( keyPress.less_throttle.pressed )    {
                if(
                    vehicleParams.throttleParams.throttle>vehicleParams.throttleParams.minPwm 
                    && keyPress.less_throttle.updated
                ){
                    keyPress.less_throttle.updated=false
                    vehicleParams.throttleParams.throttle-= vehicleParams.throttleParams.throttleStep
                }
            }else{                
                keyPress.less_throttle.updated=true
            } 
                   
            //MOVE CONTROL 
            if(keyPress.up.pressed && !keyPress.down.pressed){
                setThrottle(vehicleParams.throttleParams.throttle)
                setOrientation(0)            
            }else if(!keyPress.up.pressed && keyPress.down.pressed){
                setThrottle(vehicleParams.throttleParams.throttle)
                setOrientation(1)
            }            
            if( keyPress.right.pressed && !keyPress.left.pressed)     
                setRoll( vehicleParams.rollParams.rollRight)
            else if( !keyPress.right.pressed && keyPress.left.pressed)            
                setRoll( vehicleParams.rollParams.rollLeft)
            
          
            move(roll, throttle, orientation)
        }  
    }
    useEffect(() => {
    
        window.addEventListener('keydown', keyDownListener )
        window.addEventListener('keyup', keyUpListener )
        const interval = setInterval( doMove, 10);

        return () => {
            window.removeEventListener('keydown', keyDownListener),
            window.removeEventListener('keyup', keyUpListener),
            clearInterval(interval);
        }
    }, [takeControlFlag,roll, throttle, orientation,keyPress,armed,target_system])

    const takeControl =  (doControl) => {
        console.log("armadooooooo",armed,"doControl",doControl)
        

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
        
        setTakeControlFlag(doControl && armed)        
        setShowModal(false)   
     
    }

  
    return <div className='m-auto p-1'>
                <Button
                    variant='outline-warning'
                    style={{ maxWidth: '100%' }}
                    className='main-button'
                    onClick={_ => setShowModal(true)}
                    disabled={!armed}
                >
                    <img src='/static/img/takeoff.png' width='100' style={{ maxWidth: '100%' }} />
                </Button>
                <div  style={{
                    backgroundColor:'white',                    
                }}>
                    <b>Throttle:</b>{vehicleParams.throttleParams.throttle}<br/>
                    <b>Front Align:</b>{vehicleParams.servoTrimParams.servo1}<br/>
                    <b>Back Align:</b>{vehicleParams.servoTrimParams.servo2}<br/>
                    <b>Left:</b>{vehicleParams.rollParams.rollLeft} <br/>
                </div>
                
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
const MyControls = React.forwardRef((props, ref) => {
    props.takeControlFlag;
    
    const onVirtualKeyPress = (button) => {   
        if(props.takeControlFlag)           
            Object.entries(props.keyPress).map(([key, value]) => {
                if(button==value.keyCode)
                    value.pressed=true      
                
            })   
   

    }
    
    const onVirtualKeyReleased = (button) => {
        if(props.takeControlFlag)           
            Object.entries(props.keyPress).map(([key, value]) => 
            {
                if(button==value.keyCode)
                    value.pressed=false      
                
            })   
    }
    return   <Keyboard                        
            keyboardRef={ref}
            layout={{
                'default': [
                'q w e',
                'a s d'
                ]
            }}
            onKeyReleased={button =>
                onVirtualKeyReleased(button)}
            onKeyPress={button =>                   
                onVirtualKeyPress(button)}
        />             ;
});

export const ManualControl= () => <>
    <div className='controls-div'>
    
        <div className='controls-row'>
            <ManualDriveButton />
        </div>
        <div className='controls-row'>
            <div  style={{
                backgroundColor:'white',
                width:'300px'
            }}>
                <h3>CONTROLES</h3>
                <p>
                    <b> w: </b>acelerar hacia adelante<br/>
                    <b> d: </b>derecha <br/>
                    <b> a: </b>izquierda <br/>
                    <b> s: </b>acelerar hacia atras<br/>
                    <b> e: </b>aumenta la aceleración<br/>
                    <b> q: </b>disminuye la aceleració<br/>
                </p>
            </div>
        </div>
    </div>
</>