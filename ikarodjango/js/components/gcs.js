import React from 'react'
import ReactDOM from 'react-dom'

import {Row} from 'react-bootstrap'

import {reduxify} from '@/util/reduxify'

import {MapContainer} from '@/components/maps'


class ControlStationComponent extends React.Component {
    render() {
        const {position, tukano_text} = this.props
        const marker_center = position && {
            lat: position.lat,
            lon: position.lon,
        }
        console.log(tukano_text)
        return <Row style={{height: '100vh'}}>
            <div style={{width: '100%', height: '100%'}}>
                <MapContainer center={marker_center}/>
            </div>
        </Row>
    }
}

export const ControlStation = reduxify({
    mapStateToProps: (state, props) => {
        return compute_props(state.mavlink || {})
    },
    mapDispatchToProps: {},
    render: (props) =>
        <ControlStationComponent {...props} />
})


const compute_props = ({HEARTBEAT, GLOBAL_POSITION_INT, TUKANO_DATA}) => {
    const vehicle_state = {
        armed: HEARTBEAT && Boolean(HEARTBEAT.base_mode & 128),
        position: GLOBAL_POSITION_INT && {
            lat: GLOBAL_POSITION_INT.lat / 10**7,
            lon: GLOBAL_POSITION_INT.lon / 10**7,
            alt: GLOBAL_POSITION_INT.alt / 10**3,
        }
    }
    const tukano_payload = {
        tukano_text: TUKANO_DATA && TUKANO_DATA.text
    }
    return {...vehicle_state, ...tukano_payload}
}
