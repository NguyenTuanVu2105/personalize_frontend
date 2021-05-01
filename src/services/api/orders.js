import {createApiRequest, createAuthApiRequest} from './index'

export const getOrders = (searchQuery, page, limit, fulfillmentStatus, paymentStatus, shopId, since, until, ordering = null) => {
    if (fulfillmentStatus === '-1') {
        fulfillmentStatus = null
    }
    if (paymentStatus === '-1') {
        paymentStatus = null
    }
    if (shopId === '-1') {
        shopId = null
    }
    if (Array.isArray(shopId)) {
        shopId = shopId.join(',')
    }
    const params = {
        q: searchQuery,
        page,
        limit,
        fulfill_status: fulfillmentStatus,
        financial_status: paymentStatus,
        shop_id: shopId,
        since: since,
        until: until,
        ordering: ordering
    }
    return createAuthApiRequest({
        url: `/orders/`,
        method: 'get',
        params: params
    })
}

export const getOrder = (order_id) => {
    return createAuthApiRequest({
        url: `/orders/${order_id}/`,
        method: 'get'
    })
}

export const cancelOrder = (order_id) => {
    return createAuthApiRequest({
        url: `/orders/cancel_order/`,
        method: 'post',
        data: {'id': order_id}
    })
}

export const cancelOrderLastItem = (order_id, item_id) => {
    return createAuthApiRequest({
        url: `/orders/cancel_order_last_item/`,
        method: 'post',
        data: {'order_id': order_id, 'item_id': item_id}
    })
}

export const requestFulfill = (order_id) => {
    return createAuthApiRequest({
        url: `/orders/request_fulfill/`,
        method: 'post',
        data: {'id': order_id}
    })
}

export const cancelShipping = (order_id, packs, note) => {
    return createAuthApiRequest({
        url: `/orders/cancel_shipping/`,
        method: 'post',
        data: {'id': order_id, 'note': note, 'packs': packs}
    })
}

export const editShippingAddress = async (order_id, shipping_address) => {
    return createAuthApiRequest({
        url: `/orders/${order_id}/`,
        method: 'put',
        data: {shipping_address: shipping_address}
    })
}

export const getUserProductById = async (id) => {
    return createAuthApiRequest({
        url: `/seller/user-product/${id}/`,
        method: 'get'
    })
}

export const editOrderPackItem = async (order_id, item_id, changed_attribute) => {
    return createAuthApiRequest({
        url: `/orders/${order_id}/`,
        method: 'put',
        data: {update_items: [{...changed_attribute, id: item_id}]}
    })
}

export const addOrderItem = (order_id, addItems) => {
    return createAuthApiRequest({
        url: `/orders/${order_id}/`,
        method: 'put',
        data: {add_items: addItems}
    })
}

export const getAllShippingRate = () => {
    return createApiRequest({
        url: '/shipping_rate/',
        method: 'GET'
    })
}

export const editShippingPlan = (order_id, shipping_rate_id) => {
    return createAuthApiRequest({
        url: `/orders/${order_id}/`,
        method: 'put',
        data: {shipping_rate: shipping_rate_id}
    })
}


export const contactOrderSupport = (files, data) => {
    const formData = new FormData()
    formData.append('order_ids', data.order_ids.join(','))
    formData.append('subject', data.subject)
    formData.append('issue', data.issue)
    formData.append('type', data.type)
    files.forEach((file, index) => {
        formData.append(`files`, file)
    })
    return createAuthApiRequest({
        url: '/support/ticket/',
        data: formData,
        method: 'POST',
        isFormData: true,
    })
}

export const listOrderIds = () => {
    return createAuthApiRequest({
        url: `/orders/ids/`,
        method: 'get',
    })
}

export const redeemCoupon = (order_id, code) => {
    return createAuthApiRequest({
        url: `/coupons/redeem/`,
        method: 'post',
        data: {order: order_id, code}
    })
}

export const removeCoupon = (order_id, code) => {
    return createAuthApiRequest({
        url: `/coupons/cancel/`,
        method: 'post',
        data: {order: order_id, code}
    })
}