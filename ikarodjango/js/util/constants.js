
// Application constants

import { arrayToObject } from "./javascript"

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
    'MISSION_COUNT',
    'MISSION_ITEM',
    'PARAM_VALUE',
    'HOME_POSITION',
    'SET_MODE',
    'RC_CHANNELS_OVERRIDE',
    'RAW_IMU',
]

export const MAP_INITIAL_CENTER = [-75.393921, 6.149080]
export const MAP_INITIAL_ZOOM = [16]
export const TAKEOFF_MIN_ALTITUDE = 10
export const TAKEOFF_MAX_ALTITUDE = 150

// Battery
export const CELLS = [1, 2, 3, 4, 5]
export const CELL_RANGE = [3.7, 4.2]


export const RC_CHANNELS_OVERRIDE_INTERVAL = 1000 // Based on AFS_RC_FAIL_TIME parameter
export const MAX_THROTTLE = 2000
export const MIN_THROTTLE = 1500
export const ROLL_LEFT = 1000
export const ROLL_RIGHT = 2000
export const ROLL_NEUTRAL = 1500

export const MANUAL_CONTROL_TYPES = {
    "KEYBOARD": 0,
    "JOYSTICK": 1,
}

// =============================================================================
// ==================[[ MAVLINK specific constants/enums ]]=====================
// =============================================================================

export const MAV_AUTOPILOT = [
    'GENERIC',
    'RESERVED',
    'SLUGS',
    'ARDUPILOTMEGA',
    'OPENPILOT',
    'GENERIC_WAYPOINTS_ONLY',
    'GENERIC_WAYPOINTS_AND_SIMPLE_NAVIGATION_ONLY',
    'GENERIC_MISSION_FULL',
    'INVALID',
    'PPZ',
    'UDB',
    'FP',
    'PX4',
    'SMACCMPILOT',
    'AUTOQUAD',
    'ARMAZILA',
    'AEROB',
    'ASLUAV',
    'SMARTAP',
    'AIRRAILS',
]

export const MAV_AUTOPILOT_ENUM = arrayToObject(MAV_AUTOPILOT)

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

export const MAV_TYPE_ENUM = arrayToObject(MAV_TYPE)

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

const switch_entries = (acc, entry) => ({ ...acc, [entry[1]]: entry[0] })

export const MAVLINK_COMMANDS = {
    MAV_CMD_NAV_WAYPOINT: 16,
    MAV_CMD_NAV_TAKEOFF: 22,
    MAV_CMD_COMPONENT_ARM_DISARM: 400,
}
export const MAVLINK_COMMAND_IDS = Object.entries(MAVLINK_COMMANDS).reduce(switch_entries, {})


export const MAVLINK_MESSAGES = {
    HOME_POSITION: 242,
}
export const MAVLINK_MESSAGE_IDS = Object.entries(MAVLINK_MESSAGES).reduce(switch_entries, {})


export const MAV_MODE_FLAG = {
    MAV_MODE_FLAG_SAFETY_ARMED: 128,
    MAV_MODE_FLAG_MANUAL_INPUT_ENABLED: 64,
    MAV_MODE_FLAG_HIL_ENABLED: 32,
    MAV_MODE_FLAG_STABILIZE_ENABLED: 16,
    MAV_MODE_FLAG_GUIDED_ENABLED: 8,
    MAV_MODE_FLAG_AUTO_ENABLED: 4,
    MAV_MODE_FLAG_TEST_ENABLED: 2,
    MAV_MODE_FLAG_CUSTOM_MODE_ENABLED: 1,
}

export const auto_mode_flags = (
    MAV_MODE_FLAG.MAV_MODE_FLAG_AUTO_ENABLED
    | MAV_MODE_FLAG.MAV_MODE_FLAG_GUIDED_ENABLED
    | MAV_MODE_FLAG.MAV_MODE_FLAG_STABILIZE_ENABLED
)

