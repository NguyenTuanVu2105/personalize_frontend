import {createAuthApiRequest} from './index'

export const stripeCharge = (data) => {
    return createAuthApiRequest({
        url: '/stripe/checkout',
        data,
        method: 'POST'
    })
}
