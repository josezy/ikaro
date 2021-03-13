import React, { useState, useEffect } from 'react'
import ReactMapboxGl, {
    Marker, MapContext, Source, Layer
} from 'react-mapbox-gl'
import { createSelector } from 'reselect'
import { reduxify } from '@/util/reduxify'

import { goto_point, send_mavmsg } from '@/reducers/mavlink'

import {
    MAP_INITIAL_CENTER, MAP_INITIAL_ZOOM, MAVLINK_MESSAGES
} from '@/util/constants'


const Mapbox = ReactMapboxGl({
    accessToken: global.props.map_key,
    logoPosition: 'bottom-right',
})

const MapComponent = ({ goto_point }) => {
    const [goto_coords, setGotoCoords] = useState(null)
    return <>
        <div style={{ width: '100vw', height: '100vh', position: 'absolute' }}>
            <Mapbox
                // style="mapbox://styles/mapbox/navigation-guidance-night-v4"
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
                <MissionPath />
                <TraveledPath />
                <MapContext.Consumer>
                    {map => {
                        global.page.map = map
                        setInterval(() => {
                            const bounds = map.getBounds()
                            const { mavlink } = global.page.store.getState()
                            if (!mavlink) return

                            const { GLOBAL_POSITION_INT } = mavlink
                            if (!GLOBAL_POSITION_INT) return

                            const [lngVeh, latVeh] = [
                                GLOBAL_POSITION_INT.lon / 10 ** 7,
                                GLOBAL_POSITION_INT.lat / 10 ** 7
                            ]
                            if (lngVeh == 0 && latVeh == 0) return

                            const latOut = latVeh < bounds._sw.lat || latVeh > bounds._ne.lat
                            const lngOut = lngVeh < bounds._sw.lng || lngVeh > bounds._ne.lng

                            if (latOut || lngOut) map.setCenter([lngVeh, latVeh])
                        }, 10000)
                    }}
                </MapContext.Consumer>
            </Mapbox>
        </div>
    </>
}

export const MapContainer = reduxify({
    mapStateToProps: (state, props) => ({}),
    mapDispatchToProps: { goto_point },
    render: props => <MapComponent {...props} />
})

const GotoMarker = ({ center }) => center ?
    <Marker coordinates={center}>
        <span className="material-icons gold" style={{ fontSize: '2rem' }}>place</span>
    </Marker>
    : null

const MarkerComponent = reduxify({
    mapStateToProps: (state, props) => ({
        vehicle_center: createSelector(
            state => state.mavlink.GLOBAL_POSITION_INT
                && state.mavlink.GLOBAL_POSITION_INT.lon,
            state => state.mavlink.GLOBAL_POSITION_INT
                && state.mavlink.GLOBAL_POSITION_INT.lat,
            (lon, lat) => lon && lat && [lon / 10 ** 7, lat / 10 ** 7]
        )(state),
        heading: state.mavlink.VFR_HUD && state.mavlink.VFR_HUD.heading,
    }),
    mapDispatchToProps: {},
    render: ({ vehicle_center, heading }) => {
        return vehicle_center ?
            <Marker coordinates={vehicle_center} anchor="center">
                <span className="material-icons" style={{
                    color: 'red',
                    fontSize: '3.5rem',
                    transform: `rotate(${heading}deg)`
                }}>navigation</span>
            </Marker>
            : null
    }
})

const TraveledPath = reduxify({
    mapStateToProps: (state, props) => ({
        vehicle_center: createSelector(
            state => state.mavlink.GLOBAL_POSITION_INT
                && state.mavlink.GLOBAL_POSITION_INT.lon,
            state => state.mavlink.GLOBAL_POSITION_INT
                && state.mavlink.GLOBAL_POSITION_INT.lat,
            (lon, lat) => lon && lat && [lon / 10 ** 7, lat / 10 ** 7]
        )(state)
    }),
    mapDispatchToProps: {},
    render: props => <TraveledPathComponent {...props} />
})

const TraveledPathComponent = ({ vehicle_center }) => {
    const [path, setPath] = useState([])
    useEffect(() => {
        const last_coord = path.slice(-1)[0]
        const same_coord = (
            last_coord
            && last_coord[0] == vehicle_center[0]
            && last_coord[1] == vehicle_center[1]
        )
        if (vehicle_center && !same_coord) {
            setPath([...path.slice(-3000), vehicle_center])
        }
    }, [vehicle_center])

    const geoJsonSource = {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': path
            }
        }
    }
    const layout = {
        'line-join': 'round',
        'line-cap': 'round'
    }
    const paint = {
        'line-color': '#f00',
        'line-width': 4
    }
    return <>
        <Source id="traveled_path" geoJsonSource={geoJsonSource} />
        <Layer type="line" sourceId="traveled_path" layout={layout} paint={paint} />
    </>
}

const MissionPath = reduxify({
    mapStateToProps: (state, props) => ({
        target_system: state.mavlink.target_system,
        target_component: state.mavlink.target_component,
        mission_count: state.mavlink.MISSION_COUNT,
        mission_item: state.mavlink.MISSION_ITEM,
    }),
    mapDispatchToProps: { send_mavmsg },
    render: props => <MissionPathComponent {...props} />
})

const MissionPathComponent = (props) => {
    const {
        send_mavmsg, target_system, target_component, mission_count,
        mission_item
    } = props
    const [path, setPath] = useState([])

    useEffect(() => {
        if (target_system && target_component)
            send_mavmsg('MISSION_REQUEST_LIST', { target_system, target_component })
    }, [target_system, target_component])
    useEffect(() => {
        if (mission_count && mission_count.count > 0) {
            for (let seq = 0; seq < mission_count.count; seq++) {
                send_mavmsg('MISSION_REQUEST', { target_system, target_component, seq })
            }
        }
    }, [mission_count && mission_count.count])
    useEffect(() => {
        if (mission_item && mission_item.command == MAVLINK_MESSAGES['MAV_CMD_NAV_WAYPOINT']) {
            setPath([...path, [mission_item.y, mission_item.x]])
        }
    }, [mission_item && mission_item.seq])

    const geoJsonSource = {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': path
            }
        }
    }
    const layout = {
        'line-join': 'round',
        'line-cap': 'round'
    }
    const paint = {
        'line-color': '#00f',
        'line-width': 3
    }
    return <>
        <Source id="mission_path" geoJsonSource={geoJsonSource} />
        <Layer type="line" sourceId="mission_path" layout={layout} paint={paint} />
    </>
}
