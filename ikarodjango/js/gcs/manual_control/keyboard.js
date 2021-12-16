
import React, {useState, useEffect} from 'react'
import { KEYBOARD_INTERVAL } from '@/util/constants'
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

export const KeyboardControl = React.forwardRef((props, ref) => {
    let takeControlFlag = props.takeControlFlag
    let vehicleParams = props.vehicleParams
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
                keyCode:'a',
            },
            left:{
                pressed: false,
                keyCode:'d',
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
    const  doMove = async () => {
        if(takeControlFlag ){   
            
            vehicleParams.throttleParams.throttle = 1100
            vehicleParams.throttleParams.orientation= 2    
            vehicleParams.rollParams.roll=1500 
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
                    vehicleParams.throttleParams.maxThrottle<vehicleParams.throttleParams.maxPwm 
                    && keyPress.more_throttle.updated
                ){
                    keyPress.more_throttle.updated=false
                    vehicleParams.throttleParams.maxThrottle+=vehicleParams.throttleParams.throttleStep
                }
            }else{                
                keyPress.more_throttle.updated=true
            } 

            if( keyPress.less_throttle.pressed )    {
                if(
                    vehicleParams.throttleParams.maxThrottle>vehicleParams.throttleParams.minPwm 
                    && keyPress.less_throttle.updated
                ){
                    keyPress.less_throttle.updated=false
                    vehicleParams.throttleParams.maxThrottle-= vehicleParams.throttleParams.throttleStep
                }
            }else{                
                keyPress.less_throttle.updated=true
            } 
                   
            //KEY MOVE CONTROL 
            if(keyPress.up.pressed && !keyPress.down.pressed){
                vehicleParams.throttleParams.throttle=vehicleParams.throttleParams.maxThrottle
                vehicleParams.throttleParams.orientation=0    
            }else if(!keyPress.up.pressed && keyPress.down.pressed){
                vehicleParams.throttleParams.throttle=vehicleParams.throttleParams.maxThrottle
                vehicleParams.throttleParams.orientation=1   
            }            
            if( keyPress.right.pressed && !keyPress.left.pressed)    
                vehicleParams.rollParams.roll=vehicleParams.rollParams.rollRight
            else if( !keyPress.right.pressed && keyPress.left.pressed)            
                vehicleParams.rollParams.roll=vehicleParams.rollParams.rollLeft     
        }  
    }   
    useEffect(() => {
    
        window.addEventListener('keydown', keyDownListener )
        window.addEventListener('keyup', keyUpListener )
        
        const interval = setInterval( doMove, KEYBOARD_INTERVAL);
        return () => {
            window.removeEventListener('keydown', keyDownListener),
            window.removeEventListener('keyup', keyUpListener)
            clearInterval(interval);
        }
    }, [takeControlFlag,keyPress])


  
    return <div>
        <div className='manual-control-inner-info'>
            <div className="row">
                <div className="col">
                    <b>Throttle:</b> {vehicleParams.throttleParams.throttle}                                 
                </div>                    
            </div>
            <div className="row"> 
                <div className="col">
                    <b>R-Roll:</b> {vehicleParams.rollParams.rollRight}                                        
                </div>                       
                <div className="col">
                    <b>L-Roll:</b>  {vehicleParams.rollParams.rollLeft}                                        
                </div>                    
            </div>
            <div className="row">                
                <div className="col">
                    <b>Servo1:</b> {vehicleParams.servoTrimParams.servo1} 
                </div>          
                <div className="col">
                    <b>Servo2:</b> {vehicleParams.servoTrimParams.servo2}
                </div>                    
            </div>
        
        </div>
        
    </div>
});