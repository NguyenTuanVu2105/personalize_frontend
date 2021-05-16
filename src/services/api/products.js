import {createAuthApiRequest, createApiRequest} from './index'

export const getCategories = (page = 1, limit = 10, isActive = true) => {
    return createApiRequest({
        url: `/abstract/product-categories/`,
        method: 'get',
        params: {page, limit, is_active: isActive, ordering: "sort_index"}
    })
}

export const getProducts = () => {
    return createApiRequest({
        url: `/abstract/products/`,
        method: 'get',
    })
}

export const getAProduct = (productId) => {
    return createApiRequest({
        url: `/abstract/products/${productId}/`,
        method: 'get',
    })
}

export const getDefaultProduct = (productId) => {
    return createApiRequest({
        url: `/abstract/products/get_default/`,
        method: 'get',
    })
}

export const getDetailCost = (productId) => {
    return createApiRequest({
        url: `/abstract/products/${productId}/cost_details/`,
        method: 'get',
    })
}

export const getProductsByCategory = (category) => {
    return createApiRequest({
        url: `/abstract/product-categories/${category}/`,
        method: 'get',
    })
}

export const getProductsByCategoryWithLocalstorage = async (category) => {
    const resData = await createApiRequest({
        url: `/abstract/product-categories/${category}/`,
        method: 'get',
        autoRedirect: false
    })
    if (!resData || !resData.success) {
        const altResData = await getProductsRecentlyUsed()
        return altResData.data
    }
    return resData
}

export const getProductsRecentlyUsed = () => {
    return createAuthApiRequest({
        url: `/seller/product-recent-used/`,
        method: 'get',
    })
}

export const getProductVariants = (product_id) => {
    return createAuthApiRequest({
        url: `/abstract/product-variant/`,
        method: 'get',
        params: {product_id}
    })
}

export const getAbstractProductVariant = (abstract_product) => {
    return createApiRequest({
        url: `/abstract/products/${abstract_product}/`,
        method: 'get',
    })
}

export const getMockupProductById = (id) => {
    return createApiRequest({
        url: `/seller/user-product/${id}/mockups/`,
        method: 'get',
    })
}

export const getProductsBySearchKey = (value) => {
    return createAuthApiRequest({
        url: '/abstract/products/',
        method: 'get',
        params: {q: value}
    })
}

export const logErrorProduct = (productId, message) => {
    const reqData = message ? {message: message} : {}
    return createAuthApiRequest({
        url: `/abstract/products/${productId}/error_log/`,
        method: "POST",
        data: reqData
    })
}
