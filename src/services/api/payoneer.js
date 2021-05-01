import {createAuthApiRequest} from './index'

export const getPayoneerLoginUrl = (shop) => {
    return createAuthApiRequest({
        url: `/payoneer/methods/`,
        method: 'POST',
        data: {
            shop: shop
        }
    })
}


export const activatePayee = (payee_id, verify_code) => {
    return createAuthApiRequest({
        url: `/payoneer/methods/activate/`,
        method: 'POST',
        data: {
            "payee": payee_id,
            "verify_code": verify_code
        }
    })
}
