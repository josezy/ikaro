import {ALLOWED_MAVLINK_MSGS, VEHICLE_TYPES} from '@/util/constants'


export const send_mavmsg = (message, params={}) => ({
    type: 'SEND_MAVMSG',
    args: {message, params}
})

export const send_mavcmd = (command, params={}) => ({
    type: 'SEND_MAVCMD',
    args: {command, params}
})

const valid_mavmsg = (mavmsg) => {
    if (!ALLOWED_MAVLINK_MSGS.includes(mavmsg.mavtype)) return false
    if (mavmsg.mavtype == 'HEARTBEAT' && !VEHICLE_TYPES.includes(mavmsg.message.type)) return false
    return true
}

export const mavlink = (state={}, action) => {
    switch (action.type) {
        case 'MAVMSG': {
            const mavmsg = action.args
            if (valid_mavmsg(mavmsg)) {
                if (mavmsg == 'HEARTBEAT') return {
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
            const {command, params} = action.args
            const {target_system, target_component} = state
            global.page.socket.send_mavlink({
                target_system,
                target_component,
                command,
                ...params
            })
            return state
        }

        case 'SEND_MAVMSG': {
            const {message, params} = action.args
            global.page.socket.send_mavlink({message, ...params})
            return state
        }

        default: {
            return state
        }
    }
}
