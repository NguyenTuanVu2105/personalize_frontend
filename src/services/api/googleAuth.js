import {createApiRequest} from './index'

export const googleAuth = (data) => {
    return createApiRequest({
        url: '/seller/google-auth/',
        data,
        method: 'POST'
    })
}
