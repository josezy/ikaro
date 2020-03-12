import React, {PureComponent} from 'react'
import {reduxify} from '@/util/reduxify'

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
                style="mapbox://styles/mapbox/navigation-guidance-night-v4"
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

const compute_props = ({GLOBAL_POSITION_INT}) => {
    return {
        vehicle_center: GLOBAL_POSITION_INT && {
            lat: GLOBAL_POSITION_INT.lat / 10**7,
            lon: GLOBAL_POSITION_INT.lon / 10**7,
        }
    }
}

export const MapContainer = reduxify({
    mapStateToProps: ({mavlink}, props) => {
        return compute_props(mavlink || {})
    },
    mapDispatchToProps: {},
    render: (props) =>
        <MapContainerComponent {...props} />
})
