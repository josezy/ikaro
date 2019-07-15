import React from 'react'
import ReactDOM from 'react-dom'

import {Row, Col} from 'react-bootstrap'

import {MapContainer} from '@/components/maps'


const socket = new WebSocket('ws://localhost:8000/flight');


class FlightPanelComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            marker_center: undefined,
        }
    }
    componentWillMount() {
        socket.onopen = (e) => {
            console.log("websocket connected", e)
        }
        socket.onmessage = (message) => {
            if(message.data.includes("mavpackettype")) {
                const msg_data = JSON.parse(message.data)
                if(msg_data.mavpackettype == "GLOBAL_POSITION_INT") {
                    this.setState({
                        marker_center: {
                            lon: msg_data.lon / 10**7,
                            lat: msg_data.lat / 10**7
                        }
                    })
                }
            }

        }
        socket.onerror = (e) => {
            console.log("onerror:", e)
        }
        socket.onclose = (e) => {
            console.log("onclose:", e)
        }
    }
    render() {
        const {marker_center} = this.state
        return <Row style={{height: '100vh'}}>
            <Col>
                <Row style={{height: '50vh'}}>
                    <div className="m-auto">STREAM</div>
                </Row>
                <Row style={{height: '50vh'}}>
                    <div className="m-auto">HUD</div>
                </Row>
            </Col>
            <Col>
                <div style={{width: '100%', height: '100%'}}>
                    <MapContainer center={marker_center}/>
                </div>
            </Col>
        </Row>
    }
}

ReactDOM.render(
    React.createElement(FlightPanelComponent, global.props),
    global.react_mount,
)
