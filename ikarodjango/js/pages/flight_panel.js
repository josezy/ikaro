import React from 'react'
import ReactDOM from 'react-dom'

import {createStore, combineReducers} from 'redux'
import {Provider} from 'react-redux'

import {mavlink} from '@/reducers/mavlink'
import {video} from '@/reducers/video'

import {SocketRouter} from '@/components/websocket'
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

        const mav_socket = new SocketRouter(store, '/mavlink')
        const video_socket = new SocketRouter(store, '/video')

        // this group of references define everything available to a Page
        return {props, store, mav_socket, video_socket}
    },
    setupStore(reducers, initial_state) {
        // create the redux store for the page
        return createStore(combineReducers(
            reducers,
            initial_state,
        ))
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

