import React, {PureComponent} from 'react'
import {reduxify} from '@/util/reduxify'


class TukanoPanelComponent extends PureComponent {
    render() {
        const {data_str} = this.props

        if (data_str)
            console.log(JSON.parse(data_str))

        return <div className="tukano-data-div">
            {data_str}
        </div>
    }
}

const compute_props = ({TUKANO_DATA}) => {
    return {
        data_str: TUKANO_DATA && TUKANO_DATA.text
    }
}

export const TukanoPanel = reduxify({
    mapStateToProps: (state, props) => {
        return compute_props(state.mavlink || {})
    },
    mapDispatchToProps: {},
    render: (props) =>
        <TukanoPanelComponent {...props} />
})
