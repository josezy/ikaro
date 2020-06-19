import React, {useState, useEffect} from 'react'
import {reduxify} from '@/util/reduxify'
import {createSelector} from 'reselect'
import {getPathLength} from 'geolib'

import Switch from 'react-switch'
import Button from 'react-bootstrap/Button'

import {send_mavcmd, send_mavmsg} from '@/reducers/mavlink'
import {flightmode_from_heartbeat} from '@/util/mavutil'
import {format_ms} from '@/util/javascript'
import {GPS_FIX_TYPE} from '@/util/constants'


const FlightMode = reduxify({
    mapStateToProps: (state, props) => ({
        flight_mode: createSelector(
            state => state.mavlink.HEARTBEAT,
            HEARTBEAT => HEARTBEAT && flightmode_from_heartbeat(HEARTBEAT)
        )(state),
    }),
    mapDispatchToProps: {},
    render: ({flight_mode}) => <div style={{color:'white',width:'100%',textAlign:'center'}}>
        {flight_mode}
    </div>
})

const Log = reduxify({
    mapStateToProps: (state, props) => ({
        status: createSelector(
            state => state.mavlink.STATUSTEXT,
            STATUSTEXT => STATUSTEXT && STATUSTEXT.text
        )(state),
    }),
    mapDispatchToProps: {},
    render: props => <LogComponent {...props} />
})

const LogComponent = ({status}) => {
    const [log, setLog] = useState([]);
    useEffect(() => {
        if (status) setLog([...log.slice(-100), status])
        setTimeout(() => {
            const log_elem = document.getElementById('log')
            log_elem.scrollTop = log_elem.scrollHeight
        }, 500)
    }, [status])

    return <div id='log' className='log-div'>
        {log.map((text, i) => <div key={i}>{text}</div>)}
    </div>
}


const Video = reduxify({
    mapStateToProps: (state, props) => ({
        b64frame: state.video.b64frame
    }),
    mapDispatchToProps: {},
    render: ({b64frame}) => {
        const img_src = b64frame ? `data:image/jpg;base64,${b64frame}` : "/static/img/no-signal.jpg"
        return <div>
            <img src={img_src} style={{maxWidth:"100%"}}/>
        </div>
    }
})

const ArmedSwitch = reduxify({
    mapStateToProps: (state, props) => ({
        armed: createSelector(
            state => state.mavlink.HEARTBEAT,
            HEARTBEAT => HEARTBEAT && Boolean(HEARTBEAT.base_mode & 10**7)
        )(state),
    }),
    mapDispatchToProps: {send_mavcmd},
    render: ({armed, send_mavcmd}) => <div style={{marginLeft:'auto'}}>
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
    render: ({send_mavcmd}) => <div className='m-auto p-1'>
        <Button variant="outline-warning" onClick={
            () => send_mavcmd('MAV_CMD_NAV_RETURN_TO_LAUNCH')
        }>Return to launch</Button>
    </div>
})


const HookButton = reduxify({
    mapStateToProps: (state, props) => ({}),
    mapDispatchToProps: {send_mavcmd},
    render: ({send_mavcmd}) => <div className='m-auto p-1'>
        <Button variant="outline-warning" onClick={
            () => send_mavcmd('TUKANO_RELEASE_HOOK')
        }>Release Hook</Button>
    </div>
})


const PauseButton = reduxify({
    mapStateToProps: (state, props) => ({
        target_system: state.mavlink.target_system,
        target_component: state.mavlink.target_component,
    }),
    mapDispatchToProps: {send_mavmsg},
    render: ({send_mavmsg, target_system, target_component}) => (
        <div className='m-auto p-1'>
            <Button variant="outline-warning" onClick={() => {
                send_mavmsg('SET_MODE', {
                    target_system,
                    base_mode: 217,
                    custom_mode: 17
                })
                setTimeout(() => send_mavmsg('SET_MODE', {
                    target_system,
                    base_mode: 217,
                    custom_mode: 4
                }), 1000)
                setTimeout(() => send_mavmsg('SET_POSITION_TARGET_LOCAL_NED', {
                    time_boot_ms: 0,
                    target_system,
                    target_component,
                    coordinate_frame: 7,
                    type_mask: 65528,
                    x: 0.0,
                    y: 0.0,
                    z: 0.0,
                    vx: 0.0,
                    vy: 0.0,
                    vz: 0.0,
                    afx: 0.0,
                    afy: 0.0,
                    afz: 0.0,
                    yaw: 0.0,
                    yaw_rate: 0.0
                }), 2000)
            }}>Pause</Button>
        </div>
    )
})


