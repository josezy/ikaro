import React, {PureComponent} from 'react'
import ReactMapboxGl, {
    Marker, RotationControl, ZoomControl
} from 'react-mapbox-gl'


const Mapbox = ReactMapboxGl({
    accessToken: global.props.map_key,
})


export class MapContainer extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        const {center} = this.props

        return (
            <Mapbox
                style="mapbox://styles/mapbox/navigation-guidance-night-v4"
                center={center || [-75.393921, 6.149080]}
                zoom={[16]}
                className="mapbox-component"
            >
                <RotationControl />
                <ZoomControl />
                {center &&
                    <Marker coordinates={center} anchor="center">
                        <img src="/static/img/map_marker.png" />
                    </Marker>
                }
            </Mapbox>
        )
    }
}

