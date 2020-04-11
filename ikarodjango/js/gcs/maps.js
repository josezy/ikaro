import React, {PureComponent} from 'react'
import {reduxify} from '@/util/reduxify'

import {createSelector} from 'reselect'

import ReactMapboxGl, {Marker} from 'react-mapbox-gl'

import {
    MAP_INITIAL_CENTER, MAP_INITIAL_ZOOM
} from '@/util/constants'


const Mapbox = ReactMapboxGl({
    accessToken: global.props.map_key,
})

export const MapContainer = () =>
    <div style={{width:'100vw', height:'100vh', position:'absolute'}}>
        <Mapbox
            style="mapbox://styles/mapbox/satellite-v9"
            center={MAP_INITIAL_CENTER}
            zoom={MAP_INITIAL_ZOOM}
            className="mapbox-component"
        >
            <MarkerComponent />
        </Mapbox>
    </div>


const compute_center = createSelector(
    state => state.mavlink.GLOBAL_POSITION_INT,
    GLOBAL_POSITION_INT => GLOBAL_POSITION_INT && [
        GLOBAL_POSITION_INT.lon / 10**7,
        GLOBAL_POSITION_INT.lat / 10**7
    ]
)

const mapStateToProps = (state, props) => ({
    vehicle_center: compute_center(state)
})

const MarkerComponent = reduxify({
    mapStateToProps,
    mapDispatchToProps: {},
    render: props => props.vehicle_center ?
        <Marker coordinates={props.vehicle_center} anchor="center">
            <img src="/static/img/map_marker.png" />
        </Marker>
        : null
})
