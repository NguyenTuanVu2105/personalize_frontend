import MemStorage from './MemStorage'
import {isInFrame} from "../util/windowUtil"

let localStorage
try {
    localStorage = isInFrame() ? new MemStorage() : window.self.localStorage
} catch (e) {
    // if (window.location.pathname !== Paths.SecurityAccessWarning) {
    //     window.location.href = Paths.SecurityAccessWarning
    // }
    localStorage = new MemStorage()
}
export const getLocalStorage = (name, defaultValue = null) => {
    return localStorage.getItem(name) || defaultValue
}

export const setLocalStorage = (name, value) => {
    return localStorage.setItem(name, value)
}

export const removeLocalStorage = (name) => {
    return localStorage.removeItem(name)
}

export const LOCALSTORAGE_KEY = {
    SELECTED_CATEGORY: 'SELECTED_CATEGORY',
    SELECTED_STORE: 'SELECTED_STORE',
    LOGGED_ACCOUNTS: 'LOGGED_ACCOUNTS'
}
