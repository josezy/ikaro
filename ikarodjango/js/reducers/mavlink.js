import {ALLOWED_MAVLINK_MSGS, VEHICLE_TYPES} from '@/util/constants'

export const initial_state = {
    message: undefined,
}

const valid_action = (action) => {
    if (!ALLOWED_MAVLINK_MSGS.includes(action.type)) return false
    if (action.type == 'HEARTBEAT' && !VEHICLE_TYPES.includes(action.message.type)) return false
    return true
}

export const mavlink = (state=initial_state, action) => {
    if (valid_action(action)) {
        return {
            ...state,
            [action.type]: action.message,
        }
    } else {
        return state
    }
}
