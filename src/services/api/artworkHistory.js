import {createAuthApiRequest} from './index'

export const artworkHistory = (artworkId, page, limit=10) => {
    return createAuthApiRequest({
        url: `/seller/artwork-history/`,
        method: 'GET',
        params: {original: artworkId, page, limit}
    })
}
