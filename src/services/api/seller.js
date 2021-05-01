import {createAuthApiRequest} from './index'
import _ from 'lodash'


export const createSellerProduct = (data) => {
    return createAuthApiRequest({
        url: `/seller/variants/`,
        data,
        method: 'POST',
        encode: 'gzip'
    })
}

export const createSellerNoArtworkProduct = (data) => {
    return createAuthApiRequest({
        url: `/seller/no-artwork-variants/`,
        data,
        method: 'POST',
        encode: 'gzip'
    })
}

export const getAllProductsByShop = (shop, searchQuery, page, limit = 10, since, until, status) => {
    const params = _.pickBy({shop, q: searchQuery, page, limit, status}, (attr) => !!attr)
    Object.assign(params, {since, until})
    return createAuthApiRequest({
        url: `/seller/user-product/`,
        method: 'get',
        params: params,
    })
}

export const getAllEcomerceProducts = (page, limit = 10) => {
    return createAuthApiRequest({
        url: `/seller/ecommerce-unsync-product/`,
        method: 'get',
        params: {page, limit}
    })
}

export const getAEcomerceProducts = (productId) => {
    return createAuthApiRequest({
        url: `/seller/ecommerce-unsync-product/${productId}/`,
        method: 'get',
    })
}

export const createMappingVariant = (data) => {
    return createAuthApiRequest({
        url: `/seller/ecommerce-unsync-product/create_mapping_variant/`,
        data,
        method: 'POST',
        // encode: 'gzip'
    })
}

export const getProductsByIds = (product_ids) => {
    return createAuthApiRequest({
        url: `/seller/user-product/`,
        method: 'get',
        params: {ids: product_ids.join(',')}
    })
}

export const getAUserProduct = (productId) => {
    return createAuthApiRequest({
        url: `/seller/user-product/${productId}/`,
        method: 'get'
    })
}

export const getAUserProductWithAbstract = (productId) => {
    return createAuthApiRequest({
        url: `/seller/user-product/${productId}/with_abstract/`,
        method: 'get'
    })
}

export const retrieveDuplicateProductData = (productId) => {
    return createAuthApiRequest({
        url: `/seller/user-product/${productId}/duplicate/`,
        method: 'get'
    })
}


export const getAUserProductAsyncInfo = (productId) => {
    return createAuthApiRequest({
        url: `/seller/user-product/${productId}/async/`,
        method: 'get'
    })
}

export const updateAUserProduct = (productId, data) => {
    return createAuthApiRequest({
        url: `/seller/user-product/${productId}/`,
        data: data,
        method: 'put'
    })
}


export const updateArtwork = (id, name, is_public = true) => {
    return createAuthApiRequest({
        url: `/seller/artworks/${id}/`,
        method: 'put',
        data: {'name': name, 'is_public': is_public}
    })
}

export const deleteArtwork = (id) => {
    return createAuthApiRequest({
        url: `/seller/artworks/${id}/`,
        method: 'delete'
    })
}

export const getDefaultVariantPrice = (abtract_product_id) => {
    return createAuthApiRequest({
        url: `/seller/variant-default-price/?product_id=${abtract_product_id}`,
        method: 'get'
    })
}


export const deleteShopifyUserProduct = (data, userProductId) => {
    return createAuthApiRequest({
        url: `/seller/user-product/${userProductId}/`,
        method: 'delete',
        data
    })
}

export const retrieveDefaultCurrency = () => {
    return createAuthApiRequest({
        url: `/currency/default/`,
        method: 'GET'
    })
}
