import {getResizedBase64} from '../../../services/base64'
import asyncPool from 'tiny-async-pool'
import {artworkCheck, cloneArtworkDefault, uploadChunkArtwork} from '../../../services/api/artwork'
import {sha256Hash} from '../../../services/util/hash'
import {notification} from "antd"
import {LAYER_TYPE} from "../constants/constants"

const CONCURRENT_PROCESS = navigator.hardwareConcurrency / 2
const processingList = []

const getSizeFromEvent = (e) => {
    try {
        if (e.path) {
            return [e.path[0].naturalWidth, e.path[0].naturalHeight]
        } else if (e.originalTarget) {
            return [e.originalTarget.naturalWidth, e.originalTarget.naturalHeight]
        } else if (e.srcElement) {
            return [e.srcElement.naturalWidth, e.srcElement.naturalHeight]
        }
    } catch (e) {
    }
    alert('Your browser does not support preview. Make sure you are using Chrome, Safari or Firefox')
    return [0, 0]

}

export const readArtworkFileList = async (processedList, callback) => {
    // const files = Array.from(fileList)
    // console.log(files);

    // let processedList = fileList.map((file) => {
    //     return {
    //         originName: file.name,
    //         name: file.name,
    //         meta: {},
    //         file: file
    //     }
    // })

    processingList.push(...processedList)

    if (processingList.length > 0) {
        let tmpArtwork = processingList.slice(0, processingList.length)
        let underProcessingList = []
        tmpArtwork.forEach(artwork => {
            underProcessingList.push({artwork: artwork, callback: callback})
        })
        processingList.length = 0
        await asyncPool(CONCURRENT_PROCESS, underProcessingList, readArtworkObject)
    }

    return processedList

    // return await asyncPool(CONCURRENT_PROCESS, files, readFileArtwork)
}


export const getExistArtworkSize = async (url) => {
    const image = new Image()
    image.src = url
    return new Promise(resolve => {
        image.onload = (e) => {
            resolve(getSizeFromEvent(e))
        }
    })
}

export const readFileArtwork = async (file) => {
    const [base64, width, height, originWidth, originHeight] = await getResizedBase64(file)
    return {
        originName: file.name,
        name: file.name,
        data: base64,
        meta: {},
        width,
        height,
        originWidth,
        originHeight,
        file: file
    }

}


export const readArtworkObject = async ({artwork, callback}) => {
    if (artwork.canceled !== true) {
        let file = artwork.file

        let tempArtworkObject = {
            originName: file.name,
            name: file.name,
            meta: {},
            file: file,
            status: 'uploading',
            isProcessing: true,
            uploadProgress: 0,
            type: LAYER_TYPE.artwork
        }

        for (let attr in tempArtworkObject) {
            artwork[attr] = tempArtworkObject[attr]
        }

        await uploadArtwork({artwork, callback})

        const [base64, width, height, originWidth, originHeight] = await getResizedBase64(file)

        tempArtworkObject = {
            width,
            height,
            originWidth,
            originHeight,
        }

        for (let attr in tempArtworkObject) {
            artwork[attr] = tempArtworkObject[attr]
        }

        if (!artwork.data) {
            artwork.data = base64
        }

        artwork.isProcessing = false
    }
}

const uploadArtwork = async ({artwork, callback}) => {
    if (artwork.canceled !== true) {
        let digest = await sha256Hash(artwork.file)
        const reqData = {'sha256': digest}
        const {success, data} = await artworkCheck(reqData)
        const onSuccess = (responseData) => {
            return {
                data: responseData.file_url,
                isLegalAccepted: responseData.is_legal_accepted,
                id: responseData.id,
                status: 'uploaded',
            }
        }
        if (
            success
            && data.success
            && data.existed
        ) {
            onSuccess(data.artwork)
        } else {
            if (artwork.canceled !== true) {
                artwork.resumable = uploadChunkArtwork({
                    file: artwork.file,
                    onSuccess: onSuccess,
                    onError: (message) => {
                        artwork.status = 'error'
                        notification.error({
                            message: message
                        })
                    },
                    onProgress: (percent) => {
                        artwork.uploadProgress = percent
                    }
                })
            }
            if (artwork.canceled !== true) {
                callback(artwork)
            }
        }
    }
}


export const readExistArtworks = async (artworksList) => {
    return await Promise.all(artworksList.map(readExistArtwork))
}

export const readExistArtwork = async (existArtwork) => {
    let artwork = null
    if (existArtwork.is_default) {
        const {success, data} = await cloneArtworkDefault({default_id: existArtwork.id})
        if (success) {
            const {data: artworkClone} = data
            artwork = {
                id: artworkClone.id,
                name: artworkClone.name,
                url: artworkClone.file_url,
                width: artworkClone.width,
                height: artworkClone.height,
                is_default: artworkClone.is_default,
                type: existArtwork.type,
            }
        }
    } else {
        artwork = JSON.parse(JSON.stringify(existArtwork))
        // console.log("artwork", artwork)
    }
    const [width, height] = await getExistArtworkSize(artwork.url)
    // console.log("w1",width)
    // console.log("h1",height)
    // console.log("w2",artwork.width)
    // console.log("h1",artwork.height)
    return {
        name: artwork.name,
        data: artwork.url,
        id: artwork.id,
        width,
        height,
        originWidth: artwork.width,
        originHeight: artwork.height,
        isLegalAccepted: artwork.isLegalAccepted,
        meta: {},
        type: artwork.type
    }
}







