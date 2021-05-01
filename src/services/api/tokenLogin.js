import {createApiRequest} from './index'

export const getjwtToken = ({token}) => {
    return createApiRequest({
        url: `/user/token-auth/`,
        method: 'post',
        data: {token}
    })
}