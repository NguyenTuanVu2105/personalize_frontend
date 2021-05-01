import {createAuthApiRequest} from './index'

export const sendActivationEmail = (data = null) => {
    return createAuthApiRequest({
        url: '/seller/account-activation/',
        data,
        method: 'POST'
    })
}
