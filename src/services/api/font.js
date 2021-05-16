import {createAuthApiRequest, createApiRequest} from "./index"

export const getAllFont = () => {
    return createApiRequest({
        url: "/seller/font/",
        method: "GET"
    })
}