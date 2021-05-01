import {createApiRequest, createAuthApiRequest} from './index'
import {getLocalStorage} from "../storage/localStorage"
import {COOKIE_KEY} from "../storage/sessionStorage"

export const login = ({email, password}) => {
    return createApiRequest({
        url: `/token-auth/`,
        data: {email, password},
        method: 'post'
    })
}
export const tokenLogout = () => {
    return createAuthApiRequest({
        url: '/token-logout/',
        method: 'post'
    })
}

export const changePassword = (data) => {
    return createAuthApiRequest({
        url: `/seller/profile/change-password/`,
        data: data,
        method: 'post'
    })
}

export const shopifyAuthShop = ({shop, code, props}) => {
    const token = getLocalStorage(COOKIE_KEY.TOKEN)

    return token ? createAuthApiRequest({
        url: `/bridge/spf/`,
        data: {shop, code},
        method: 'post',
        props
    }) : createApiRequest({
        url: `/bridge/spf/`,
        data: {shop, code},
        method: 'post',
        props
    })
}




