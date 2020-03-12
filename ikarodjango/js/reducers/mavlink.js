import {ALLOWED_MAVLINK_MSGS} from '@/util/constants'

export const initial_state = {
    message: undefined,
}

export const mavlink = (state=initial_state, action) => {
    if (ALLOWED_MAVLINK_MSGS.includes(action.type)){
        return {
            ...state,
            [action.type]: action.message,
        }
    } else {
        return state
    }
}
