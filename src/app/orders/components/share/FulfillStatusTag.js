import React from 'react'
import CommonStatusTag from '../../../shared/CommonStatusTag'

const FulfillStatusTag = (props) => {
    const status = props.statusText
    // console.log(props)
    let displayInfo = {
        color: 'indianred',
        text: status,
        tooltip: status,
        type: 'empty'
    }
    switch (status) {
        case 'unfulfilled':
            displayInfo = {
                text: 'Unfulfilled',
                tooltip: 'Waiting for fulfillment',
                progress: 'incomplete',
                status: 'attention'
            }
            break
        case 'pending':
            displayInfo = {
                text: 'Pending',
                tooltip: 'Waiting for payment paid',
                progress: 'incomplete',
                status: 'attention'
            }
            break
        case 'fulfilled':
            displayInfo = {
                text: 'Fulfilled',
                tooltip: 'All items are fulfilled',
                progress: 'complete',
                status: 'default'
            }
            break
        case 'fulfilled_complete':
            displayInfo = {
                text: 'Fulfilled',
                tooltip: 'All items are fulfilled',
                progress: 'complete',
                status: 'default'
            }
            break
        case 'in_production':
            displayInfo = {
                text: 'In Production',
                tooltip: 'Items are in production',
                progress: 'partiallyComplete',
                status: 'info'
            }
            break
        case 'requested_fulfillment':
            displayInfo = {
                text: 'Requested',
                tooltip: 'Items are requested fulfillment',
                progress: 'partiallyComplete',
                status: 'info'
            }
            break
        case 'canceled':
            displayInfo = {
                text: 'Canceled',
                tooltip: 'Canceled',
                progress: 'complete',
                status: 'warning'
            }
            break
        case 'rejected':
            displayInfo = {
                text: 'Rejected',
                tooltip: 'Rejected',
                progress: 'complete',
                status: 'warning'
            }
            break
        case 'partially_fulfilled':
            displayInfo = {
                text: 'Partially Fulfilled',
                tooltip: 'Some items are fulfilled',
                progress: 'partiallyComplete', status: 'success'
            }
            break
        case 'partially_in_production':
            displayInfo = {
                text: 'Partially In Production',
                tooltip: 'Some items are in production',
                progress: 'partiallyComplete', status: 'info'
            }
            break
        case 'partially_paid':
            displayInfo = {
                text: 'Partially Paid',
                tooltip: 'Some items are paid',
                progress: 'partiallyComplete', status: 'new'
            }
            break
        case 'canceled_shipping':
            displayInfo = {
                text: 'Canceled Shipping',
                tooltip: 'Canceled Shipping',
                progress: 'complete',
                status: 'attention'
            }
            break
        case 'holding':
            displayInfo = {
                text: 'Holding',
                tooltip: 'Holding for valid information',
                progress: 'incomplete',
                status: 'attention'
            }
            break
        default :
            displayInfo = {}
    }
    return (
        <CommonStatusTag progress={displayInfo.progress} status={displayInfo.status} text={displayInfo.text}
                         tooltip={displayInfo.tooltip}
        />
    )
}
export default FulfillStatusTag
