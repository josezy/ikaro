import React, {useState, useEffect} from 'react'
import {reduxify} from '@/util/reduxify'
import {createSelector} from 'reselect'

import Switch from 'react-switch'
import Button from 'react-bootstrap/Button'

import {send_mavcmd, send_mavmsg} from '@/reducers/mavlink'
import {format_ms} from '@/util/javascript'
import {GPS_FIX_TYPE} from '@/util/constants'
import {getPathLength} from 'geolib'

const ArmedSwitch = reduxify({
    mapStateToProps: (state, props) => ({
        armed: createSelector(
            state => state.mavlink.HEARTBEAT,
            HEARTBEAT => HEARTBEAT && Boolean(HEARTBEAT.base_mode & 10**7)
        )(state),
    }),
    mapDispatchToProps: {send_mavcmd},
    render: ({armed, send_mavcmd}) => <div style={{marginRight:'auto'}}>
        <label style={{transform:'scale(0.7)', display:'flex'}}>
            <span style={{fontSize:'1.2rem', marginRight:5, color:'white'}}>
                {armed ? 'ARMED' : 'DISARMED'}
            </span>
            <Switch onChange={checked => send_mavcmd(
                'MAV_CMD_COMPONENT_ARM_DISARM',
                {param1: checked ? 1 : 0, param2: 0}
            )} checked={armed || false} />
        </label>
    </div>
})


const RTLButton = reduxify({
    mapStateToProps: (state, props) => ({}),
    mapDispatchToProps: {send_mavcmd},
    render: ({send_mavcmd}) => <div style={{marginLeft:'auto'}}>
        <Button variant="outline-warning" onClick={
            () => send_mavcmd('MAV_CMD_NAV_RETURN_TO_LAUNCH')
        }>Return to launch</Button>
    </div>
})


const HookButton = reduxify({
    mapStateToProps: (state, props) => ({}),
    mapDispatchToProps: {send_mavcmd},
    render: ({send_mavcmd}) => <div style={{marginLeft:'auto'}}>
        <Button variant="outline-warning" onClick={
            () => send_mavcmd('TUKANO_RELEASE_HOOK')
        }>Release Hook</Button>
    </div>
})


const TakeoffButton = reduxify({
    mapStateToProps: (state, props) => ({
        target_system: state.mavlink.target_system,
    }),
    mapDispatchToProps: {send_mavcmd, send_mavmsg},
    render: ({send_mavcmd, send_mavmsg, target_system}) => <div style={{margin:'auto'}}>
        <Button variant="outline-warning" onClick={() => {
            send_mavmsg('SET_MODE', {target_system, base_mode: 81, custom_mode: 4})
            send_mavcmd('MAV_CMD_COMPONENT_ARM_DISARM', {param1: 1})
            setTimeout(() => send_mavcmd('MAV_CMD_NAV_TAKEOFF', {param7: 10}), 700)
        }}><img src="/static/img/takeoff.png" width="100"/></Button>
    </div>
})


const LandButton = reduxify({
    mapStateToProps: (state, props) => ({}),
    mapDispatchToProps: {send_mavcmd},
    render: ({send_mavcmd}) => <div style={{margin:'auto'}}>
        <Button variant="outline-warning" onClick={
            () => send_mavcmd('MAV_CMD_NAV_LAND')
        }><img src="/static/img/land.png" width="100"/></Button>
    </div>
})


const NerdInfo = reduxify({
    mapStateToProps: (state, props) => ({
        flight: createSelector(
            state => state.mavlink.GLOBAL_POSITION_INT,
            GLOBAL_POSITION_INT => GLOBAL_POSITION_INT && {
                time: format_ms(GLOBAL_POSITION_INT.time_boot_ms),
            }
        )(state),
        position: createSelector(
            state => state.mavlink.GLOBAL_POSITION_INT,
            GLOBAL_POSITION_INT => GLOBAL_POSITION_INT && {
                lat: GLOBAL_POSITION_INT.lat / 10**7,
                lon: GLOBAL_POSITION_INT.lon / 10**7,
                alt: GLOBAL_POSITION_INT.alt / 10**3,
            }
        )(state),
        battery: createSelector(
            state => state.mavlink.SYS_STATUS,
            SYS_STATUS => SYS_STATUS && SYS_STATUS.battery_remaining
        )(state),
        gps: createSelector(
            state => state.mavlink.GPS_RAW_INT,
            GPS_RAW_INT => GPS_RAW_INT && {
                satellites_visible: GPS_RAW_INT.satellites_visible,
                eph: GPS_RAW_INT.eph == 65535 ? '--' : GPS_RAW_INT.eph,
                epv: GPS_RAW_INT.epv == 65535 ? '--' : GPS_RAW_INT.epv,
                type: GPS_FIX_TYPE[GPS_RAW_INT.fix_type],
                velocity: GPS_RAW_INT.vel/100,
            }
        )(state),
    }),
    mapDispatchToProps: {},
    render: props => <NerdInfoComponent {...props} />
})


const NerdInfoComponent = ({flight, position, battery, gps}) => {
    const [path, setPath] = useState([]);
    useEffect(() => {
        if (position) setPath([...path, {latitude: position.lat, longitude: position.lon}])
    }, [position && position.lat, position && position.lon])

    return <>
        <div className="row">
            <div className="col-sm-6">
                <div>Altitude: {position ? position.alt : '--'}m</div>
                <div>Latitude: {position ? position.lat : '--'}</div>
                <div>Longitude: {position ? position.lon : '--'}</div>
                <div>Flight Time: {flight ? flight.time : '--'}</div>
                <div>Battery: {battery}%</div>
            </div>
            <div className="col-sm-6">
                <div>Velocity: {gps ? gps.velocity : '--'} m/s</div>
                <div>GPS Count: {gps ? gps.satellites_visible : 0}</div>
                <div>VDOP:{gps ? gps.epv : '--'}</div>
                <div>HDOP:{gps ? gps.eph : '--'}</div>
                <div>Type:{gps ? gps.type : '--'}</div>
                <div>Flight distance: {getPathLength(path)}m</div>
            </div>
        </div>
    </>
}

export const Controls = () => <>
    <div className="controls-div">
        <div className="controls-row">
            <ArmedSwitch />
            <RTLButton />
            <HookButton />
        </div>
        <div className="controls-row">
            <TakeoffButton />
            <LandButton />
        </div>
        <div className="controls-row" style={{
            marginTop:'auto',
            height:150,
            display:'block',
            color:'white',
        }}>
            <NerdInfo />
        </div>
    </div>
</>
