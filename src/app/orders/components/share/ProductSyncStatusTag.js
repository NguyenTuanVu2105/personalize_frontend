import React from 'react'
import CommonStatusTag from '../../../shared/CommonStatusTag'

const TrackingStatusTag = (props) => {
    const status = props.statusText
    const count = props.count
    let displayInfo = {
        color: 'indianred',
        text: status,
        tooltip: status,
        type: 'empty'
    }
    switch (status) {
        case 'syncing':
            displayInfo = {
                text: 'Syncing',
                tooltip: 'Syncing',
                progress: 'incomplete',
                status: 'attention'
            }
            break
        case 'synced':
            displayInfo = {
                text: 'Synced',
                tooltip: 'Synced',
                progress: 'complete',
                status: 'success'
            }
            break
        case 'new':
            displayInfo = {
                text: 'Pending',
                tooltip: 'Pending',
                progress: 'warning',
                status: 'info'
            }
            break
        case 'error':
            displayInfo = {
                text: 'Error',
                tooltip: 'Error',
                progress: 'complete',
                status: 'warning'
            }
            break
        case 'deleted':
            displayInfo = {
                text: 'Deleted',
                tooltip: 'Deleted',
                progress: 'complete',
                status: 'new'
            }
            break
        case 'deleting':
            displayInfo = {
                text: 'Deleting',
                tooltip: 'Deleting',
                progress: 'incomplete',
                status: 'attention'
            }
            break
        case 'unsync':
            displayInfo = {
                text: 'Unsync',
                tooltip: 'Unsync',
                progress: 'complete',
                status: 'warning'
            }
            break
        case 'pending_delete':
            displayInfo = {
                text: 'Pending Delete',
                tooltip: 'Pending Delete',
                progress: 'warning',
                status: 'info'
            }
            break
        default:

    }
    return (
        <CommonStatusTag progress={displayInfo.progress} status={displayInfo.status} text={ displayInfo.text + (count ? (" (" + count + ")") : "") }
                         tooltip={displayInfo.tooltip}
        />
    )
}
export default TrackingStatusTag
