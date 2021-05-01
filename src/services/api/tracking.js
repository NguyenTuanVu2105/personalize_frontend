import {createApiRequest} from "./index"

export const getDetailTracking = (tracking_number) => {
    return createApiRequest({
        url: `/order-tracker/${tracking_number}/`,
        method: "GET"
    })
}
