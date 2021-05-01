import {createAuthApiRequest} from "./index"

export const retrieveHighlightSampleProducts = () => {
    return createAuthApiRequest({
        url: `/seller/sample-product/highlight-list/`,
        method: 'GET'
    })
}

export const retrieveHighlightDetails = (id) => {
    return createAuthApiRequest({
        url: `/seller/sample-product/${id}/detail/`,
        method: 'GET'
    })
}

export const retrieveHighlightDetailWithAbstract = (id) => {
    return createAuthApiRequest({
        url: `/seller/sample-product/${id}/with-abstract/`,
        method: 'GET'
    })
}

