import {createAuthApiRequest, createApiRequest} from './index'
import {getLocalStorage} from '../storage/localStorage'
import {COOKIE_KEY} from '../storage/sessionStorage'
import {getReactEnv} from '../env/getEnv'
import Resumable from '../../shared/resumable'

export const getAllArtworks = (page, limit = 10, searchQuery, size, display = "-1", since, until, ordering, with_default=false, side_id=null) => {
    const params = {q: searchQuery, page, limit, size, since, until, with_default, side_id}
    // const is_active = display === "1" ? "true" : display === "2" ? "false" : null
    // if (is_active) params.is_active = is_active
    if (display !== "-1") params.status = display
    if (ordering) params.ordering = ordering
    return createAuthApiRequest({
        url: `/seller/artworks/`,
        method: 'get',
        params: params
    })
}

export const getAllArtworkWithDefault = (page, limit = 10, searchQuery, size, display = "-1", since, until, ordering, with_default=false) => {
    const params = {q: searchQuery, page, limit, size, since, until, with_default}
    // const is_active = display === "1" ? "true" : display === "2" ? "false" : null
    // if (is_active) params.is_active = is_active
    if (display !== "-1") params.status = display
    if (ordering) params.ordering = ordering
    return createApiRequest({
        url: `/seller/artworks/list_with_default/`,
        method: 'get',
        params: params
    })
}

export const cloneArtworkDefault = (data) => {
    return createApiRequest({
        url: '/seller/artworks/clone_default/',
        data,
        method: 'POST'
    })
}

export const artworkCheck = (data) => {
    return createApiRequest({
        url: '/seller/artwork-check/',
        data,
        method: 'POST'
    })
}

export const uploadArtwork = (files) => {
    const formData = new FormData()
    files.forEach((file, index) => {
        formData.append(`files`, file)
    })
    return createAuthApiRequest({
        url: '/seller/artworks/',
        data: formData,
        method: 'POST',
        isFormData: true,
    })
}


export const updateArtwork = (artworkId, name) => {
    const formData = new FormData()
    formData.append(`name`, name)
    return createAuthApiRequest({
        url: `/seller/artworks/${artworkId}/`,
        data: formData,
        method: 'PUT',
        isFormData: true,
    })
}

const baseUrl = getReactEnv('BACKEND_URL')

export const uploadChunkArtwork = ({file, onSuccess, onError, onProgress, attachedData={}}) => {
    const xhr = uploadChunk({
        file, onSuccess, onError, onProgress, attachedData,
        target: `${baseUrl}/seller/artwork_chunks/upload/`,
        mergeTarget: `${baseUrl}/seller/artwork_chunks/merge/`,
    })
    // xhr.upload()
    return xhr
}

export const updateChunkArtwork = ({artworkId, file, onSuccess, onError, onProgress, data}) => {
    const xhr = uploadChunk({
        file, onSuccess, onError, onProgress, attachedData: data,
        target: `${baseUrl}/seller/artwork_chunks/upload/`,
        mergeTarget: `${baseUrl}/seller/artworks/${artworkId}/`,
        mergeTargetMethod: 'PUT'
    })
    xhr.upload()
    return xhr
}

export const uploadChunk = ({file, onSuccess, onError, onProgress, target, mergeTarget, mergeTargetMethod, attachedData}) => {
    const headers = {}
    const xhr = new Resumable({
        target: target,
        mergeTarget: mergeTarget,
        headers,
        file: file,
        successCallback: onSuccess,
        errorCallback: onError,
        progressCallback: onProgress,
        simultaneousUploads: 3,
        mergeTargetMethod: mergeTargetMethod,
        attachedData
    })
    return xhr
}

export const cloneUserArtwork = (id, data) => {
    return createApiRequest({
        url: `/seller/artworks/${id}/clone/`,
        data,
        method: 'POST'
    })
}