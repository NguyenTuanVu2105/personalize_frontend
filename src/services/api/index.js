import axios from 'axios'
import {getReactEnv} from '../env/getEnv'
import Paths from '../../routes/Paths'
import {removeStorageAfterLogout} from '../auth/auth'
import {COOKIE_KEY, getSessionStorage, SESSION_KEY, setSessionStorage} from '../storage/sessionStorage'
import {getLocalStorage, setLocalStorage} from '../storage/localStorage'
import {isInFrame} from "../util/windowUtil"
import {Redirect} from '@shopify/app-bridge/actions'
import {appBridgeRedirect} from "../app-bridge/redirect"


const baseUrl = getReactEnv('BACKEND_URL')

export const serializeObjectToQueryString = (obj) => {
    let str = [];
    for (let p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

export const createApiRequest = async ({url, method, data, params}) => {
    try {
        const {data: resp} = await axios({
            method,
            url: `${baseUrl}${url}`,
            data,
            params,
        })

        return {
            success: true,
            data: resp,
        }
    } catch (e) {
        const {response} = e
        const message = response ? response.statusText : e.message || e
        const data = response ? response.data : ''
        return {
            success: false,
            message,
            data
        }
    }
}

export const createAuthApiRequest = async ({url, method, data, params, isFormData, props, autoRedirect = true, baseUrl = getReactEnv('BACKEND_URL'),}) => {
    try {
        const headers = {}
        // if (isDevelopmentMode()) {
        const token = getLocalStorage(COOKIE_KEY.TOKEN)
        const refresh_token = getLocalStorage(COOKIE_KEY.REFRESH_TOKEN)
        const requiredAuthHosts = [getReactEnv('BACKEND_URL'), getReactEnv('MOCKUP_SEVICE_URL')]
        // console.log("*******requiredAuthHosts.includes(baseUrl)")
        // console.log(requiredAuthHosts.includes(baseUrl))
        // console.log(token)
        if (requiredAuthHosts.includes(baseUrl)) headers['Authorization'] = `Bearer ${token}`
        // }

        if (isFormData) {
            headers['Content-Type'] = 'multipart/form-data'
        }
        headers['x-refresh-token'] = refresh_token
        const {data: resp, headers: respHeaders} = await axios({
            method,
            url: `${baseUrl}${url}`,
            data,
            params,
            headers
        })

        const {new_access_token} = respHeaders
        if (new_access_token && new_access_token !== token) {
            setLocalStorage(COOKIE_KEY.TOKEN, new_access_token)
        }

        return {
            success: true,
            data: resp,
        }
    } catch (e) {
        const {response} = e
        // console.log(e)
        const errorMessage = response ? response.statusText : e.message || e
        if (response && response.status && [401, 403].includes(response.status)) {
            removeStorageAfterLogout()
            if (props) {
                // console.log(props.location)
                // console.log(props.location.search)
                setSessionStorage(SESSION_KEY.REDIRECT_URL, props.location.pathname + props.location.search)
            }
            if (isInFrame()) {
                const shop = getSessionStorage(SESSION_KEY.SHOP)
                appBridgeRedirect(shop ? shop.url : '', Redirect.Action.ADMIN_PATH, '/apps')
            } else {
                window.location.href = Paths.Login
            }
        }
        if (response && response.status && [404].includes(response.status)) {
            return autoRedirect ? window.location.href = Paths.NotFound : null
        }

        return response ? {
            success: false,
            status: response.status,
            errorMessage,
            data: response.data
        } : {
            success: false,
            errorMessage,
        }
    }
}
