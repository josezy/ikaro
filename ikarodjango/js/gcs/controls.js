import React, {PureComponent} from 'react'
import {reduxify} from '@/util/reduxify'
import {createSelector} from 'reselect'

import Switch from 'react-switch'
import Button from 'react-bootstrap/Button'

import {send_mavcmd} from '@/reducers/mavlink'


const ArmedSwitch = ({armed, send_mavcmd}) => <div style={{marginRight:'auto'}}>
    <label style={{transform:'scale(0.7)', display:'flex'}}>
        <span style={{fontSize:'1.2rem', marginRight:5, color:'white'}}>
            {armed ? 'ARMED' : 'DISARMED'}
        </span>
        <Switch onChange={checked => send_mavcmd(
            'MAV_CMD_COMPONENT_ARM_DISARM',
            {param1: checked ? 1 : 0, param2: 0}
        )} checked={armed} />
    </label>
</div>

const HookButton = ({send_mavcmd}) => <div style={{marginLeft:'auto'}}>
    <Button variant="outline-warning" onClick={() => send_mavcmd(
        'TUKANO_RELEASE_HOOK'
    )}>Release Hook</Button>
</div>

class ControlsComponent extends PureComponent {
    render() {
        const {armed, send_mavcmd} = this.props
        return <div className="controls-div">
            <div style={{width:'100%', height:'fit-content', display:'flex', padding:5}}>
                <ArmedSwitch armed={armed || false} send_mavcmd={send_mavcmd} />
                <HookButton send_mavcmd={send_mavcmd} />
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
    mapDispatchToProps: {send_mavcmd},
    render: (props) => <ControlsComponent {...props} />
})
