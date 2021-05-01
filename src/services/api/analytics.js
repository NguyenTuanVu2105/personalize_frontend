import {createAuthApiRequest} from "./index"

export const getBestSellingProducts = (since, until) => {
    return createAuthApiRequest({
        url: '/analytics/best_selling_products/',
        method: 'GET',
        params: {since, until}
    })
}
