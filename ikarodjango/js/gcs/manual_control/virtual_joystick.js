import React from 'react'
import Joystick from 'react-joystick'


const joyOptions = {
    mode: 'semi',
    color: 'white',
    size: 75,
    restOpacity: 10
}
const joyStyles = {
    position:'relative',
    opacity: '100%',
    background: 'rgba(255, 255, 255, 0.0)',    
    borderRadius: '50%',
    
    height: '1vh',
    width: '1vw',
    marginBottom:'20px'
}

export const JoystickControls = React.forwardRef((props, ref) => {
   
    
    const [showGuide, setShowGuide] = React.useState('manual-control-virtual-joystick')
    const handleMove = (stick) => {  
        let throttle_range=Math.abs(props.vehicleParams.throttleParams.maxPwm-props.vehicleParams.throttleParams.minPwm)
        let roll_range=Math.abs(props.vehicleParams.rollParams.maxPwm-props.vehicleParams.rollParams.minPwm)
        let stick_radius = stick.distance/50
        let angle_percentage = stick.angle.degree
        
  
        if(props.takeControlFlag){
            if(angle_percentage>180){
                angle_percentage = 1-(angle_percentage-180)/180
    
                props.vehicleParams.throttleParams.orientation = 1
            }else{
                angle_percentage = angle_percentage/180
                props.vehicleParams.throttleParams.orientation = 0
    
            }
            props.vehicleParams.throttleParams.throttle = Math.floor(props.vehicleParams.throttleParams.minPwm+stick_radius*throttle_range)
            props.vehicleParams.rollParams.roll = Math.floor(props.vehicleParams.rollParams.maxPwm-angle_percentage*roll_range)
        
        }
        console.log(props.takeControlFlag,"JOYYYYYYYYSTIK!!")
       
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
        manager.on('click', () => {
        })
        manager.on('end', () => {   
            handleStop()
        })
    }
    return  <div className='manual-control-virtual-joystick-contanier'>
       
        <div className={showGuide} onClick={_ =>setShowGuide("manual-control-virtual-joystick-transparent")}>
            <Joystick containerStyle={joyStyles} options={joyOptions}  managerListener={managerListener}/>
            
        </div>
      
    </div> 
});

export const DoubleJoystickControls = React.forwardRef((props, ref) => {
   
    
    const [showGuide, setShowGuide] = React.useState('manual-control-virtual-joystick')
    const handleMove = (stick) => {  
        let throttle_range=Math.abs(props.vehicleParams.throttleParams.maxPwm-props.vehicleParams.throttleParams.minPwm)
        let roll_range=Math.abs(props.vehicleParams.rollParams.maxPwm-props.vehicleParams.rollParams.minPwm)
        let stick_radius = stick.distance/50
        let angle_percentage = stick.angle.degree
        
  
        if(props.takeControlFlag){
            if(angle_percentage>180){
                angle_percentage = 1-(angle_percentage-180)/180
    
                props.vehicleParams.throttleParams.orientation = 1
            }else{
                angle_percentage = angle_percentage/180
                props.vehicleParams.throttleParams.orientation = 0
    
            }
            props.vehicleParams.throttleParams.throttle = Math.floor(props.vehicleParams.throttleParams.minPwm+stick_radius*throttle_range)
            props.vehicleParams.rollParams.roll = Math.floor(props.vehicleParams.rollParams.maxPwm-angle_percentage*roll_range)
        
        }
        console.log(props.takeControlFlag,"JOYYYYYYYYSTIK!!")
       
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
        manager.on('click', () => {
        })
        manager.on('end', () => {   
            handleStop()
        })
    }
    return  <div className='manual-control-virtual-joystick-contanier'>
       
        <div className={showGuide} onClick={_ =>setShowGuide("manual-control-virtual-joystick-transparent")}>
            <Joystick containerStyle={joyStyles} options={joyOptions}  managerListener={managerListener}/>
            
        </div>
        <div className={showGuide} onClick={_ =>setShowGuide("manual-control-virtual-joystick-transparent")}>
            <Joystick containerStyle={joyStyles} options={joyOptions}  managerListener={managerListener}/>
            
        </div>
      
    </div> 
});