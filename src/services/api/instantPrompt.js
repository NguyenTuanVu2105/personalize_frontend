import {createAuthApiRequest} from "./index"

export const ignoreInstantPrompt = (data) => {
    return createAuthApiRequest({
        url: '/instant_prompt/ignore/',
        data,
        method: 'POST'
    })
}