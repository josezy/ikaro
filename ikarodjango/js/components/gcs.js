import React from 'react'
import ReactDOM from 'react-dom'

import {Row} from 'react-bootstrap'

import {reduxify} from '@/util/reduxify'

import {MapContainer} from '@/components/maps'


class ControlStationComponent extends React.Component {
    render() {
        const {position} = this.props
        let marker_center = undefined
        
        if (position){
            marker_center = {
                lat: position.lat,
                lon: position.lon,
            }
        }

        return <Row style={{height: '100vh'}}>
            <div style={{width: '100%', height: '100%'}}>
                <MapContainer center={marker_center}/>
            </div>
        </Row>
    }
}

export const ControlStation = reduxify({
    mapStateToProps: (state, props) => {
        return compute_props(select_props(state))
    },
    mapDispatchToProps: {},
    render: (props) =>
        <ControlStationComponent {...props} />
})


const select_props = (state) => {
    return state.mavlink || {}
}

const compute_props = ({HEARTBEAT, GLOBAL_POSITION_INT}) => {
    const vehicle_state = {
        armed: HEARTBEAT && Boolean(HEARTBEAT.base_mode & 128),
        position: GLOBAL_POSITION_INT && {
            lat: GLOBAL_POSITION_INT.lat / 10**7,
            lon: GLOBAL_POSITION_INT.lon / 10**7,
            alt: GLOBAL_POSITION_INT.alt / 10**3,
        }
    }
    return vehicle_state
}
