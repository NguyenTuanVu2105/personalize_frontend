import {createAuthApiRequest} from './index'


const BASE_PATH = '/stripe'


export const getPublicKey = () => {
    return createAuthApiRequest({
        url: `${BASE_PATH}/api_key`,
        method: 'GET'
    })
}

export const stripeCard = (data) => {
    return createAuthApiRequest({
        url: `${BASE_PATH}/create_stripe_user`,
        data,
        method: 'POST'
    })
}
