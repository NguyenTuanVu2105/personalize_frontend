import {createAuthApiRequest} from './index'

export const artworkUpdate = (artworkId, data) => {
    return createAuthApiRequest({
        url: `/seller/artworks/${artworkId}/`,
        data,
        method: 'PUT'
    })
}

export const artworkDeactivate = (artworkId) => {
    return createAuthApiRequest({
        url: `/seller/artworks/${artworkId}/`,
        method: 'DELETE'
    })
}

export const artworkActivate = (artworkId) => {
    return createAuthApiRequest({
        url: `/seller/artworks/${artworkId}/activate/`,
        method: 'PUT'
    })
}

export const artworkBulkActive = (artworkIds) => {
    return createAuthApiRequest({
        url: `/seller/artworks/bulk-active/`,
        method: 'PUT',
        data: {ids: artworkIds}
    })
}

export const artworkBulkDeactive = (artworkIds) => {
    return createAuthApiRequest({
        url: `/seller/artworks/bulk-deactive/`,
        method: 'DELETE',
        data: {ids: artworkIds}
    })
}


export const forceActivateArtwork = (id, artworkName) => {
    return createAuthApiRequest({
        url: `/seller/artworks/${id}/force-activate/`,
        method: 'PUT',
        data: {
            name: artworkName
        }
    })
}