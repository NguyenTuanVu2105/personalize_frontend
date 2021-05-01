import {createAuthApiRequest} from "./index"

export const getAllFont = () => {
    return createAuthApiRequest({
        url: "/seller/font/",
        method: "GET"
    })
}