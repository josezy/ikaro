import { createSelector } from "reselect"
import { flightmode_from_heartbeat } from '@/util/mavutil'
import { MAV_TYPE_ENUM } from "../util/constants"

export const is_copter = createSelector(
    state => state.mavlink.HEARTBEAT,
    HEARTBEAT => HEARTBEAT && HEARTBEAT.type == MAV_TYPE_ENUM['QUADROTOR']
)

export const is_rover = createSelector(
    state => state.mavlink.HEARTBEAT,
    HEARTBEAT => HEARTBEAT && HEARTBEAT.type == MAV_TYPE_ENUM['GROUND_ROVER']
)

export const flight_mode = createSelector(
    state => state.mavlink.HEARTBEAT,
    HEARTBEAT => HEARTBEAT && flightmode_from_heartbeat(HEARTBEAT)
)
