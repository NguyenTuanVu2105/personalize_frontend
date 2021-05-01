import {createAuthApiRequest} from "./index"

export const ticketConversations = (ticket_id,page) => {
    const params = {
        page
    }
    return createAuthApiRequest({
        url: `/support/conversations/by_ticket/${ticket_id}/`,
        method: 'get',
        params: params
    })
}
