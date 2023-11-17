export const toggle_mapcam = () => ({
  type: 'TOGGLE_MAP_VIDEO',
})

const INITIAL_STATE = {
    smallVideo: false,
}

export const pageSettings = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'TOGGLE_MAP_VIDEO': {
            return {
                ...state,
                smallVideo: !state.smallVideo,
            }
        }

        default: {
            return state
        }
    }
}
