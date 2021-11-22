
import React, { useState } from 'react';
import { useGamepads } from 'react-gamepads';
export function GamepadCursor(props, ref) {
  const [gamepads, setGamepads] = useState({});
  useGamepads(gamepads => setGamepads(gamepads));

  const gamepadDisplay = Object.keys(gamepads).map(gamepadId => {
    
    let throttle_range=Math.abs(props.vehicleParams.throttleParams.maxPwm-props.vehicleParams.throttleParams.minPwm)
    let roll_range=Math.abs(props.vehicleParams.rollParams.maxPwm-props.vehicleParams.rollParams.minPwm)
    let left_vertical = Math.abs(gamepads[gamepadId].axes[1])
    let left_horizontal = Math.abs(gamepads[gamepadId].axes[0])
   
 
    if(props.takeControlFlag){
        if(gamepads[gamepadId].axes[1]<0){
            props.vehicleParams.throttleParams.orientation = 0
        }else{
            props.vehicleParams.throttleParams.orientation = 1
        }
        props.vehicleParams.throttleParams.throttle = Math.floor(props.vehicleParams.throttleParams.minPwm+left_vertical*throttle_range)
        props.vehicleParams.rollParams.roll = Math.floor(1500+left_horizontal*roll_range/2)
    }
  });
  return (
    <div >
    </div>
  );
}