import {createAuthApiRequest} from './index'

export const getMessages = (page, limit) => {
    return createAuthApiRequest({
        url: `/message/`,
        method: 'get',
        params: {page, limit}
    })
}

export const readMessage = (id) => {
    return createAuthApiRequest({
        url: `/message/read/`,
        method: 'post',
        data: {
            id: id
        }
    })
}

export const readAllMessages = () => {
    return createAuthApiRequest({
        url: '/message/read_all/',
        method: 'post'
    })
}

export const getUnreadMessageCount = () => {
    return createAuthApiRequest({
        url: `/message/unread_count/`,
        method: `get`,
    })
}
