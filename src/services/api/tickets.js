import {createAuthApiRequest} from "./index"

export const ticketDetail = (ticket_id) => {
    return createAuthApiRequest({
        url: `/support/ticket/${ticket_id}/`,
        method: 'get',
    })
}

export const listSupportTicketByOrderId = (order_id, page, limit, status, read, q, since, until) => {
    const params = {
        page,
        limit,
        status,
        q,
        since,
        until,
        read
    }
    return createAuthApiRequest({
        url: `/support/ticket/by_order/${order_id}/`,
        method: 'GET',
        params: params
    })
}

export const listSupportTickets = (page, limit, status, read, q, since, until) => {
    const params = {
        page,
        limit,
        status,
        q,
        since,
        until,
        read
    }
    return createAuthApiRequest({
        url: `/support/ticket/`,
        method: 'GET',
        params: params
    })
}


export const sendReply = (ticket_id,body,files) => {
    const formData = new FormData()
    formData.append('body', body)
    files.forEach((file, index) => {
        formData.append(`files`, file)
    })
    return createAuthApiRequest({
        url: `/support/ticket/${ticket_id}/reply/`,
        method: 'POST',
        data: formData,
        isFormData: true
    })
}

export const unreadCount = () => {
    return createAuthApiRequest({
        url: `/support/ticket/unread_count/`,
        method: 'get',
    })
}