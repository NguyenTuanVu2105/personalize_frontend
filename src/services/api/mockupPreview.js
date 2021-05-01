import {createAuthApiRequest} from "./index"
import {getReactEnv} from "../env/getEnv"

const mockupUrl = getReactEnv('MOCKUP_SEVICE_URL')

export const generateMockupPreview = (data) => {
    const formData = new FormData()
    formData.append("product_id", data.product_id)
    if (data.original_user_product_id) formData.append("original_user_product_id", data.original_user_product_id)
    else if (data.original_sample_product_id) formData.append("original_sample_product_id", data.original_sample_product_id)

    if (data.colors) {
        formData.append("colors", data.colors)
    }
    for (const side in data.artwork_info) {
        formData.append(`artwork_blobs__${side}`, data.artwork_info[side].blob)
    }
    return createAuthApiRequest({
        url: `/generate_preview`,
        data: formData,
        method: 'POST',
        isFormData: true,
        baseUrl: mockupUrl
    })
}

export const generateBackgroundMockup = (data) => {
    const formData = new FormData()
    formData.append("product_id", data.product_id)
    formData.append("mockup_version", data.mockup_version)
    data.backgroundFile ? formData.append("background_blob", data.backgroundFile) : formData.append("background_url", data.backgroundUrl)
    formData.append("mockups", JSON.stringify(data.mockups))
    // if (data.original_user_product_id) formData.append("original_user_product_id", data.original_user_product_id)
    // else if (data.original_sample_product_id) formData.append("original_sample_product_id", data.original_sample_product_id)

    return createAuthApiRequest({
        url: `/custom_background_mockup`,
        data: formData,
        method: 'POST',
        isFormData: true,
        baseUrl: mockupUrl
    })
}
