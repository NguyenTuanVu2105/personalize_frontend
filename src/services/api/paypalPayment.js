import {createAuthApiRequest} from './index'

const BASE_PATH = '/paypal'

export const getClientCredentials = () => {
    return createAuthApiRequest({
        url: `${BASE_PATH}/customer`,
        method: 'GET'
    })
}

export const createBillingAgreement = () => {
    return createAuthApiRequest({
        url: `${BASE_PATH}/billing-agreements`,
        method: 'POST'
    })
}

export const activateBillingAgreement = (agreementToken) => {
    return createAuthApiRequest({
        url: `${BASE_PATH}/methods/`,
        data: {agreement_token: agreementToken},
        method: 'POST'
    })
}
