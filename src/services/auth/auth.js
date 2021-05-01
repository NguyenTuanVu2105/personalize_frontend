import Paths from '../../routes/Paths'
import {COOKIE_KEY, getSessionStorage, SESSION_KEY} from '../storage/sessionStorage'
import {getLocalStorage, LOCALSTORAGE_KEY, removeLocalStorage, setLocalStorage} from '../storage/localStorage'
import {tokenLogout} from '../api/auth'
import _ from 'lodash'

export const logout = async () => {
    await tokenLogout()
    removeStorageAfterLogout()
    window.location.href = Paths.Login
}

export const getUser = () => {
    let shop = getSessionStorage(SESSION_KEY.SHOP)
    if (!(shop instanceof Object)) {
        shop = null
    }
    const name = getLocalStorage(COOKIE_KEY.NAME)
    return name ? {
        email: getLocalStorage(COOKIE_KEY.EMAIL),
        name: getLocalStorage(COOKIE_KEY.NAME),
        userId: getLocalStorage(COOKIE_KEY.USER_ID),
        timezone: getLocalStorage(COOKIE_KEY.TIMEZONE),
        avatar_url: getLocalStorage(COOKIE_KEY.AVATAR_URL),
        shop: shop,
        token: getLocalStorage(COOKIE_KEY.TOKEN),
        refresh_token: getLocalStorage(COOKIE_KEY.REFRESH_TOKEN),
        message_id: getLocalStorage(COOKIE_KEY.FRESH_CHAT_ID)
    } : null
}

export const setUserCookies = ({token, refresh_token, email, userId, name, timezone, avatar_url, message_id}) => {
    // if (isDevelopmentMode())
    if (token !== undefined) setLocalStorage(COOKIE_KEY.TOKEN, token)
    if (refresh_token !== undefined) setLocalStorage(COOKIE_KEY.REFRESH_TOKEN, refresh_token)
    if (email !== undefined) setLocalStorage(COOKIE_KEY.EMAIL, email)
    if (name !== undefined) setLocalStorage(COOKIE_KEY.NAME, name)
    if (userId !== undefined) setLocalStorage(COOKIE_KEY.USER_ID, userId)
    if (timezone !== undefined) setLocalStorage(COOKIE_KEY.TIMEZONE, timezone)
    if (avatar_url !== undefined) setLocalStorage(COOKIE_KEY.AVATAR_URL, avatar_url)
    if (message_id !== undefined) setLocalStorage(COOKIE_KEY.FRESH_CHAT_ID, message_id)
}

export const setUserCookiesWithStorage = (storage, {token, refresh_token, email, userId, name, timezone, avatar_url, message_id}) => {
    if (token !== undefined) storage.setItem(COOKIE_KEY.TOKEN, token)
    if (refresh_token !== undefined) storage.setItem(COOKIE_KEY.REFRESH_TOKEN, refresh_token)
    if (email !== undefined) storage.setItem(COOKIE_KEY.EMAIL, email)
    if (name !== undefined) storage.setItem(COOKIE_KEY.NAME, name)
    if (userId !== undefined) storage.setItem(COOKIE_KEY.USER_ID, userId)
    if (timezone !== undefined) storage.setItem(COOKIE_KEY.TIMEZONE, timezone)
    if (avatar_url !== undefined) storage.setItem(COOKIE_KEY.AVATAR_URL, avatar_url)
    if (message_id !== undefined) storage.setItem(COOKIE_KEY.FRESH_CHAT_ID, message_id)
}

export const removeStorageAfterLogout = () => {
    removeLocalStorage(COOKIE_KEY.TOKEN)
    removeLocalStorage(COOKIE_KEY.REFRESH_TOKEN)
    removeLocalStorage(COOKIE_KEY.EMAIL)
    removeLocalStorage(COOKIE_KEY.NAME)
    removeLocalStorage(COOKIE_KEY.TIMEZONE)
    removeLocalStorage(COOKIE_KEY.AVATAR_URL)
    removeLocalStorage(COOKIE_KEY.USER_ID)
    removeLocalStorage(COOKIE_KEY.FRESH_CHAT_ID)
    removeLocalStorage(LOCALSTORAGE_KEY.SELECTED_STORE)
    removeLocalStorage(LOCALSTORAGE_KEY.SELECTED_CATEGORY)
}

export const saveLogInAccount = ({user_id, email, name, avatar_url, timezone}) => {
    let loggedAccounts = JSON.parse(getLocalStorage(LOCALSTORAGE_KEY.LOGGED_ACCOUNTS, "[]"))
    const index = _.findIndex(loggedAccounts, {user_id: user_id})
    if (index >= 0) {
        loggedAccounts.splice(index, 1)
    }
    loggedAccounts.unshift({user_id, email, name, timezone, avatar_url})
    return setLocalStorage(LOCALSTORAGE_KEY.LOGGED_ACCOUNTS, JSON.stringify(loggedAccounts))
}

export const retrieveUserAvatarUrl = (avatar_url, username) => {
    return avatar_url && avatar_url !== "null" ? avatar_url : `https://ui-avatars.com/api/?name=${username.split(' ').join('+')}`
}