export const PX4_CUSTOM_MAIN_MODE = {
    PX4_CUSTOM_MAIN_MODE_MANUAL: 1,
    PX4_CUSTOM_MAIN_MODE_ALTCTL: 2,
    PX4_CUSTOM_MAIN_MODE_POSCTL: 3,
    PX4_CUSTOM_MAIN_MODE_AUTO: 4,
    PX4_CUSTOM_MAIN_MODE_ACRO: 5,
    PX4_CUSTOM_MAIN_MODE_OFFBOARD: 6,
    PX4_CUSTOM_MAIN_MODE_STABILIZED: 7,
    PX4_CUSTOM_MAIN_MODE_RATTITUDE: 8,
}

export const PX4_CUSTOM_SUB_MODE = {
    PX4_CUSTOM_SUB_MODE_OFFBOARD: 0,
    PX4_CUSTOM_SUB_MODE_AUTO_READY: 1,
    PX4_CUSTOM_SUB_MODE_AUTO_TAKEOFF: 2,
    PX4_CUSTOM_SUB_MODE_AUTO_LOITER: 3,
    PX4_CUSTOM_SUB_MODE_AUTO_MISSION: 4,
    PX4_CUSTOM_SUB_MODE_AUTO_RTL: 5,
    PX4_CUSTOM_SUB_MODE_AUTO_LAND: 6,
    PX4_CUSTOM_SUB_MODE_AUTO_RTGS: 7,
    PX4_CUSTOM_SUB_MODE_AUTO_FOLLOW_TARGET: 8,
}


export const mode_mapping_apm = {
    0: 'MANUAL',
    1: 'CIRCLE',
    2: 'STABILIZE',
    3: 'TRAINING',
    4: 'ACRO',
    5: 'FBWA',
    6: 'FBWB',
    7: 'CRUISE',
    8: 'AUTOTUNE',
    10: 'AUTO',
    11: 'RTL',
    12: 'LOITER',
    13: 'TAKEOFF',
    14: 'AVOID_ADSB',
    15: 'GUIDED',
    16: 'INITIALISING',
    17: 'QSTABILIZE',
    18: 'QHOVER',
    19: 'QLOITER',
    20: 'QLAND',
    21: 'QRTL',
    22: 'QAUTOTUNE',
    23: 'QACRO',
}
export const mode_mapping_acm = {
    0: 'STABILIZE',
    1: 'ACRO',
    2: 'ALT_HOLD',
    3: 'AUTO',
    4: 'GUIDED',
    5: 'LOITER',
    6: 'RTL',
    7: 'CIRCLE',
    8: 'POSITION',
    9: 'LAND',
    10: 'OF_LOITER',
    11: 'DRIFT',
    13: 'SPORT',
    14: 'FLIP',
    15: 'AUTOTUNE',
    16: 'POSHOLD',
    17: 'BRAKE',
    18: 'THROW',
    19: 'AVOID_ADSB',
    20: 'GUIDED_NOGPS',
    21: 'SMART_RTL',
    22: 'FLOWHOLD',
    23: 'FOLLOW',
    24: 'ZIGZAG',
}
export const mode_mapping_rover = {
    0: 'MANUAL',
    1: 'ACRO',
    2: 'LEARNING',
    3: 'STEERING',
    4: 'HOLD',
    5: 'LOITER',
    6: 'FOLLOW',
    7: 'SIMPLE',
    10: 'AUTO',
    11: 'RTL',
    12: 'SMART_RTL',
    15: 'GUIDED',
    16: 'INITIALISING'
}
export const mode_mapping_tracker = {
    0: 'MANUAL',
    1: 'STOP',
    2: 'SCAN',
    4: 'GUIDED',
    10: 'AUTO',
    16: 'INITIALISING'
}
export const mode_mapping_sub = {
    0: 'STABILIZE',
    1: 'ACRO',
    2: 'ALT_HOLD',
    3: 'AUTO',
    4: 'GUIDED',
    7: 'CIRCLE',
    9: 'SURFACE',
    16: 'POSHOLD',
    19: 'MANUAL',
}
