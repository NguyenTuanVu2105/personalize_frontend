import {Popover} from 'antd'
import React from 'react'
import PropTypes from 'prop-types'
import './CommonStatusTag.scss'

const ChildrenTooltip = (props) => {
    const {tooltip} = props
    return (
        <div className={props.className}>
            {props.children.map((child, index) => (
                <Popover content={tooltip} key={index}>
                    {child}
                </Popover>))}
        </div>
    )
}

ChildrenTooltip.propTypes = {
    tooltip: PropTypes.object
}

export default ChildrenTooltip
