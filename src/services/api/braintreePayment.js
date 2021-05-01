import {createAuthApiRequest} from './index'

const BASE_PATH = '/braintree'

export const getClientToken = () => {
    return createAuthApiRequest({
        url: `${BASE_PATH}/token`,
        method: 'GET'
    })
}

export const addNewPaymentMethod = () => {
    return createAuthApiRequest({
        url: `${BASE_PATH}/methods/`,
        method: 'POST'
    })
}

export const setDefaultPaymentMethod = (data) => {
    return createAuthApiRequest({
        url: `${BASE_PATH}/methods/default/`,
        data,
        method: 'POST'
    })
}
