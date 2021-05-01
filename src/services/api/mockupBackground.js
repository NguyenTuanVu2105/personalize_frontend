import {createAuthApiRequest} from "./index"

export const getSampleBackgroundList = () => {
    return createAuthApiRequest({
        url: `/abstract/sample-mockup-background/`,
        method: 'GET',
    })
}
