import {createAuthApiRequest} from './index'

export const getPaymentMethodList = () => {
    return createAuthApiRequest({
        url: '/payment/methods/',
        method: 'GET'
    })
}

export const reorderPaymentMethod = (data) => {
    return createAuthApiRequest({
        url: '/payment/methods/reorder/',
        data,
        method: 'POST'
    })
}

export const removePaymentMethod = (id) => {
    return createAuthApiRequest({
        url: `/payment/methods/${id}/`,
        data: null,
        method: 'DELETE'
    })
}
