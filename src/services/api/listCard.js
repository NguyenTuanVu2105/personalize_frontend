import {createAuthApiRequest} from './index'

export const listCard = (data = null) => {
    return createAuthApiRequest({
        url: '/stripe/card',
        data,
        method: 'GET'
    })
}
