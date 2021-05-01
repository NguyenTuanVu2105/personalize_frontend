import {createAuthApiRequest} from './index'
import _ from 'lodash'

export const getBriefUserProduct = (searchQuery, page, limit = 10, since, until, status) => {
    const params = _.pickBy({q: searchQuery, page, limit, status}, (attr) => !!attr)
    Object.assign(params, {since, until})
    return createAuthApiRequest({
        url: `/seller/user-product/brief/`,
        method: 'GET',
        params: params,
    })
}

export const getUserProductVariants = (userProductId) => {
    return createAuthApiRequest({
        url: `/seller/user-product/${userProductId}/variant-list/`,
        method: 'GET',
    })
}

export const productCheck = () => {
    return createAuthApiRequest({
        url: `/seller/product-check/`,
        method: 'GET',
    })
}

export const listSampleProduct = (searchQuery, page, limit = 10, since, until) => {
    const params = _.pickBy({q: searchQuery, page, limit}, (attr) => !!attr)
    Object.assign(params, {since, until})
    return createAuthApiRequest({
        url: `/seller/sample-product/`,
        method: 'GET',
        params: params,
    })
}

export const retrieveSampleProductVariants = (sampleProductId) => {
    return createAuthApiRequest({
        url: `/seller/sample-product/${sampleProductId}/variant-list/`,
        method: 'POST'
    })
}

export const retrieveSampleShippingAddress = () => {
    return createAuthApiRequest({
        url: `/sample-address/all/`,
        method: 'GET'
    })
}

export const deleteSampleShippingAddress = (id) => {
    return createAuthApiRequest({
        url: `/sample-address/${id}/`,
        method: 'DELETE'
    })
}

export const createSampleShippingAddress = (data) => {
    return createAuthApiRequest({
        url: `/sample-address/`,
        method: 'POST',
        data: data
    })
}

export const retrieveShippingCountries = () => {
    return createAuthApiRequest({
        url: `/seller/shipping-country/`,
        method: 'GET',
    })
}

export const retrieveShippingPlans = () => {
    return createAuthApiRequest({
        url: `/seller/shipping-plan/`,
        method: 'GET',
    })
}

export const retrieveShippingCost = (data) => {
    return createAuthApiRequest({
        url: `/orders/cost/`,
        method: 'POST',
        data: data
    })
}
export const createSystemOrder = (data) => {
    return createAuthApiRequest({
        url: `/orders/`,
        method: 'POST',
        data: data
    })
}