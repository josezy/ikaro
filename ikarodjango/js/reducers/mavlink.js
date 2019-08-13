export const initial_state = {
    // message: ''
}

export const mavlink = (state=initial_state, action) => {
    switch (action.type) {
        case 'HEARTBEAT':
        case 'GLOBAL_POSITION_INT':
            return {
                ...state,
                [action.type]: action.message,
            }
        default:
            return state
    }
}
