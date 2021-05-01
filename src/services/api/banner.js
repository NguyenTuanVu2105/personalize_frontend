import {createApiRequest} from "./index"

export const getActiveEvent = () =>{
    return createApiRequest({
        url: "/event/active/",
        method: "GET"
    })
}