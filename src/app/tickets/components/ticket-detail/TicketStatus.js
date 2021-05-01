import React from 'react'
import CommonStatusTag from "../../../shared/CommonStatusTag"
import {TicketStatus as TicketStatusIdentify} from "../../constant/TicketStatus"

const TicketStatus = ({status}) => {
    let displayInfo = {
        color: 'indianred',
        text: status,
        tooltip: status,
        type: 'empty'
    }
    switch (status) {
        case TicketStatusIdentify.OPEN:
        case  TicketStatusIdentify.PENDING:
            displayInfo = {
                text: 'Unresolved',
                progress: 'partiallyComplete',
                status: 'info',
                tooltip: 'Ticket is unresolved'
            }
            break
        case  TicketStatusIdentify.CLOSED:
        case  TicketStatusIdentify.RESOLVED:
            displayInfo = {
                text: 'Resolved',
                tooltip: 'Ticket is resolved',
                progress: 'complete',
                status: 'default'
            }
            break
        default:
            break
    }
    return (
        <CommonStatusTag status={displayInfo.status} tooltip={displayInfo.tooltip} progress = {displayInfo.progress} text={displayInfo.text} />
    )
}

export default TicketStatus

