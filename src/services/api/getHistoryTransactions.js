import {createAuthApiRequest} from './index'
import _ from 'lodash'

export const getHistoryTransactions = (page = 1, limit = 10, reqType = null) => {
    const type = reqType === '-1' ? null : reqType
    return createAuthApiRequest({
        url: '/billing/transactions/',
        method: 'GET',
        params: _.pickBy({page, limit, type}, (attr) => !!attr)
    })
}
