import {createAuthApiRequest, createApiRequest} from "./index"

export const getProductStatistic = async () => {
    return createApiRequest({
        method: "GET",
        url: "/production/statistic/all/"
    })
}

export const getShippingAnalysis = async () => {
    try {
        return createAuthApiRequest({
            method: "GET",
            url: "/shipping_time/statistic/all/",
        })
    } catch (e) {
        const {response} = e
        return response.data
    }
}