import {createApiRequest} from './index'

export const resetPasswordRequest = (data) => {
    return createApiRequest({
        url: `/seller/forgot-password/`,
        data,
        method: 'POST'
    })
}

export const resetPassword = (data) => {
    return createApiRequest({
        url: `/seller/reset-password/`,
        data,
        method: 'POST'
    })
}


