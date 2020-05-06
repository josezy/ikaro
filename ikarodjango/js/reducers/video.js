
export const video = (state={b64frame: null}, action) => {
    switch (action.type) {
        case 'VIDEO_FRAME': {
            const {b64frame} = action
            return {...state, b64frame}
        }

        default: {
            return state
        }
    }
}

export const onmessage_video = (le_message) => {
    global.page.store.dispatch({
        type: 'VIDEO_FRAME',
        b64frame: le_message.data
    })
}
