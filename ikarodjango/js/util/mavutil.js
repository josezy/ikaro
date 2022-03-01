import {
    MAV_AUTOPILOT, MAV_TYPE, MAVLINK_MESSAGES,
    PX4_CUSTOM_MAIN_MODE, PX4_CUSTOM_SUB_MODE,
    mode_mapping_acm, mode_mapping_apm, mode_mapping_rover,
    mode_mapping_tracker, mode_mapping_sub, auto_mode_flags,
    CELLS, CELL_RANGE, MAV_MODE_FLAG
} from '@/util/constants'

import { send_mavmsg, send_mavcmd } from '@/reducers/mavlink'

const interpret_px4_mode = (base_mode, custom_mode) => {
    const custom_main_mode = (custom_mode & 0xFF0000) >> 16
    const custom_sub_mode = (custom_mode & 0xFF000000) >> 24

    if (Boolean(base_mode & MAV_MODE_FLAG.MAV_MODE_FLAG_MANUAL_INPUT_ENABLED)) {
        switch (custom_main_mode) {
            case PX4_CUSTOM_MAIN_MODE.PX4_CUSTOM_MAIN_MODE_MANUAL:
                return 'MANUAL'
            case PX4_CUSTOM_MAIN_MODE.PX4_CUSTOM_MAIN_MODE_ACRO:
                return "ACRO"
            case PX4_CUSTOM_MAIN_MODE.PX4_CUSTOM_MAIN_MODE_RATTITUDE:
                return "RATTITUDE"
            case PX4_CUSTOM_MAIN_MODE.PX4_CUSTOM_MAIN_MODE_STABILIZED:
                return "STABILIZED"
            case PX4_CUSTOM_MAIN_MODE.PX4_CUSTOM_MAIN_MODE_ALTCTL:
                return "ALTCTL"
            case PX4_CUSTOM_MAIN_MODE.PX4_CUSTOM_MAIN_MODE_POSCTL:
                return "POSCTL"
        }
    } else if (base_mode & auto_mode_flags == auto_mode_flags) {
        if (Boolean(custom_main_mode & PX4_CUSTOM_MAIN_MODE.PX4_CUSTOM_MAIN_MODE_AUTO)) {
            switch (custom_sub_mode) {
                case PX4_CUSTOM_SUB_MODE.PX4_CUSTOM_SUB_MODE_AUTO_MISSION:
                    return "MISSION"
                case PX4_CUSTOM_SUB_MODE.PX4_CUSTOM_SUB_MODE_AUTO_TAKEOFF:
                    return "TAKEOFF"
                case PX4_CUSTOM_SUB_MODE.PX4_CUSTOM_SUB_MODE_AUTO_LOITER:
                    return "LOITER"
                case PX4_CUSTOM_SUB_MODE.PX4_CUSTOM_SUB_MODE_AUTO_FOLLOW_TARGET:
                    return "FOLLOWME"
                case PX4_CUSTOM_SUB_MODE.PX4_CUSTOM_SUB_MODE_AUTO_RTL:
                    return "RTL"
                case PX4_CUSTOM_SUB_MODE.PX4_CUSTOM_SUB_MODE_AUTO_LAND:
                    return "LAND"
                case PX4_CUSTOM_SUB_MODE.PX4_CUSTOM_SUB_MODE_AUTO_RTGS:
                    return "RTGS"
                case PX4_CUSTOM_SUB_MODE.PX4_CUSTOM_SUB_MODE_OFFBOARD:
                    return "OFFBOARD"
            }
        }
    }

    return "UNKNOWN"
}


const mode_mapping_bynumber = type => {
    /**
        return object mapping mode numbers to name, or null if unknown
    **/

    const mav_type = MAV_TYPE[type]
    const COPTERS = [
        'QUADROTOR', 'HELICOPTER', 'HEXAROTOR', 'OCTOROTOR', 'DODECAROTOR',
        'COAXIAL', 'TRICOPTER'
    ]
    if (COPTERS.includes(mav_type)) return mode_mapping_acm
    if (mav_type == 'FIXED_WING') return mode_mapping_apm
    if (['GROUND_ROVER', 'SURFACE_BOAT'].includes(mav_type)) return mode_mapping_rover
    if (mav_type == 'ANTENNA_TRACKER') return mode_mapping_tracker
    if (mav_type == 'SUBMARINE') return mode_mapping_sub

    return null
}

export const flightmode_from_heartbeat = HEARTBEAT => {
    let flightmode = null
    const { base_mode, custom_mode, autopilot, type } = HEARTBEAT

    if (MAV_AUTOPILOT[autopilot] == 'PX4') {
        flightmode = interpret_px4_mode(base_mode, custom_mode)
    } else {
        flightmode = (mode_mapping_bynumber(type) || {})[custom_mode]
    }
    return flightmode
}

export const voltage_to_percentage = voltage => {
    if (!voltage) return undefined
    const VOLTAGES = CELLS.map(s => CELL_RANGE.map(v => v * s))
    const BATT_RANGE = VOLTAGES.find(range => voltage < range[1])
    const perc = (voltage - BATT_RANGE[0]) * 100 / (BATT_RANGE[1] - BATT_RANGE[0])
    return Math.min(Math.max(perc, 0), 100)
}

export const request_data_stream = (target_system, target_component) => {
    global.page.store.dispatch(send_mavmsg('REQUEST_DATA_STREAM', {
        target_system,
        target_component,
        req_stream_id: 1,
        req_message_rate: 2,
        start_stop: 1
    }))
    global.page.store.dispatch(send_mavmsg('REQUEST_DATA_STREAM', {
        target_system,
        target_component,
        req_stream_id: 2,
        req_message_rate: 2,
        start_stop: 1
    }))
    global.page.store.dispatch(send_mavmsg('REQUEST_DATA_STREAM', {
        target_system,
        target_component,
        req_stream_id: 3,
        req_message_rate: 2,
        start_stop: 1
    }))
    global.page.store.dispatch(send_mavmsg('REQUEST_DATA_STREAM', {
        target_system,
        target_component,
        req_stream_id: 6,
        req_message_rate: 3,
        start_stop: 1
    }))
    global.page.store.dispatch(send_mavmsg('REQUEST_DATA_STREAM', {
        target_system,
        target_component,
        req_stream_id: 10,
        req_message_rate: 10,
        start_stop: 1
    }))
    global.page.store.dispatch(send_mavmsg('REQUEST_DATA_STREAM', {
        target_system,
        target_component,
        req_stream_id: 11,
        req_message_rate: 10,
        start_stop: 1
    }))
    global.page.store.dispatch(send_mavmsg('REQUEST_DATA_STREAM', {
        target_system,
        target_component,
        req_stream_id: 12,
        req_message_rate: 3,
        start_stop: 1
    }))
}

export const mavcmd_home_position_interval = () => {
    global.page.store.dispatch(send_mavcmd('MAV_CMD_SET_MESSAGE_INTERVAL', {
        param1: MAVLINK_MESSAGES['HOME_POSITION'],
        param2: 4000000, // every 4 seconds
    }))
}
