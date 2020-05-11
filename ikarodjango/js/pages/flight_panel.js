import React from 'react'
import ReactDOM from 'react-dom'

import {createStore, combineReducers, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {mavlink, onmessage_mavlink} from '@/reducers/mavlink'
import {video, onmessage_video} from '@/reducers/video'

import {SocketRouter} from '@/components/websocket'
import {CommandSender} from '@/components/command_sender'
import {MapContainer} from '@/gcs/maps'
import {TukanoPanel} from '@/gcs/panels'
import {Controls} from '@/gcs/controls'
import {Indicators} from '@/gcs/indicators'


export const FlightPanel = {
    view: 'ui.views.pages.FlightPanel',

    init(props) {
        const initial_state = {}
        const store = this.setupStore({
            mavlink,
            video
        }, initial_state)

        const mav_socket = new SocketRouter(store, '/mavlink', onmessage_mavlink)
        const video_socket = new SocketRouter(store, '/video', onmessage_video)

        const command_sender = new CommandSender(store)

        // this group of references define everything available to a Page
        return {props, store, mav_socket, video_socket, command_sender}
    },
    setupStore(reducers, initial_state) {
        // create the redux store for the page
        return createStore(combineReducers(
            reducers,
            initial_state,
        ), applyMiddleware(thunk))
    },
    render({store}) {
        return (
            <Provider store={store}>
                <MapContainer />
                <TukanoPanel />
                <Controls />
                <Indicators />
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

