import React, { Component } from 'react'
import Joystick from 'react-joystick'


const joyOptions = {
    mode: 'semi',
    catchDistance: 150,
    color: 'white'
}

const containerStyle = {
    position: 'relative',
    height: '100%',
    width: '100%',
}


export const JoystickControls = React.forwardRef((props, ref) => {

    const handleMove = (stick) => {  
        let throttle_range=Math.abs(props.vehicleParams.throttleParams.maxPwm-props.vehicleParams.throttleParams.minPwm)
        let roll_range=Math.abs(props.vehicleParams.rollParams.maxPwm-props.vehicleParams.rollParams.minPwm)
        let stick_radius = stick.distance/50
        let angle_percentage = stick.angle.degree
        
  
        if(!props.takeControlFlag){
            if(angle_percentage>180){
                angle_percentage = 1-(angle_percentage-180)/180
    
                props.vehicleParams.throttleParams.orientation = 0
            }else{
                angle_percentage = angle_percentage/180
                props.vehicleParams.throttleParams.orientation = 1
    
            }
            props.vehicleParams.throttleParams.throttle = Math.floor(props.vehicleParams.throttleParams.minPwm+stick_radius*throttle_range)
            props.vehicleParams.rollParams.roll = Math.floor(1100+angle_percentage*roll_range)
            console.log("throthle:",props.vehicleParams.throttleParams.throttle,"rol:",props.vehicleParams.rollParams.roll,"orientation",props.vehicleParams.throttleParams.orientation)
        }
    }
    const handleStop = () => {   
        props.vehicleParams.throttleParams.throttle = 1100
        props.vehicleParams.throttleParams.orientation = 2
        props.vehicleParams.rollParams.roll = 1500
        
    }
    function managerListener(manager) {
        manager.on('move', (e, stick) => {
            handleMove(stick)
        })
        manager.on('end', () => {
            handleStop()
        })
    }
    return   <Joystick options={joyOptions} containerStyle={containerStyle}
    managerListener={managerListener}/>;
});

