import React, {useState} from 'react'
import ReactMapboxGl, {Marker} from 'react-mapbox-gl'
import {createSelector} from 'reselect'
import {reduxify} from '@/util/reduxify'

import {goto_point} from '@/reducers/mavlink'

import {
    MAP_INITIAL_CENTER, MAP_INITIAL_ZOOM
} from '@/util/constants'


const Mapbox = ReactMapboxGl({
    accessToken: global.props.map_key,
})

const MapComponent = ({goto_point}) => {
    const [goto_coords, setGotoCoords] = useState(null)
    return <>
        <div style={{width:'100vw', height:'100vh', position:'absolute'}}>
            <Mapbox
                style="mapbox://styles/mapbox/satellite-v9"
                center={MAP_INITIAL_CENTER}
                zoom={MAP_INITIAL_ZOOM}
                className='mapbox-component'
                onClick={(map, e) => {
                    setGotoCoords([e.lngLat.lng, e.lngLat.lat])
                    goto_point(e.lngLat.lat, e.lngLat.lng)
                }}
            >
                <MarkerComponent />
                <GotoMarker center={goto_coords} />
            </Mapbox>
        </div>
    </>
}

export const MapContainer = reduxify({
    mapStateToProps: (state, props) => ({}),
    mapDispatchToProps: {goto_point},
    render: props => <MapComponent {...props} />
})

const GotoMarker = ({center}) => center ?
    <Marker coordinates={center}>
        <span className="material-icons" style={{color:'gold', fontSize:'2rem'}}>place</span>
    </Marker>
    : null


const mapStateToProps = (state, props) => ({
    vehicle_center: createSelector(
        state => state.mavlink.GLOBAL_POSITION_INT
            && state.mavlink.GLOBAL_POSITION_INT.lon,
        state => state.mavlink.GLOBAL_POSITION_INT
            && state.mavlink.GLOBAL_POSITION_INT.lat,
        (lon, lat) => lon && lat && [lon / 10**7, lat / 10**7]
    )(state),
    heading: state.mavlink.VFR_HUD && state.mavlink.VFR_HUD.heading,
})

const MarkerComponent = reduxify({
    mapStateToProps,
    mapDispatchToProps: {},
    render: ({vehicle_center, heading}) => {
        return vehicle_center ?
            <Marker coordinates={vehicle_center} anchor="center">
                <span className="material-icons" style={{
                    color:'red',
                    fontSize:'5rem',
                    transform:`rotate(${heading}deg)`
                }}>navigation</span>
            </Marker>
            : null
    }
})
