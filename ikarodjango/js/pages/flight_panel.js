import React from 'react'
import ReactDOM from 'react-dom'

import {Row, Col} from 'react-bootstrap'

import {MapContainer} from '@/components/maps'


class FlightPanelComponent extends React.Component {
    render() {
        return <Row>
            <Col>
                <Row>
                    <center>STREAM</center>
                </Row>
                <Row>
                    <center>HUD</center>
                </Row>
            </Col>
            <Col>
                <div style={{width: 500, height: 800}}>
                    <MapContainer />
                </div>
            </Col>
        </Row>
    }
}

ReactDOM.render(
    React.createElement(FlightPanelComponent, global.props),
    global.react_mount,
)
