import {createAuthApiRequest} from './index'

export const getUserProfile = (data = null) => {
    return createAuthApiRequest({
        url: '/seller/profile/info/',
        data,
        method: 'GET'
    })
}

export const updateUserProfile = (data) => {
    return createAuthApiRequest({
        url: `/seller/profile/update-info/`,
        data,
        method: 'PUT'
    })
}

export const updateUserMessage = (message_id) => {
    return createAuthApiRequest({
        url: `/seller/profile/update-message/`,
        data: {message_id},
        method: 'PUT'
    })
}
