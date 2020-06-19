import {
    MAV_AUTOPILOT, MAV_TYPE,
    mode_mapping_acm, mode_mapping_apm, mode_mapping_rover,
    mode_mapping_tracker, mode_mapping_sub
} from '@/util/constants'


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
    const {base_mode, custom_mode, autopilot, type} = HEARTBEAT

    if (MAV_AUTOPILOT[autopilot] == 'PX4') {
        // flightmode = mavutil.interpret_px4_mode(base_mode, custom_mode)
        throw new Error('PX4 not supported yet')
    } else {
        flightmode = mode_mapping_bynumber(type)[custom_mode]
    }
    return flightmode
}
