import React from 'react'
import ReactDOM from 'react-dom'

import {Row, Col} from 'react-bootstrap'

import {MapContainer} from '@/components/maps'


const socket = new WebSocket('ws://localhost:8000/flight');


class FlightPanelComponent extends React.Component {
    componentWillMount() {
        socket.onopen = (e) => {
            console.log("websocket connected", e)
        }
        socket.onmessage = (message) => {
            console.log("MSG:", message)
        }
        socket.onerror = (e) => {
            console.log("onerror:", e)
        }
        socket.onclose = (e) => {
            console.log("onclose:", e)
        }
    }
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
