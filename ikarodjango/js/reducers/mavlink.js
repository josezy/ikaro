import {ALLOWED_MAVLINK_MSGS, VEHICLE_TYPES} from '@/util/constants'


export const send_mavcmd = (command, params={}) => ({
    type: 'MAVCMD',
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
                return {
                    ...state,
                    [mavmsg.mavtype]: mavmsg.message,
                }
            } else {
                return state
            }
        }

        case 'MAVCMD': {
            const {command, params} = action.args
            global.page.socket.send_mavlink_command(command, params)
            return state
        }

        default: {
            return state
        }
    }
}
