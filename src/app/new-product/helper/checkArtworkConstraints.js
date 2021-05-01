import {
    ARTWORK_ERROR_CODES,
    LAYER_ERRORS,
    LAYER_TYPE,
    MAX_SCALE_ALLOW,
    SCALE_DECIMAL_PLACES
} from '../constants/constants'
import {UploadStatus} from '../constants/upload'
import {standardFloatNumber} from "./standardFloatNumberProps"

const ARTWORK_CHECK_ERROR_MESSAGES = {
    INVALID_SIZE: 'Artwork size is not allowed',
    LOW_DPI: 'Artwork DPI is low',
    REQUIRED: 'Artwork is required',
}

export const checkArtworkConstraints = (artwork, constraints) => {
    if (!constraints) return null
    if (constraints.required && !artwork) return ARTWORK_CHECK_ERROR_MESSAGES.REQUIRED
    if (constraints.allowed_sizes) {
        if (!constraints.allowed_sizes.find(size => size.width === artwork.originWidth && size.height === artwork.originHeight)) {
            return ARTWORK_CHECK_ERROR_MESSAGES.INVALID_SIZE
        }
    }
    return null
}

export const checkLayerSideConstraints = (artwork, side, upload) => {
    // console.log(artwork)
    // artwork.scale && console.log(artwork.scale[0])
    if (!side) return null
    const constraints = side.constraints
    if (!artwork) {
        if (constraints.required) return ARTWORK_ERROR_CODES.REQUIRED
        else return null
    }

    if (artwork.type !== LAYER_TYPE.text) {
        if (checkArtworkDPI(artwork, side)) {
            return ARTWORK_ERROR_CODES.LOW_DPI
        }
    }

    if (artwork.type !== LAYER_TYPE.text) {
        if (artwork.scale && (artwork.scale[0] > MAX_SCALE_ALLOW)) {
            return ARTWORK_ERROR_CODES.LARGE_SCALE
        }
    }

    if (upload) {
        if (upload.status === UploadStatus.ERROR) return ARTWORK_ERROR_CODES.UPLOAD_ERROR
    }
    // if (artwork.scale && (artwork.scale[0] < MIN_SCALE_ALLOW)) return  ARTWORK_ERROR_CODES.SMALL_SCALE
    return null
}

export const layerErrorToString = (layer, side, upload) => {
    const errorCode = checkLayerSideConstraints(layer, side, upload)
    return errorCode ? LAYER_ERRORS[errorCode](layer, side) : null
}

export const checkArtworkDPI = (artwork, side) => {
    if (!artwork) return false
    let artworkDPI = getArtworkDPI(artwork, side)
    return artworkDPI < side.constraints.minimum_dpi

}

export const getArtworkDPI = (artwork, side) => {
    if (side && artwork) {
        let scale = standardFloatNumber(((artwork.scale && artwork.scale[0]) || 1), SCALE_DECIMAL_PLACES)
        let widthDpi = artwork.originWidth / (scale * side.fusion_size.artwork_fusion_size.width_in_inch)
        let heightDpi = artwork.originHeight / (scale * side.fusion_size.artwork_fusion_size.height_in_inch)
        let artworkDPI = Math.max(widthDpi, heightDpi)

        return Math.abs(Math.round((artworkDPI + Number.EPSILON)))
    }
}
