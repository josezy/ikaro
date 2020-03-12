import React, {PureComponent} from 'react'
import {reduxify} from '@/util/reduxify'

import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'

import {snake_to_title} from '@/util/javascript'


class TukanoPanelComponent extends PureComponent {
    render() {
        const sensors = this.props

        return <div className="tukano-data-div">
            <Tabs defaultActiveKey={0}>
                {Object.keys(sensors).map((sensor, idx) =>
                    <Tab eventKey={idx} title={sensor} key={sensor}>
                        <div className="variables-container">
                        {Object.keys(sensors[sensor]).map((variable, idxx) => {
                            const var_data = sensors[sensor][variable]
                            return <div key={idxx}>
                                <span className="variable-title">
                                    {snake_to_title(variable)}:
                                </span>&nbsp;
                                <span className="variable-value">
                                    {var_data['value']} ({var_data['units']})
                                </span>
                            </div>
                        })}
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
    const {dt, pos, ...sensors} = tk_data.slice(-1)[0]
    return sensors
}

export const TukanoPanel = reduxify({
    mapStateToProps: ({mavlink}, props) => {
        return compute_props(mavlink || {})
    },
    mapDispatchToProps: {},
    render: (props) =>
         Object.keys(props).length > 0 && <TukanoPanelComponent {...props} />
})
