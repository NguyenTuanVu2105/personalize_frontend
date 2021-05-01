import React from 'react'
import CommonStatusTag from '../../../shared/CommonStatusTag'

const TrackingStatusTag = (props) => {
    const status = props.statusText
    let displayInfo = {
        color: 'indianred',
        text: status,
        tooltip: status,
        type: 'empty'
    }
    switch (status) {
        case 'unknown':
            displayInfo = {
                text: 'Unknown',
                tooltip: 'Waiting for fulfillment',
                progress: 'incomplete',
                status: 'attention'
            }
            break
        case 'pre_transit':
            displayInfo = {
                text: 'Pre-transit',
                tooltip: 'Pre Transit',
                progress: 'partiallyComplete',
                status: 'info'
            }
            break
        case 'delivered':
            displayInfo = {
                text: 'Delivered',
                tooltip: 'Pack is delivered',
                progress: 'complete',
                status: 'success'
            }
            break
        case 'all_delivered':
            displayInfo = {
                text: 'Delivered',
                tooltip: 'Pack is delivered',
                progress: 'complete'
            }
            break
        case 'out_for_delivery':
            displayInfo = {
                text: 'Out delivery',
                tooltip: 'Out for delivery',
                progress: 'warning',
                status: 'info'
            }
            break
        case 'in_transit':
            displayInfo = {
                text: 'In transit',
                tooltip: 'In transit',
                progress: 'partiallyComplete',
                status: 'info'
            }
            break
        case 'available_for_pickup':
            displayInfo = {
                text: 'Pick-upable',
                tooltip: 'Available for pickup',
                progress: 'complete',
                status: 'success'
            }
            break
        case 'return_to_sender':
            displayInfo = {
                text: 'Returned',
                tooltip: 'Returned to sender',
                progress: 'partiallyComplete',
                status: 'attention'
            }
            break
        case 'failure':
            displayInfo = {
                text: 'Failure',
                tooltip: 'Failure',
                progress: 'complete',
                status: 'attention'
            }
            break
        case 'cancelled':
            displayInfo = {
                text: 'Cancelled',
                tooltip: 'Cancelled',
                progress: 'complete',
                status: 'attention'
            }
            break
        case 'error':
            displayInfo = {
                text: 'Error',
                tooltip: 'Error',
                progress: 'complete',
                status: 'attention'
            }
            break
        default:

    }
    return (
        <CommonStatusTag progress={displayInfo.progress} status={displayInfo.status} text={displayInfo.text}
        />
    )
}
export default TrackingStatusTag
