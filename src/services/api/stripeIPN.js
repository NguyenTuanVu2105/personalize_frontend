import {createAuthApiRequest} from './index'

export const getStripeIPN = (data = null) => {
    return createAuthApiRequest({
        url: '/stripe/event/ipn/',
        data,
        method: 'GET'
    })
}
