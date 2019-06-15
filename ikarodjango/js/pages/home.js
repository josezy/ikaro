import React from 'react'
import ReactDOM from 'react-dom'

import {MapContainer} from '@/components/maps'


class HomeComponent extends React.Component {
    render() {
        return [
            <center><h1>Tucano AR</h1></center>,
            <div style={{width: '100%', height: '800px'}}><MapContainer /></div>
        ]
    }
}

ReactDOM.render(
    React.createElement(HomeComponent, global.props),
    global.react_mount,
)
