
export const ALLOWED_MAVLINK_MSGS = [
    'HEARTBEAT',
    'GLOBAL_POSITION_INT',
    'TUKANO_DATA',
    'SYS_STATUS',
    'GPS_RAW_INT',
    'VFR_HUD',
    'ATTITUDE',
    'COMMAND_ACK',
    'STATUSTEXT',
]
export const ALLOWED_MAV_TYPES = ['QUADROTOR']

export const MAP_INITIAL_CENTER = [-75.393921, 6.149080]
export const MAP_INITIAL_ZOOM = [16]


export const MAV_TYPE = [
    'GENERIC',
    'FIXED_WING',
    'QUADROTOR',
    'COAXIAL',
    'HELICOPTER',
    'ANTENNA_TRACKER',
    'GCS',
    'AIRSHIP',
    'FREE_BALLOON',
    'ROCKET',
    'GROUND_ROVER',
    'SURFACE_BOAT',
    'SUBMARINE',
    'HEXAROTOR',
    'OCTOROTOR',
    'TRICOPTER',
    'FLAPPING_WING',
    'KITE',
    'ONBOARD_CONTROLLER',
    'VTOL_DUOROTOR',
    'VTOL_QUADROTOR',
    'VTOL_TILTROTOR',
    'VTOL_RESERVED2',
    'VTOL_RESERVED3',
    'VTOL_RESERVED4',
    'VTOL_RESERVED5',
    'GIMBAL',
    'ADSB',
    'PARAFOIL',
    'DODECAROTOR',
    'CAMERA',
    'CHARGING_STATION',
    'FLARM',
    'SERVO',
    'ODID',
]

export const GPS_FIX_TYPE = [
    'NO_GPS',
    'NO_FIX',
    '2D_FIX',
    '3D_FIX',
    'DGPS',
    'RTK_FLOAT',
    'RTK_FIXED',
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
