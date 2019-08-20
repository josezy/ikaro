import React, {PureComponent} from 'react'
import {reduxify} from '@/util/reduxify'

import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'


class TukanoPanelComponent extends PureComponent {
    render() {
        const sensors = this.props

        return <div className="tukano-data-div">
            <Tabs defaultActiveKey={0}>
                {Object.keys(sensors).map((sensor, idx) =>
                    <Tab eventKey={idx} title={sensor} key={sensor}>
                        <div className="variables-container">
                        {Object.keys(sensors[sensor]).map((variable, idxx) =>
                            <div key={idxx}>
                                <span className="variable-title">
                                    {variable}:
                                </span>&nbsp;
                                <span className="variable-value">
                                    {sensors[sensor][variable]}
                                </span>
                            </div>
                        )}
                        </div>
                    </Tab>
                )}
            </Tabs>
        </div>
    }
}

const compute_props = ({TUKANO_DATA}) => {
    if (!TUKANO_DATA) return {}

    const tk_data = TUKANO_DATA && JSON.parse(TUKANO_DATA.text)
    const {dt, pos, ...sensors} = tk_data
    return sensors
}

export const TukanoPanel = reduxify({
    mapStateToProps: (state, props) => {
        return compute_props(state.mavlink || {})
    },
    mapDispatchToProps: {},
    render: (props) =>
        <TukanoPanelComponent {...props} />
})
