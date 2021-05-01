import {createAuthApiRequest} from './index'

const BASE_PATH = '/billing/invoices'

export const getInvoiceList = (searchQuery, page, limit, paymentStatus, since, until) => {
    if (paymentStatus === "-2") {
        paymentStatus = null
    }
    return createAuthApiRequest({
        url: `${BASE_PATH}/`,
        method: 'get',
        params: {q: searchQuery, page, limit, status: paymentStatus, since, until}
    })
}

export const getInvoiceDetail = (invoiceId) => {
    return createAuthApiRequest({
        url: `${BASE_PATH}/${invoiceId}/`,
        method: 'get'
    })
}


export const getPaypalCheckoutForm = (invoiceId) => {
    return createAuthApiRequest({
        url: `${BASE_PATH}/${invoiceId}/checkout/paypal/`
    })
}


export const rechargeFailedInvoices = (invoiceIds, orderIds) => {
    return createAuthApiRequest({
        url: `${BASE_PATH}/retry/`,
        method: 'post',
        data: {invoice_ids: invoiceIds, order_ids: orderIds}
    })
}
