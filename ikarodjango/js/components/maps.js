import React, {PureComponent} from 'react';
import ReactMapGL, {Marker, NavigationControl, GeolocateControl} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoiam9zZXp5IiwiYSI6ImNqd3ZmdGFmbzA4dGQ0OW41em5reDU3cmMifQ.5Ab2UzBgSWEoRgjxN9fMhg"


const ICON = `
M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,
0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,
0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9C20.1,15.8,
20.2,15.8,20.2,15.7z
`

const pinStyle = {
    fill: '#d00',
    stroke: 'none',
    cursor: 'pointer'
}

class Pin extends PureComponent {
    render() {
        const {size = 20, onClick} = this.props;

        return (
            <svg height={size} viewBox="0 0 24 24" onClick={onClick} style={{
              ...pinStyle,
              transform: `translate(${-size / 2}px,${-size}px)`
            }}>
               <path d={ICON} />
            </svg>
        )
    }
}


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
                  mapStyle="mapbox://styles/mapbox/streets-v8"
                  mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
                  onViewportChange={(viewport) => this.setState({viewport})}
                >

            <div style={navStyle}>
                <NavigationControl onViewportChange={::this.updateViewport} />
            </div>
            {center &&
                <Marker latitude={center.lat} longitude={center.lon} >
                    <Pin />
                </Marker>
            }

        </ReactMapGL>
    }
}

