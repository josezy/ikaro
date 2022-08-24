import React from 'react'
import ReactDOM from 'react-dom'

import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'

import { mavlink, onmessage_mavlink, send_mavmsg } from '@/reducers/mavlink'
import { pageSettings, toggle_mapcam } from '@/reducers/pageSettings'

import { SocketRouter } from '@/components/websocket'
import { CommandSender } from '@/components/command_sender'
// import { SpectatorsEye } from '@/components/SpectatorsEye'
import { MapContainer } from '@/gcs/maps'
import { TukanoPanel } from '@/gcs/panels'
import { Controls, NerdInfo } from '@/gcs/controls'
// import { Indicators } from '@/gcs/indicators'
import { VideoVisor } from '@/gcs/video'
import { request_data_stream, mavcmd_home_position_interval } from '@/util/mavutil'
import { reduxify } from '@/util/reduxify'

import 'antd/dist/antd.less'
import { Button } from 'antd'

const MapVideoTogglerComponent = ({ toggle_mapcam }) => (
    <div className='map-video-toggler'>
        <Button onClick={toggle_mapcam}>
            <span className="material-icons" style={{
                fontSize: '2rem',
                width: '100%',
                height: '100%',
                margin: '10px 6px',
            }}>cameraswitch</span>
        </Button>
    </div>
)

const MapVideoToggler = reduxify({
    mapStateToProps: (state, props) => ({ }),
    mapDispatchToProps: { toggle_mapcam },
    render: props => <MapVideoTogglerComponent {...props} />
})

export const FlightPanel = {
    view: 'ui.views.pages.FlightPanel',

    init(props) {
        const initial_state = {}
        const store = this.setupStore({
            mavlink,
            pageSettings,
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
                <MapContainer />
                <TukanoPanel />
                {/* {global.props.is_pilot && <Controls />} */}
                {/* <Indicators /> */}
                {/* <SpectatorsEye /> */}
                <NerdInfo />
                <VideoVisor />
                <MapVideoToggler />
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

