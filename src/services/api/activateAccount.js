import {createApiRequest} from './index'

export const activateAccount = (data) => {
    return createApiRequest({
        url: `/seller/activate-account/`,
        data,
        method: 'POST'
    })
}
