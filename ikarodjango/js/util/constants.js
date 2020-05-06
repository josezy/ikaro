
export const ALLOWED_MAVLINK_MSGS = [
    'HEARTBEAT',
    'GLOBAL_POSITION_INT',
    'TUKANO_DATA',
    'SYS_STATUS',
    'GPS_RAW_INT',
    'VFR_HUD',
    'ATTITUDE',
    'COMMAND_ACK',
]

export const MAP_INITIAL_CENTER = [-75.393921, 6.149080]
export const MAP_INITIAL_ZOOM = [16]

export const VEHICLE_TYPES = [
    // 0, // MAV_TYPE_GENERIC
    // 1, // MAV_TYPE_FIXED_WING
    2, // MAV_TYPE_QUADROTOR
    // 3, // MAV_TYPE_COAXIAL
    // 4, // MAV_TYPE_HELICOPTER
    // 5, // MAV_TYPE_ANTENNA_TRACKER
    // 6, // MAV_TYPE_GCS
    // 7, // MAV_TYPE_AIRSHIP
    // 8, // MAV_TYPE_FREE_BALLOON
    // 9, // MAV_TYPE_ROCKET
    // 10, // MAV_TYPE_GROUND_ROVER
    // 11, // MAV_TYPE_SURFACE_BOAT
    // 12, // MAV_TYPE_SUBMARINE
    // 13, // MAV_TYPE_HEXAROTOR
    // 14, // MAV_TYPE_OCTOROTOR
    // 15, // MAV_TYPE_TRICOPTER
    // 16, // MAV_TYPE_FLAPPING_WING
    // 17, // MAV_TYPE_KITE
    // 18, // MAV_TYPE_ONBOARD_CONTROLLER
    // 19, // MAV_TYPE_VTOL_DUOROTOR
    // 20, // MAV_TYPE_VTOL_QUADROTOR
    // 21, // MAV_TYPE_VTOL_TILTROTOR
    // 22, // MAV_TYPE_VTOL_RESERVED2
    // 23, // MAV_TYPE_VTOL_RESERVED3
    // 24, // MAV_TYPE_VTOL_RESERVED4
    // 25, // MAV_TYPE_VTOL_RESERVED5
    // 26, // MAV_TYPE_GIMBAL
    // 27, // MAV_TYPE_ADSB
    // 28, // MAV_TYPE_PARAFOIL
    // 29, // MAV_TYPE_DODECAROTOR
    // 30, // MAV_TYPE_CAMERA
    // 31, // MAV_TYPE_CHARGING_STATION
    // 32, // MAV_TYPE_FLARM
    // 33, // MAV_TYPE_SERVO
]

export const GPS_FIX_TYPE = [
    'NO GPS',
    'NO FIX',
    '2D FIX',
    '3D FIX',
    'DGPS',
    'RTK FLOAT',
    'RTK FIXED',
    'STATIC',
    'PPP',
]

export const MAVLINK_MESSAGES = {
    MAV_CMD_NAV_WAYPOINT:               16,
    MAV_CMD_NAV_TAKEOFF:                22,
    MAV_CMD_COMPONENT_ARM_DISARM:       400,
}

export const MAVLINK_IDS = Object.entries(MAVLINK_MESSAGES).reduce(
    (acc, entry) => ({...acc, [entry[1]]: entry[0]})
, {})
