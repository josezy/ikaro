import React, {PureComponent} from 'react'
import {reduxify} from '@/util/reduxify'
import {createSelector} from 'reselect'

import Switch from 'react-switch'


const ArmedSwitch = ({armed}) => <div>
    <label style={{transform:'scale(0.7)', display:'flex'}}>
        <span style={{fontSize:'1.2rem', marginRight:5, color:'white'}}>
            {armed ? 'ARMED' : 'DISARMED'}
        </span>
        <Switch onChange={(checked) => console.log({checked})} checked={armed} />
    </label>
</div>

class ControlsComponent extends PureComponent {
    render() {
        const {armed} = this.props
        return <div className="controls-div">
            <div style={{margin: '0 auto'}}>
                <ArmedSwitch armed={armed || false} />
            </div>
        </div>
    }
}


const compute_armed = createSelector(
    state => state.mavlink.HEARTBEAT,
    HEARTBEAT => HEARTBEAT && Boolean(HEARTBEAT.base_mode & 10**7)
)

const mapStateToProps = (state, props) => ({
    armed: compute_armed(state)
})

export const Controls = reduxify({
    mapStateToProps,
    mapDispatchToProps: {},
    render: (props) => <ControlsComponent {...props} />
})
