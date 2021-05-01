export const productSyncingStatuses = {
    synced: {
        status: 'success',
        progress: 'complete',
        text: 'Synced'
    },
    syncing: {
        status: 'attention',
        progress: 'partiallyComplete',
        text: 'Syncing'
    },
    unsync: {
        status: 'warning',
        progress: 'complete',
        text: 'Unsync'
    },
    error: {
        status: 'warning',
        progress: 'complete',
        text: 'Error'
    },
    new: {
        status: 'info',
        progress: 'empty',
        text: 'Pending'
    },
    deleted: {
        status: 'new',
        progress: 'complete',
        text: 'Deleted'
    },
    deleting: {
        status: 'attention',
        progress: 'partiallyComplete',
        text: 'Deleting'
    },
}
