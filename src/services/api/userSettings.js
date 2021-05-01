import {createAuthApiRequest} from './index'

export const getUserSettings = (data = null) => {
    return createAuthApiRequest({
        url: '/seller/settings/',
        data,
        method: 'GET'
    })
}

export const updateUserSettings = (data, id) => {
    return createAuthApiRequest({
        url: `/seller/settings/${id}/`,
        data,
        method: 'PUT'
    })
}


export const addUserSettings = (data) => {
    return createAuthApiRequest({
        url: `/seller/settings/`,
        data,
        method: 'POST'
    })
}
