import React, { useState, useEffect } from 'react'
import { reduxify } from '@/util/reduxify'
import { createSelector } from 'reselect'
// import { getPathLength } from 'geolib'

import Switch from 'react-switch'
import { Button } from 'react-bootstrap'
import { Slider, InputNumber, Modal, Row } from 'antd'

import { send_mavcmd, send_mavmsg } from '@/reducers/mavlink'
import { flightmode_from_heartbeat, voltage_to_percentage } from '@/util/mavutil'
import { format_ms } from '@/util/javascript'
import { GPS_FIX_TYPE, TAKEOFF_MIN_ALTITUDE, TAKEOFF_MAX_ALTITUDE } from '@/util/constants'


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

const LogComponent = ({ status }) => {
    const [log, setLog] = useState([])
    useEffect(() => {
        if (status) setLog([...log.slice(-100), status])
        setTimeout(() => {
            const log_elem = document.getElementById('log')
            if (log_elem) log_elem.scrollTop = log_elem.scrollHeight
        }, 500)
    }, [status])

    return <div id='log' className='log-div'>
        <i className='fa fa-trash' style={{ position: 'absolute', right: 7, cursor: 'pointer' }} onClick={_ => setLog([])}></i>
        {log.map((text, i) => <div key={i}>{text}</div>)}
    </div>
}


const ArmedSwitch = reduxify({
    mapStateToProps: (state, props) => ({
        armed: createSelector(
            state => state.mavlink.HEARTBEAT,
            HEARTBEAT => HEARTBEAT && Boolean(HEARTBEAT.base_mode & 10 ** 7)
        )(state),
    }),
    mapDispatchToProps: { send_mavcmd },
    render: ({ armed, send_mavcmd }) => <div style={{ marginLeft: 'auto' }}>
        <label style={{ transform: 'scale(0.7)', display: 'flex' }}>
            <span style={{ fontSize: '1.2rem', marginRight: 5, color: 'white' }} className='d-none d-lg-block'>
                {armed ? 'ARMED' : 'DISARMED'}
            </span>
            <Switch onChange={checked => send_mavcmd(
                'MAV_CMD_COMPONENT_ARM_DISARM',
                { param1: checked ? 1 : 0, param2: 0 }
            )} checked={armed || false} />
        </label>
    </div>
})


const RTLButton = reduxify({
    mapStateToProps: (state, props) => ({}),
    mapDispatchToProps: { send_mavcmd },
    render: ({ send_mavcmd }) => <div className='m-auto p-1 h-100 col-4'>
        <Button variant='outline-warning' className='secondary-button' onClick={
            () => send_mavcmd('MAV_CMD_NAV_RETURN_TO_LAUNCH')
        }>Return to launch</Button>
    </div>
})


const HookButton = reduxify({
    mapStateToProps: (state, props) => ({}),
    mapDispatchToProps: { send_mavcmd },
    render: ({ send_mavcmd }) => <div className='m-auto p-1 h-100 col-4'>
        <Button variant='outline-warning' className='secondary-button' onClick={
            () => send_mavcmd('TUKANO_RELEASE_HOOK')
        }>Release Hook</Button>
    </div>
})


