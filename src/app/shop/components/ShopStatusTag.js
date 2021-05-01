import React from 'react'
import CommonStatusTag from '../../shared/CommonStatusTag'

export default ({status}) => {
    let displayInfo = {
        color: 'indianred',
        text: status,
        tooltip: status,
        type: 'empty'
    }
    switch (status) {
        case 'active':
            displayInfo = {
                text: 'Active',
                tooltip: 'Shop is active',
                progress: 'complete',
                status: 'success'
            }
            break
        case 'inactive':
            displayInfo = {
                text: 'Inactive',
                tooltip: 'PrintHolo app is uninstalled in store',
                progress: 'complete',
                status: 'warning'
            }
            break
        case 'error':
            displayInfo = {
                text: 'Cancelled',
                tooltip: 'Something wrong when connecting the store',
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

