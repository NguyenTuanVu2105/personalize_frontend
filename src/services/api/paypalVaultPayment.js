import {createAuthApiRequest} from './index'

const BASE_PATH = '/paypal-vault'



export const getVaultOrder = () => {
    return createAuthApiRequest({
        url: `${BASE_PATH}/order`,
        method: 'GET'
    })
}

export const captureOrder = (orderId) => {
    return createAuthApiRequest({
        url: `${BASE_PATH}/order`,
        data: {order_id: orderId},
        method: 'POST'
    })
}
