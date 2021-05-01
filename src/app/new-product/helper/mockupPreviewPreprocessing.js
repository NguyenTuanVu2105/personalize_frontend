import {waitForArtworksLoading, waitForArtworksProcessing} from "./artworkInterval"
import {prepareMockupPreviewData} from "./prepareMockupPreviewData"
import _ from "lodash"

export const mockupPreviewPreprocessing = async (product, userProduct, sides, loadingInterval, processingInterval) => {
    await waitForArtworksLoading(loadingInterval, userProduct)

    const selectedColors = product.attributes.Color

    let artworkInfo = {}
    let sideHasArtworks = []
    let colors = null
    if (selectedColors) {
        const colorAttribute = product.abstract.child_attributes.find(attribute => attribute.name.toLowerCase().includes('color'))
        colors = colorAttribute.child_attributes_value_set.filter(attr => selectedColors.includes(attr.id)).map(attr => attr.value).join(",")
    }

    for (const side of sides) {
        const sideLayer = userProduct.sideLayers.find((s) => s.side.id === side.id)
        let sideArtworks = sideLayer ? [...sideLayer.layers] : []
        sideArtworks = _.orderBy(sideArtworks, ["layerIndex"], ["asc"])
        const backgroundColor = sideLayer ? sideLayer.backgroundColor : null
        await prepareMockupPreviewData(backgroundColor, sideArtworks, side, artworkInfo)
        sideArtworks.length > 0 && sideHasArtworks.push(side)
    }

    await waitForArtworksProcessing(processingInterval, artworkInfo, sideHasArtworks)

    let result = {
        "product_id": product.abstract_product_id,
        "artwork_info": artworkInfo,
        "colors": colors
    }

    if (product.originalUserProductId) result.original_user_product_id = product.originalUserProductId
    else if (product.originalSampleProductId) result.original_sample_product_id = product.originalSampleProductId

    return result
}
