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

class MapContainerComponent extends PureComponent {
    render() {
        const {vehicle_center} = this.props

        return <div style={{width:'100vw', height:'100vh', position:'absolute'}}>
            <Mapbox
                // style="mapbox://styles/mapbox/navigation-guidance-night-v4"
                style="mapbox://styles/mapbox/satellite-v9"
                center={vehicle_center || MAP_INITIAL_CENTER}
                zoom={MAP_INITIAL_ZOOM}
                className="mapbox-component"
            >
                {vehicle_center &&
                    <Marker coordinates={vehicle_center} anchor="center">
                        <img src="/static/img/map_marker.png" />
                    </Marker>
                }
            </Mapbox>
        </div>
    }
}


const compute_center = createSelector(
    state => state.mavlink.GLOBAL_POSITION_INT,
    GLOBAL_POSITION_INT => GLOBAL_POSITION_INT && {
        lat: GLOBAL_POSITION_INT.lat / 10**7,
        lon: GLOBAL_POSITION_INT.lon / 10**7,
    }
)

const mapStateToProps = (state, props) => ({
    vehicle_center: compute_center(state)
})

export const MapContainer = reduxify({
    mapStateToProps,
    mapDispatchToProps: {},
    render: (props) =>
        <MapContainerComponent {...props} />
})
