import {createApiRequest, createAuthApiRequest} from './index'
import {getLocalStorage} from "../storage/localStorage"
import {COOKIE_KEY} from "../storage/sessionStorage"

export const getShopsList = (page, limit, searchQuery, ecommerce, currency, status, since, until, product, ordering) => {
    const params = {
        page, limit,
        q: searchQuery,
        ecommerce,
        currency,
        status,
        since,
        until,
        product,
        ordering
    }
    return createAuthApiRequest({
        url: `/shops/`,
        method: 'get',
        params: params
    })
}

export const getAllActiveShops = () => {
    const params = {
        status: 1
    }
    return createAuthApiRequest({
        url: `/shops/all/`,
        method: 'get',
        params: params
    })
}

export const verifyStoreAuth = (data) => {
    const token = getLocalStorage(COOKIE_KEY.TOKEN)

    return token ? createAuthApiRequest({
        url: `/shops/verify/`,
        method: 'POST',
        data: data
    }) : createApiRequest({
        url: `/shops/verify/`,
        method: 'POST',
        data: data
    })
}

export const initUnAuthStore = (data) => {
    return createApiRequest({
        url: `/shops/init/`,
        method: 'POST',
        data: data
    })
}


export const getShopDetail = (shopId) => {
    return createAuthApiRequest({
        url: `/shops/${shopId}/`,
        method: 'get'
    })
}

export const getShopStatistic = (shopId) => {
    return createAuthApiRequest({
        url: `/shops/${shopId}/statistic/`,
        method: 'get'
    })
}


export const pushAllToShop = (shopId, sourceShopIds) => {
    return createAuthApiRequest({
        url: `/seller/user-product/push-all-to-shop/`,
        method: 'post',
        data: {
            "shop_id": shopId,
            "source_shops": sourceShopIds
        }
    })
}

export const deactivateShop = (id) => {
    return createAuthApiRequest({
        url: `/shops/${id}/deactivate/`,
        method: 'post'
    })
}

export const getShopShippingByShopId = (shopId, url) => {
    return createAuthApiRequest({
        url: url,
        method: 'get',
        params: {'shop_id': shopId}
    })
}

export const updateShopShippingRateMappings = (body) => {
    return createAuthApiRequest({
        url: `/shop-shipping-rate-mapping/update/`,
        method: 'post',
        data: body,
    })
}

export const addShopsProductDetail = (id, body) => {
    return createAuthApiRequest({
        url: `/seller/user-product/${id}/add_shop/`,
        method: 'post',
        data: body,
    })
}

export const reSyncProduct = (id, data) => {
    return createAuthApiRequest({
        url: `/seller/user-product/${id}/resync/`,
        method: 'post',
        data: data,
    })
}

export const bulkResyncProduct = (id, data) => {
    return createAuthApiRequest({
        url: `/seller/user-product/${id}/bulk-resync/`,
        method: 'post',
        data: data,
    })
}

export const getShopDefault = () => {
    return createAuthApiRequest({
        url: `/shops/default/`,
        method: 'get'
    })
}

export const addCustomizePage = () => {
    return createAuthApiRequest({
        url: `/shops/create_customize_page/`,
        method: 'post'
    })
}