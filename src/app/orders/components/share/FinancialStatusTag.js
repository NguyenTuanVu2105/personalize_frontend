import React from 'react'
import CommonStatusTag from '../../../shared/CommonStatusTag'

const FinancialStatusTag = (props) => {
    const status = props.statusText
    let displayInfo = {
        color: 'indianred',
        text: status,
        tooltip: status
    }
    // console.log(status)
    switch (status) {
        case 'pending':
            if (props.fulfill_status === "unfulfilled" || props.fulfill_status === "holding") {
                displayInfo = {text: 'Pending', tooltip: 'Payment is pending', progress: 'incomplete', status: 'attention'}
            } else {
                displayInfo = {text: 'Charging', tooltip: 'Payment is charging', progress: 'incomplete', status: 'info'}
            }
            break
        case 'paid':
            displayInfo = {text: 'Paid', tooltip: 'All items are paid', progress: 'complete', status: 'new'}
            break
        case 'canceled':
            displayInfo = {text: 'Canceled', tooltip: 'Canceled', progress: 'complete', status: 'warning'}
            break
        case 'rejected':
            displayInfo = {text: 'Rejected', tooltip: 'Rejected', progress: 'complete', status: 'warning'}
            break
        case 'partially_paid':
            displayInfo = {text: 'Partially Paid', tooltip: 'Some items are paid', progress: 'partiallyComplete', status: 'info'}
            break
        case 'canceled_shipping':
            displayInfo = {text: 'Canceled Shipping', tooltip: 'Shipping is canceled ', progress: 'complete', status: 'attention'}
            break
        case 'failed':
            displayInfo = {text: 'Failed', tooltip: 'Invoice was halted to charge', progress: 'incomplete', status: 'warning'}
            break
        default :
            displayInfo = {}

    }
    return (
        <CommonStatusTag progress={displayInfo.progress} status={displayInfo.status} tooltip={displayInfo.tooltip}  text={displayInfo.text} />
    )
}
export default FinancialStatusTag
