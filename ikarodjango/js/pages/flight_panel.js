import React from 'react'
import ReactDOM from 'react-dom'

import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'

import { mavlink, onmessage_mavlink, send_mavmsg } from '@/reducers/mavlink'

import { SocketRouter } from '@/components/websocket'
import { CommandSender } from '@/components/command_sender'
import { SpectatorsEye } from '@/components/SpectatorsEye'
import { MapContainer } from '@/gcs/maps'
import { TukanoPanel } from '@/gcs/panels'
import { Controls, NerdInfo } from '@/gcs/controls'
import { Indicators } from '@/gcs/indicators'
import { VideoVisor } from '@/gcs/video'
import { request_data_stream, mavcmd_home_position_interval } from '@/util/mavutil'
import { ManualControl } from '@/gcs/manual_control'

import 'antd/dist/antd.less'

export const FlightPanel = {
    view: 'ui.views.pages.FlightPanel',

    init(props) {
        const initial_state = {}
        const store = this.setupStore({
            mavlink,
        }, initial_state)

        const mavlink_path = window.location.pathname.replace('flight', 'mavlink/room')
        const mav_socket = new SocketRouter(mavlink_path, onmessage_mavlink, this.onopen_mavlink)

        const command_sender = new CommandSender(store)

        // this group of references define everything available to a Page
        return { props, store, mav_socket, command_sender }
    },
    onopen_mavlink() {
        if (!global.props.is_pilot) return
        setInterval(() => global.page.store.dispatch(send_mavmsg('HEARTBEAT', {
            type: 6, // MAV_TYPE_GCS
            autopilot: 8, // MAV_AUTOPILOT_INVALID
            base_mode: 0,
            custom_mode: 0,
            system_status: 0,
            mavlink_version: 3,
        })), 1000)
        const rds_interval = setInterval(() => {
            const state = global.page.store.getState()
            const { target_system, target_component } = state.mavlink
            if (target_system && target_component) {
                request_data_stream(target_system, target_component)
                mavcmd_home_position_interval()
                clearInterval(rds_interval)
            }
        }, 500)
    },
    setupStore(reducers, initial_state) {
        // create the redux store for the page
        return createStore(combineReducers(
            reducers,
            initial_state,
        ), applyMiddleware(thunk))
    },
    render({ store }) {
        return (
            <Provider store={store}>
                <TukanoPanel />
                
                {global.props.is_pilot && <Controls />}
                <Indicators />
                <SpectatorsEye />
                
                <VideoVisor />  
                <MapContainer />
                
                <NerdInfo />
                <ManualControl/>
            </Provider>
        )
    },
    mount(props, mount_point) {
        global.page = this.init(props)
        ReactDOM.render(
            this.render(global.page),
            mount_point,
        )
    },
}

if (global.react_mount) {
    // we're in a browser, so mount the page
    FlightPanel.mount(global.props, global.react_mount)
}

