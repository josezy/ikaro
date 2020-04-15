import React, {PureComponent} from 'react'
import {reduxify} from '@/util/reduxify'
import {createSelector} from 'reselect'

import Switch from 'react-switch'
import Button from 'react-bootstrap/Button'

import {send_mavcmd, send_mavmsg} from '@/reducers/mavlink'


const ArmedSwitch = ({armed, send_mavcmd}) => <div style={{marginRight:'auto'}}>
    <label style={{transform:'scale(0.7)', display:'flex'}}>
        <span style={{fontSize:'1.2rem', marginRight:5, color:'white'}}>
            {armed ? 'ARMED' : 'DISARMED'}
        </span>
        <Switch onChange={checked => send_mavcmd(
            'MAV_CMD_COMPONENT_ARM_DISARM',
            {param1: checked ? 1 : 0, param2: 0}
        )} checked={armed} />
    </label>
</div>


const RTLButton = ({send_mavcmd}) => <div style={{marginLeft:'auto'}}>
    <Button variant="outline-warning" onClick={() => send_mavcmd(
        'MAV_CMD_NAV_RETURN_TO_LAUNCH'
    )}>Return to launch</Button>
</div>


const HookButton = ({send_mavcmd}) => <div style={{marginLeft:'auto'}}>
    <Button variant="outline-warning" onClick={() => send_mavcmd(
        'TUKANO_RELEASE_HOOK'
    )}>Release Hook</Button>
</div>


const TakeoffButton = ({send_mavcmd, send_mavmsg, target_system}) => <div style={{margin:'auto'}}>
    <Button variant="outline-warning" onClick={() => {
        send_mavmsg('SET_MODE', {target_system, base_mode: 81, custom_mode: 4})
        send_mavcmd('MAV_CMD_COMPONENT_ARM_DISARM', {param1: 1})
        setTimeout(() => send_mavcmd('MAV_CMD_NAV_TAKEOFF', {param7: 10}), 500)
    }}><img src="/static/img/takeoff.png" width="100"/></Button>
</div>


const LandButton = ({send_mavcmd}) => <div style={{margin:'auto'}}>
    <Button variant="outline-warning" onClick={
        () => send_mavcmd('MAV_CMD_NAV_LAND')
    }><img src="/static/img/land.png" width="100"/></Button>
</div>


class ControlsComponent extends PureComponent {
    render() {
        const {target_system, armed, position, flight, battery} = this.props
        const {send_mavcmd, send_mavmsg} = this.props
        return <div className="controls-div">
            <div className="controls-row">
                <ArmedSwitch armed={armed || false} send_mavcmd={send_mavcmd} />
                <RTLButton send_mavcmd={send_mavcmd} />
                <HookButton send_mavcmd={send_mavcmd} />
            </div>
            <div className="controls-row">
                <TakeoffButton
                    send_mavcmd={send_mavcmd}
                    send_mavmsg={send_mavmsg}
                    target_system={target_system}
                />
                <LandButton send_mavcmd={send_mavcmd} />
            </div>
            <div className="controls-row" style={{
                marginTop:'auto',
                height:150,
                display:'block',
                color:'white',
            }}>
                {position && <>
                    <div>Altitude: {position.alt}m</div>
                    <div>Latitude: {position.lat}</div>
                    <div>Longitude: {position.lon}</div>
                    <div>Battery: {battery}%</div>
                    <div>Flight Time: {flight.time}</div>
                </>}
            </div>
        </div>
    }
}

const compute_battery = createSelector(
    state => state.mavlink.SYS_STATUS,
    SYS_STATUS => SYS_STATUS && SYS_STATUS.battery_remaining
)

function format_time(duration){
    let milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}

const compute_time = createSelector(
    state => state.mavlink.GLOBAL_POSITION_INT,
    GLOBAL_POSITION_INT => GLOBAL_POSITION_INT && {
        time: format_time(GLOBAL_POSITION_INT.time_boot_ms),
    }
)

const compute_armed = createSelector(
    state => state.mavlink.HEARTBEAT,
    HEARTBEAT => HEARTBEAT && Boolean(HEARTBEAT.base_mode & 10**7)
)

const compute_position = createSelector(
    state => state.mavlink.GLOBAL_POSITION_INT,
    GLOBAL_POSITION_INT => GLOBAL_POSITION_INT && {
        lat: GLOBAL_POSITION_INT.lat / 10**7,
        lon: GLOBAL_POSITION_INT.lon / 10**7,
        alt: GLOBAL_POSITION_INT.alt / 10**3,
    }
)

const mapStateToProps = (state, props) => ({
    target_system: state.mavlink.target_system,
    armed: compute_armed(state),
    position: compute_position(state),
    flight: compute_time(state),
    battery: compute_battery(state),
})

export const Controls = reduxify({
    mapStateToProps,
    mapDispatchToProps: {send_mavcmd, send_mavmsg},
    render: (props) => <ControlsComponent {...props} />
})
