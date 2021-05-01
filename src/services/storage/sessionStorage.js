import MemStorage from './MemStorage'
import {isInFrame} from "../util/windowUtil"

let sessionStorage
try {
    sessionStorage = isInFrame() ? new MemStorage() : window.sessionStorage
} catch (e) {
    // if (window.location.pathname !== Paths.SecurityAccessWarning) {
    //     window.location.href = Paths.SecurityAccessWarning
    // }
    sessionStorage = new MemStorage()
}

export const getSessionStorage = (name, defaultValue = null) => {
    let strObj = sessionStorage.getItem(name)
    if (strObj) return JSON.parse(strObj)
    else return defaultValue
}

export const setSessionStorage = (name, value) => {
    return sessionStorage.setItem(name, JSON.stringify(value))
}

export const removeSessionStorage = (name) => {
    return sessionStorage.removeItem(name)
}

export const SESSION_KEY = {
    NEW_PRODUCT_STEP: 'NEW_PRODUCT_STEP',
    NEW_PRODUCT: 'NEW_PRODUCT',
    REDIRECT_URL: 'REDIRECT_URL',
    SHOP: 'SHOP',
    NEW_PRODUCT_MULTIPLE_UPLOAD_NOTE: 'NEW_PRODUCT_MULTIPLE_UPLOAD_NOTE',
    TUTORIAL_DESIGN_NEW_PRODUCT: 'TUTORIAL_DESIGN_NEW_PRODUCT',
    TUTORIAL_PRICING_NEW_PRODUCT: 'TUTORIAL_PRICING_NEW_PRODUCT',
    TUTORIAL_PAYMENT_MANAGE: 'TUTORIAL_PAYMENT_MANAGE',
    TUTORIAL_SHOP_SETTING: 'TUTORIAL_SHOP_SETTING',
    SHOPIFY_PARAMS: 'SHOPIFY_PARAMS',
    SELLER_BACKGROUND_COLORS: 'SELLER_BACKGROUND_COLORS'
}

export const COOKIE_KEY = {
    TOKEN: 'ACCESS_TOKEN',
    EMAIL: 'EMAIL',
    USER_ID: 'USER_ID',
    NAME: 'NAME',
    TIMEZONE: 'TIMEZONE',
    AVATAR_URL: "AVATAR_URL",
    REFRESH_TOKEN: 'REFRESH_TOKEN',
    FRESH_CHAT_ID: 'FRESH_CHAT_ID'
}
