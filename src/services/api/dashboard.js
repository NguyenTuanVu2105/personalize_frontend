import {createAuthApiRequest} from './index'
import {COOKIE_KEY} from '../storage/sessionStorage'
import {DEFAULT_TIMEZONE} from '../../app/user-settings/constants/timezones'
import {getLocalStorage} from '../storage/localStorage'

export const getAnalytics = (since, until) => {
    const timezone = getLocalStorage(COOKIE_KEY.TIMEZONE, DEFAULT_TIMEZONE)
    return createAuthApiRequest({
        url: `/analytics/orders/`,
        method: 'get',
        params: {since, until, timezone}
    })
}

export const getBillingAnalytics = (since, until) => {
    const timezone = getLocalStorage(COOKIE_KEY.TIMEZONE, DEFAULT_TIMEZONE)
    return createAuthApiRequest({
        url: `/analytics/billings/`,
        method: 'get',
        params: {since, until, timezone}
    })
}
