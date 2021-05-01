export const getSupportTicketCountInfo = (unresolvedTicketCount, resolveTicketCount) => {
    if (unresolvedTicketCount > 0) {
        return `Order has ${unresolvedTicketCount}/${resolveTicketCount} unresolved support tickets`
    } else if (resolveTicketCount > 0) {
        return `Order has ${resolveTicketCount}/${resolveTicketCount} resolved support tickets`
    } else {
        return `Order has no support ticket`
    }
}
