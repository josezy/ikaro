

import { KEYBOARD_INTERVAL } from '@/util/constants'

const ManualControlComponent = ({ send_mavmsg, target_system, target_component,armed }) => {
    
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
                   
            //KEY MOVE CONTROL 
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
        }  
    }   
    useEffect(() => {
    
        window.addEventListener('keydown', keyDownListener )
        window.addEventListener('keyup', keyUpListener )
        
        const interval = setInterval( keyBoardCallback, KEYBOARD_INTERVAL);
        return () => {
            window.removeEventListener('keydown', keyDownListener),
            window.removeEventListener('keyup', keyUpListener)
            clearInterval(interval);
        }
    }, [takeControlFlag,roll, throttle, orientation,keyPress,armed,target_system])


  
    return <div>
           
        
    </div>
}