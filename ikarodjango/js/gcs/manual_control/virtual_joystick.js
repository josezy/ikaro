import React from 'react'
import { Joystick } from 'react-joystick-component';
export const JoystickControls = React.forwardRef((props, ref) => {

    const handleMove = (values) => {  
        let throttle_range=Math.abs(props.vehicleParams.throttleParams.maxPwm-props.vehicleParams.throttleParams.minPwm)
        let roll_range=Math.abs(props.vehicleParams.rollParams.maxPwm-props.vehicleParams.rollParams.minPwm)
        let r = Math.sqrt(Math.pow(values.x/50,2)+Math.pow(values.y/50,2))
        let x = values.x/50
        let y = Math.abs(values.y/50) 
        if(r>1){
            r=1
        }
        console.log(r)
        if(props.takeControlFlag){
            if(values.y>0){
                props.vehicleParams.throttleParams.orientation = 0
            }else{
                props.vehicleParams.throttleParams.orientation = 1
            }
            props.vehicleParams.throttleParams.throttle = Math.floor(props.vehicleParams.throttleParams.minPwm+r*throttle_range)
            props.vehicleParams.rollParams.roll = Math.floor(1500+x*roll_range/2)
        }
    }
    const handleStop = (values) => {   
        props.vehicleParams.throttleParams.throttle = 1100
        props.vehicleParams.throttleParams.orientation = 2
        props.vehicleParams.rollParams.roll = 1500
        
    }
    return   <Joystick size={100} 
        baseColor="red" 
        stickColor="blue"
        move={values=>handleMove(values)}
        stop={values=>handleStop(values)}>

    </Joystick>;
});