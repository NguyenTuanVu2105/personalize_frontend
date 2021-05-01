import React from 'react'
import {Tag} from 'antd'

const CancelShippingRequestTag = (props) => {
    const requestInfo = props.request
    if (requestInfo.status === 'pending') {
        return (
            <Tag color="blue" className={"mr-0"}>Cancel Shipping Request Sent</Tag>
        )
    } else if (requestInfo.status === 'rejected') {
        return (
            <Tag color="red" className={"mr-0"}>Cancel Shipping Request Rejected</Tag>
        )
    }
    return (
        <div>
        </div>
    )
}

export default CancelShippingRequestTag
