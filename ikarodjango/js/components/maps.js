import React, {PureComponent} from 'react';
import ReactMapGL, {Marker, NavigationControl, GeolocateControl} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css'


const navStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '10px'
}

export class MapContainer extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            viewport: {
                width: '100%',
                height: '100%',
                latitude: 6.147674,
                longitude: -75.393580,
                zoom: 16
            }
        }
    }

    updateViewport(viewport) {
        this.setState({viewport})
    }

    render() {
        const {center} = this.props

        return <ReactMapGL
                  {...this.state.viewport}
                  mapStyle="mapbox://styles/mapbox/navigation-guidance-night-v4"
                  mapboxApiAccessToken={global.props.map_api}
                  onViewportChange={(viewport) => this.setState({viewport})}
                >

            <div style={navStyle}>
                <NavigationControl onViewportChange={::this.updateViewport} />
            </div>
            {center &&
                <Marker latitude={center.lat} longitude={center.lon} >
                    <img
                        src="/static/img/map_marker.png"
                        style={{transform: "translate(-50%, -50%)"}}
                    />
                </Marker>
            }

        </ReactMapGL>
    }
}

