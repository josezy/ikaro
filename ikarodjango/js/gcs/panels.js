import React from 'react'
import { reduxify } from '@/util/reduxify'

import { createSelector } from 'reselect'

import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'

import { snake_to_title, two_dec } from '@/util/javascript'


export const TukanoPanel = reduxify({
    mapStateToProps: (state, props) => ({
        sensors: createSelector(
            state => state.mavlink.TUKANO_DATA,
            TUKANO_DATA => {
                if (!TUKANO_DATA) return {}
                const tk_data = TUKANO_DATA && JSON.parse(TUKANO_DATA.text)
                const { dt, pos, ...sensors } = tk_data.slice(-1)[0]
                return sensors
            }
        )(state)
    }),
    mapDispatchToProps: {},
    render: ({ sensors }) =>
        Object.keys(sensors).length > 0 && <div className="tukano-data-div">
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
                                        {two_dec(var_data['value'])} ({var_data['units']})
                                    </span>
                                </div>
                            })}
                        </div>
                    </Tab>
                )}
            </Tabs>
        </div>
})
