import React from 'react'
import PropTypes from 'prop-types'
import './CommonStatusTag.scss'
import {Badge, Tooltip} from '@shopify/polaris'

const CommonStatusTag = (props) => {
    const {text, tooltip, progress, status} = props
    return (
        <span className="CommonStatusTag" style={{whiteSpace: 'nowrap'}}>
            {
                tooltip
                    ? (
                        <Tooltip content={tooltip} className={'p-3'}>
                            <Badge status={status} progress={progress}>{text}</Badge>
                        </Tooltip>
                    )
                    : (
                        <Badge status={status} progress={progress}>{text}</Badge>
                    )
            }
        </span>
    )
}

CommonStatusTag.propTypes = {
    status: PropTypes.string,
    text: PropTypes.string,
    tooltip: PropTypes.string,
    progress: PropTypes.string
}

export default CommonStatusTag