const TakeoffButton = reduxify({
    mapStateToProps: (state, props) => ({
        target_system: state.mavlink.target_system,
    }),
    mapDispatchToProps: {send_mavcmd, send_mavmsg},
    render: ({send_mavcmd, send_mavmsg, target_system}) => <div className='m-auto p-1'>
        <Button variant="outline-warning" style={{maxWidth: '100%'}} onClick={() => {
            send_mavmsg('SET_MODE', {target_system, base_mode: 81, custom_mode: 4})
            // send_mavcmd('MAV_CMD_COMPONENT_ARM_DISARM', {param1: 1})
            // setTimeout(() => send_mavcmd('MAV_CMD_NAV_TAKEOFF', {param7: 10}), 700)
            global.page.command_sender.send(
                {command: 'MAV_CMD_COMPONENT_ARM_DISARM', params: {param1: 1}},
                {command: 'MAV_CMD_NAV_TAKEOFF', params: {param7: 10}}
            )
        }}><img src="/static/img/takeoff.png" width="100" style={{maxWidth: '100%'}}/></Button>
    </div>
})


const LandButton = reduxify({
    mapStateToProps: (state, props) => ({}),
    mapDispatchToProps: {send_mavcmd},
    render: ({send_mavcmd}) => <div className='m-auto p-1'>
        <Button variant="outline-warning" style={{maxWidth: '100%'}} onClick={
            () => send_mavcmd('MAV_CMD_NAV_LAND')
        }><img src="/static/img/land.png" width="100" style={{maxWidth: '100%'}}/></Button>
    </div>
})


const NerdInfo = reduxify({
    mapStateToProps: (state, props) => ({
        heartbeat: state.mavlink.HEARTBEAT,
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
                type: GPS_FIX_TYPE[GPS_RAW_INT.fix_type].replace(/_/g, ' '),
                velocity: GPS_RAW_INT.vel / 100,
            }
        )(state),
    }),
    mapDispatchToProps: {},
    render: props => <NerdInfoComponent {...props} />
})


let heartbeat_timeout = null
const NerdInfoComponent = ({flight, position, battery, gps, heartbeat}) => {
    const [path, setPath] = useState([])
    const [alive, setAlive] = useState(false)

    useEffect(() => {
        if (position) setPath([...path, {latitude: position.lat, longitude: position.lon}])
    }, [position && position.lat, position && position.lon])

    useEffect(() => {
        setAlive(true)
        if (heartbeat_timeout) clearTimeout(heartbeat_timeout)
        heartbeat_timeout = setTimeout(() => setAlive(false), 2000)
    }, [heartbeat])

    return <>
        <div className="row">
            <div className="col">
                <div>Altitude: {position ? `${position.alt}m` : '--'}</div>
                <div>Latitude: {position ? position.lat : '--'}</div>
                <div>Longitude: {position ? position.lon : '--'}</div>
                <div>Flight Time: {flight ? flight.time : '--'}</div>
                <div>Battery: {battery}%</div>
                <div>
                    <div className={`${alive ? 'green' : 'red'} dot`}></div>&nbsp;
                    {alive ? 'Alive' : 'Dead'}
                </div>
            </div>
            <div className="col">
                <div>Ground speed: {gps ? `${gps.velocity}m/s` : '--'}</div>
                <div>GPS Count: {gps ? gps.satellites_visible : 0}</div>
                <div>VDOP: {gps ? gps.epv : '--'}</div>
                <div>HDOP: {gps ? gps.eph : '--'}</div>
                <div>Type: {gps ? gps.type : '--'}</div>
                <div>Flight distance: {getPathLength(path)}m</div>
            </div>
        </div>
    </>
}

const LobbyButton = () => (
    <div
        onClick={() => window.location.href = '/'}
        className="d-flex"
        style={{color:'#e4cf77', cursor:'pointer'}}
    >
        <span className="material-icons m-auto">arrow_back_ios</span>
        <span className="m-auto">Lobby</span>
    </div>
)

export const Controls = () => <>
    <div className="controls-div">
        <div className="controls-row">
            <LobbyButton />
            <ArmedSwitch />
        </div>
        <div className="controls-row">
            <TakeoffButton />
            <LandButton />
        </div>
        <div className="controls-row">
            <RTLButton />
            <HookButton />
            <PauseButton />
        </div>
        <div className="controls-row">
            <Video />
        </div>
        <div className="controls-row">
            <Log />
        </div>
        <div className="controls-row">
            <FlightMode />
        </div>
        <div className="controls-row" style={{color:'white', marginTop:'auto'}}>
            <NerdInfo />
        </div>
    </div>
</>
