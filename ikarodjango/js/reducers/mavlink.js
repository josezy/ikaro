import {
    ALLOWED_MAVLINK_MSGS, MAVLINK_COMMANDS
} from '@/util/constants'


export const set_servo_trim = (servo, param_value) => (dispatch, getState) => {
    const { target_system, target_component } = getState().mavlink

    if (target_system == undefined || target_component == undefined) return null

    return dispatch(send_mavmsg('PARAM_SET', {
        target_system,
        target_component,
        param_id: `SERVO${servo}_TRIM`,
        param_value,
        param_type: 4
    }))
}

export const rover_rc_channels_override = (throttle, roll, direction = true) => (dispatch, getState) => {
    const { target_system, target_component } = getState().mavlink

    return dispatch(send_mavmsg('RC_CHANNELS_OVERRIDE', {
        target_system,
        target_component,
        chan1_raw: roll,
        chan2_raw: 0,
        chan3_raw: throttle,
        chan4_raw: 0,
        chan5_raw: 0,
        chan6_raw: 0,
        chan7_raw: direction ? 1000 : 2000,
        chan8_raw: direction ? 2000 : 1000,
    }))
}

export const goto_point = (lat, lng) => (dispatch, getState) => {
    const { target_system, target_component } = getState().mavlink
    const { relative_alt } = getState().mavlink.GLOBAL_POSITION_INT

    if (
        target_system == undefined
        || target_component == undefined
        || relative_alt == undefined
    ) return null

    return dispatch(send_mavmsg('MISSION_ITEM', {
        target_system,
        target_component,
        seq: 0,
        frame: 3,
        command: MAVLINK_COMMANDS['MAV_CMD_NAV_WAYPOINT'],
        current: 2,
        autocontinue: 1,
        param1: 0.0,
        param2: 0.0,
        param3: 0.0,
        param4: 0.0,
        x: lat,
        y: lng,
        z: relative_alt / 10 ** 3
    }))
}

export const send_mavmsg = (message, params = {}) => ({
    type: 'SEND_MAVMSG',
    args: { message, params }
})

export const send_mavcmd = (command, params = {}) => ({
    type: 'SEND_MAVCMD',
    args: { command, params }
})

const valid_mavmsg = (mavmsg) => {
    if (!ALLOWED_MAVLINK_MSGS.includes(mavmsg.mavtype)) return false
    return true
}

export const mavlink = (state = {}, action) => {
    switch (action.type) {
        case 'MAVMSG': {
            const mavmsg = action.args
            if (valid_mavmsg(mavmsg)) {
                if (mavmsg.mavtype == 'HEARTBEAT') return {
                    ...state,
                    target_system: mavmsg.srcSystem,
                    target_component: mavmsg.srcComponent,
                    [mavmsg.mavtype]: mavmsg.message,
                }
                return {
                    ...state,
                    [mavmsg.mavtype]: mavmsg.message,
                }
            } else {
                return state
            }
        }

        case 'SEND_MAVCMD': {
            const { command, params } = action.args
            const { target_system, target_component } = state
            global.page.mav_socket.send({
                target_system,
                target_component,
                command,
                params
            })
            return state
        }

        case 'SEND_MAVMSG': {
            const { message, params } = action.args
            global.page.mav_socket.send({ message, params })
            return state
        }

        default: {
            return state
        }
    }
}

export const onmessage_mavlink = (le_message) => {
    const message = JSON.parse(le_message.data)
    if (message.mavpackettype) {
        const { mavpackettype, srcSystem, srcComponent, ...mav_msg } = message
        global.page.store.dispatch({
            type: 'MAVMSG',
            args: {
                srcSystem,
                srcComponent,
                mavtype: mavpackettype,
                message: mav_msg
            }
        })
    }
}