const PauseButton = reduxify({
    mapStateToProps: (state, props) => ({
        target_system: state.mavlink.target_system,
        target_component: state.mavlink.target_component,
    }),
    mapDispatchToProps: { send_mavmsg },
    render: ({ send_mavmsg, target_system, target_component }) => (
        <div className='m-auto p-1 h-100 col-4'>
            <Button variant='outline-warning' className='secondary-button' onClick={() => {
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
        armed: createSelector(
            state => state.mavlink.HEARTBEAT,
            HEARTBEAT => HEARTBEAT && Boolean(HEARTBEAT.base_mode & 10 ** 7)
        )(state),
    }),
    mapDispatchToProps: { send_mavmsg },
    render: (props) => <TakeoffButtonComponent {...props} />
})

const TakeoffButtonComponent = ({ send_mavmsg, target_system, armed }) => {
    const [showModal, setShowModal] = useState(false)
    const [alt, setAlt] = useState(TAKEOFF_MIN_ALTITUDE)

    const takeoff = async () => {
        setShowModal(false)
        send_mavmsg('SET_MODE', { target_system, base_mode: 81, custom_mode: 4 })
        global.page.command_sender.send(
            { command: 'MAV_CMD_COMPONENT_ARM_DISARM', params: { param1: 1 } },
            { command: 'MAV_CMD_NAV_TAKEOFF', params: { param7: alt } }
        )
    }

    return <div className='m-auto p-1'>
        <Button
            variant='outline-warning'
            style={{ maxWidth: '100%' }}
            className='main-button'
            onClick={_ => setShowModal(true)}
            disabled={armed}
        >
            <img src='/static/img/takeoff.png' width='100' style={{ maxWidth: '100%' }} />
        </Button>
        <Modal
            visible={showModal}
            centered
            onOk={takeoff}
            onCancel={_ => setShowModal(false)}
            closable={false}
            title='Set takeoff altitude (meters)'
            width={350}
        >
            <p>The vehicle will fly up until desired altitude is reached:</p>
            <Row>
                <Slider
                    min={TAKEOFF_MIN_ALTITUDE}
                    max={TAKEOFF_MAX_ALTITUDE}
                    defaultValue={10}
                    onChange={setAlt}
                    value={alt}
                    style={{ minWidth: '60%', margin: 'auto' }}
                />
                <InputNumber
                    autoFocus
                    defaultValue={alt}
                    value={alt}
                    onChange={setAlt}
                    min={TAKEOFF_MIN_ALTITUDE}
                    max={TAKEOFF_MAX_ALTITUDE}
                />
            </Row>
        </Modal>
    </div>
}


const LandButton = reduxify({
    mapStateToProps: (state, props) => ({}),
    mapDispatchToProps: { send_mavcmd },
    render: ({ send_mavcmd }) => <div className='m-auto p-1'>
        <Button variant='outline-warning' style={{ maxWidth: '100%' }} className='main-button' onClick={
            () => send_mavcmd('MAV_CMD_NAV_LAND')
        }><img src='/static/img/land.png' width='100' style={{ maxWidth: '100%' }} /></Button>
    </div>
})


export const NerdInfo = reduxify({
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
                lat: GLOBAL_POSITION_INT.lat / 10 ** 7,
                lon: GLOBAL_POSITION_INT.lon / 10 ** 7,
                alt: GLOBAL_POSITION_INT.alt / 10 ** 3,
                relative_alt: GLOBAL_POSITION_INT.relative_alt / 10 ** 3,
            }
        )(state),
        battery: createSelector(
            state => state.mavlink.SYS_STATUS,
            SYS_STATUS => SYS_STATUS && voltage_to_percentage(SYS_STATUS.voltage_battery / 1000)
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
        flight_mode: createSelector(
            state => state.mavlink.HEARTBEAT,
            HEARTBEAT => HEARTBEAT && flightmode_from_heartbeat(HEARTBEAT)
        )(state),
    }),
    mapDispatchToProps: {},
    render: props => <NerdInfoComponent {...props} />
})


let heartbeat_timeout = null
const NerdInfoComponent = ({ flight, position, battery, gps, heartbeat, flight_mode }) => {
    const [path, setPath] = useState([])
    const [alive, setAlive] = useState(false)

    useEffect(() => {
        if (position) setPath([...path, { latitude: position.lat, longitude: position.lon }])
    }, [position && position.lat, position && position.lon])

    useEffect(() => {
        if (heartbeat) setAlive(true)
        if (heartbeat_timeout) clearTimeout(heartbeat_timeout)
        heartbeat_timeout = setTimeout(() => setAlive(false), 2000)
    }, [heartbeat])

    return <div className='nerdinfo-container'>
        <div className='row nerdinfo-inner'>
            <div className='col-6'>
                <div>Alt: {position ? `${position.relative_alt.toFixed(1)}m` : '--'}</div>
                <div>Lat: {position ? position.lat : '--'}</div>
                <div>Lon: {position ? position.lon : '--'}</div>
                <div>Battery: {battery ? `${battery.toFixed(1)}%` : '--'}</div>
                <div>Mode: {flight_mode}</div>
            </div>
            <div className='col-6'>
                <div>Speed: {gps ? `${gps.velocity}m/s` : '--'}</div>
                <div>GPS Count: {gps ? gps.satellites_visible : 0}</div>
                {/* <div>VDOP: {gps ? gps.epv : '--'}</div> */}
                {/* <div>HDOP: {gps ? gps.eph : '--'}</div> */}
                <div>Type: {gps ? gps.type : '--'}</div>
                <div>Time: {flight ? flight.time : '--'}</div>
                {/* <div>Flight distance: {getPathLength(path)}m</div> */}
                <div>
                    <div className={`${alive ? 'green' : 'red'} dot`}></div>&nbsp;
                    {alive ? 'Online' : 'No signal'}
                </div>
            </div>
        </div>
    </div>
}

const LobbyButton = () => (
    <div
        onClick={() => window.location.href = '/'}
        className='d-flex'
        style={{ color: '#e4cf77', cursor: 'pointer', marginLeft: 10, }}
    >
        <span className='material-icons m-auto'>arrow_back_ios</span>
        <span className='m-auto'>Lobby</span>
    </div>
)

export const Controls = () => <>
    <div className='controls-div'>
        <div className='controls-row'>
            <LobbyButton />
            <ArmedSwitch />
        </div>
        <div className='controls-row'>
            <TakeoffButton />
            <LandButton />
        </div>
        <div className='controls-row'>
            <RTLButton />
            <HookButton />
            <PauseButton />
        </div>
        <div className='controls-row'>
            <Log />
        </div>
    </div>
</>
