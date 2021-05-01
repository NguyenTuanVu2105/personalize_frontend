import {createAuthApiRequest} from './index'

export const getPromptPolicies = (shop) => {
    return createAuthApiRequest({
        url: `/user/policy/list-prompt/`,
        method: 'GET',
    })
}