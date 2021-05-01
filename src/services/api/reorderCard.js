import {createAuthApiRequest} from './index'

export const reorderCard = (data) => {
    return createAuthApiRequest({
        url: '/stripe/reorder',
        data,
        method: 'POST'
    })
}
