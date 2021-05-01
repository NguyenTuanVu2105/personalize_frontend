import {createApiRequest} from './index'

export const register = (data) => {
    return createApiRequest({
        url: `/register/`,
        data,
        method: 'post',
    })
}
