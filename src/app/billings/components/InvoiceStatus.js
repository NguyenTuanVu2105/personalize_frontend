import React from 'react'
import CommonStatusTag from '../../shared/CommonStatusTag'

export const InvoiceStatus = {
    CANCELLED: '-1',
    UNPAID: '0',
    PAID: '1',
    PENDING: '3',
    PROCESSING: '4',
    TRANSACTION_PENDING: '5',
    FAILED: '2',

}

export default ({status}) => {
    let displayInfo = {
        color: 'indianred',
        text: status,
        tooltip: status,
        type: 'empty'
    }
    switch (status) {
        case InvoiceStatus.UNPAID:
            displayInfo = {
                text: 'Unpaid',
                tooltip: 'Waiting for payment',
                progress: 'incomplete',
                status: 'attention'
            }
            break
        case  InvoiceStatus.PAID:
            displayInfo = {
                text: 'Paid',
                tooltip: 'Billing was paid successfully',
                progress: 'complete',
                status: 'success'
            }
            break
        case  InvoiceStatus.PENDING:
            displayInfo = {
                text: 'Pending',
                tooltip: 'Invoice is pending process',
                progress: 'partiallyComplete',
                status: 'info'
            }
            break
        case  InvoiceStatus.PROCESSING:
            displayInfo = {
                text: 'Processing',
                tooltip: 'Invoice is being processed',
                progress: 'partiallyComplete',
                status: 'info'
            }
            break
        case  InvoiceStatus.TRANSACTION_PENDING:
            displayInfo = {
                text: 'Pending',
                tooltip: 'Invoice is pending process',
                progress: 'partiallyComplete',
                status: 'info'
            }
            break
        case InvoiceStatus.CANCELLED:
            displayInfo = {
                text: 'Canceled',
                tooltip: 'Billing was cancelled due to order\'s changes',
                progress: 'complete',
                status: 'warning'
            }
            break
        case InvoiceStatus.FAILED:
            displayInfo = {
                text: 'Failed',
                tooltip: 'Transactions were failed. Check your payment method and it\'s balance',
                progress: 'complete',
                status: 'warning'
            }
            break
        default:
            break
    }
    return (
        <CommonStatusTag progress={displayInfo.progress} status={displayInfo.status} text={displayInfo.text}
                         tooltip={displayInfo.tooltip}
        />
    )
}

