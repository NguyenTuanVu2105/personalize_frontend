import React, {useCallback, useContext, useEffect, useState} from 'react'
import AppContext from '../../../../AppContext'
import NewProductContainer from '../NewProductContainer'
import {SAMPLE_PRODUCT_CUSTOM} from "../../constants/newproductMode"
import {SAMPLE_PRODUCT_CUSTOM_STEP_TITLE} from "../../constants/stepTitle"
import {retrieveHighlightDetailWithAbstract} from "../../../../services/api/highlightProducts"
import LoadingScreen from "../../../userpage/components/LoadingScreen"
import {DEFAULT_BACKGROUND_COLOR, LAYER_TYPE} from "../../constants/constants"
import {cloneUserArtwork} from "../../../../services/api/artwork"
import _ from "lodash"
import DesignTextLayer from "../design/components/DesignTextLayer"
import {validCharacter} from "../../helper/createText"

const CustomizeSampleProduct = (props) => {
    const {productId: sampleProductId} = props.match.params
    const {setLoading} = useContext(AppContext)

    const [state, setState] = useState(null)
    const [, updateState] = useState()
    const [loadingInfo, setLoadingInfo] = useState(true)

    const forceUpdate = useCallback(() => {
        updateState({})
    }, [])

    useEffect(() => {
        _fetchProductInfo(sampleProductId).then(() => {
            setTimeout(() => {
                setLoadingInfo(false)
            }, 500)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const updateAttributes = (selectedAttributes, abstract) => {
        const selectedAttributeValues = Object.values(selectedAttributes).reduce((result, values) => result.concat(values), [])
        const selectedAttributeValueIndexes = {}
        const selectedAttributeValueLength = selectedAttributeValues.length
        Object.values(selectedAttributes).forEach((values, attrIndex) => {
            const boost = Math.pow(selectedAttributeValueLength, attrIndex)
            values.forEach((value, valueIndex) => {
                // console.log(value, valueIndex, boost, valueIndex * boost)
                selectedAttributeValueIndexes[value] = valueIndex * boost
            })
        })
        const attributeCount = abstract.child_attributes.length

        const rawVariants = abstract.abstract_product_variants

        let variants = rawVariants.filter((variant) => {
            return (variant.attributes_value.length === attributeCount
                && variant.attributes_value.every((id) => selectedAttributeValues.includes(id))
            )
        }).map(variant => {
                return ({
                    abstract_variant: variant.id,
                    abstract: variant,
                    orderIndex: variant.attributes_value.reduce((result, v) => result + selectedAttributeValueIndexes[v], 0),
                    // price: modeData.defaultPrices && modeData.defaultPrices.find(price => price.id === variant.id).prices
                })
            }
        )

        variants.sort((variant1, variant2) => variant1.orderIndex - variant2.orderIndex)
        return {variants, attributes: selectedAttributes}
    }

    const transformArtworkData = (userProductArtworkFusionData, abstractProduct, variants, sideLayersData) => {
        return new Promise(async (resolve, reject) => {
            for (const abstractProductSide of abstractProduct.sides) {
                const userProductArtworkFusion = userProductArtworkFusionData.find(u => abstractProductSide.id === u.product_side)
                const data = {}
                data.side = abstractProductSide
                data.backgroundColor = userProductArtworkFusion.artwork_fusion.background_color
                data.layers = []
                sideLayersData.push(data)
            }
            for (const artworkFusion of userProductArtworkFusionData) {
                // console.log(artworkFusion)

                for (const artworkFusionInfo of artworkFusion.artwork_fusion.artwork_fusion_info_data) {
                    // const artworkFusionInfo = artworkFusion.artwork_fusion.artwork_fusion_info_data[0]
                    const sideLayer = sideLayersData.find((s) => s.side.id === artworkFusion.product_side)
                    // const mockupInfoId = variants[0].abstract.mockup_info
                    // const mockupInfo = abstractProduct.mockup_infos.find(info => info.id === mockupInfoId).preview[side.type]
                    // let frameRatio = mockupInfo.frame_width / mockupInfo.frame_height
                    try {
                        if (artworkFusionInfo && sideLayer && artworkFusionInfo.layer_content) {
                            if (artworkFusionInfo.layer_type === LAYER_TYPE.artwork) {
                                // console.log("artworkFusionInfo", artworkFusionInfo)
                                const artworkInfo = artworkFusionInfo.layer_content
                                const reqData = {
                                    sha256: artworkInfo.sha256
                                }
                                const {
                                    success,
                                    data: artworkCloneResponse
                                } = await cloneUserArtwork(artworkInfo.id, reqData)
                                if (!success || !artworkCloneResponse.success) reject()
                                const image = new Image()
                                image.src = artworkInfo.file_url
                                image.onerror = (e) => {
                                    console.log(e)
                                    reject(e)
                                }
                                image.onload = () => {
                                    // let imageRatio = image.width / image.height
                                    let fusion_size = sideLayer.side.fusion_size.artwork_fusion_size
                                    // let imageOriginScale = (imageRatio > frameRatio)
                                    //     ? (fusion_size.width / artworkInfo.width)
                                    //     : (fusion_size.height / artworkInfo.height)

                                    let position = artworkFusionInfo.position
                                    sideLayer.layers.push({
                                        id: artworkCloneResponse.artwork_id,
                                        isLegalAccepted: artworkCloneResponse.is_legal_accepted,
                                        layerIndex: artworkFusionInfo.layer,
                                        data: artworkInfo.file_url,
                                        type: LAYER_TYPE.artwork,
                                        side: artworkFusion.product_side,
                                        width: image.width,
                                        height: image.height,
                                        originHeight: artworkInfo.height,
                                        originWidth: artworkInfo.width,
                                        name: artworkInfo.name,
                                        translateRatio: [position.x / fusion_size.width, position.y / fusion_size.height],
                                        rotate: artworkFusionInfo.rotation * -1,
                                        scale: [artworkFusionInfo.dnd_scale, artworkFusionInfo.dnd_scale],
                                        visible: !artworkFusionInfo.is_hidden
                                    })
                                    forceUpdate()
                                }
                            } else if (artworkFusionInfo.layer_type === LAYER_TYPE.text) {
                                const layer_content = artworkFusionInfo.layer_content
                                const layer = {
                                    sideId: sideLayer.side.id,
                                    visible: !artworkFusionInfo.is_hidden,
                                    layerIndex: artworkFusionInfo.layer,
                                    rotate: artworkFusionInfo.rotation * -1,
                                    scale: [artworkFusionInfo.dnd_scale, artworkFusionInfo.dnd_scale],
                                    type: LAYER_TYPE.text,
                                    width: 123,
                                    height: 45,
                                    originWidth: 123,
                                    originHeight: 45,
                                    firstRender: false,
                                    xml: "",
                                    textStyle: {
                                        typeFace: layer_content.font_family,
                                        defaultFontSize: 30,
                                        currentFontSize: layer_content.text_size,
                                        textColor: layer_content.text_color,
                                        letterSpacing: layer_content.text_spacing,
                                        arc: layer_content.arc,
                                    },
                                    isLegalAccepted: true,
                                    textPreview: layer_content.text,
                                    displayText: validCharacter(layer_content.text, layer_content.font_family),
                                }
                                DesignTextLayer(layer, 1)
                                const image = new Image()
                                image.src = layer.data
                                image.onerror = (e) => {
                                    console.log(e)
                                    reject(e)
                                }
                                image.onload = () => {
                                    // let imageRatio = image.width / image.height
                                    let fusion_size = sideLayer.side.fusion_size.artwork_fusion_size
                                    // let imageOriginScale = (imageRatio > frameRatio)
                                    //     ? (fusion_size.width / artworkInfo.width)
                                    //     : (fusion_size.height / artworkInfo.height)

                                    let position = artworkFusionInfo.position
                                    sideLayer.layers.push({
                                        ...layer,
                                        translateRatio: [position.x / fusion_size.width, position.y / fusion_size.height],
                                    })
                                    forceUpdate()
                                }
                            }
                        }
                    } catch (e) {
                        console.log(e)
                        reject(e)
                    }
                }
            }
            resolve()
        })
    }


    const transformUserProduct = async (sampleProduct, abstractProduct, variants) => {
        const userProductArtworkFusionData = sampleProduct.user_product_artwork_fusion_data
        _.remove(userProductArtworkFusionData, {is_seller_visible: false})
        const sideLayersData = []
        await transformArtworkData(userProductArtworkFusionData, abstractProduct, variants, sideLayersData)

        return [{
            title: sampleProduct.title,
            description: sampleProduct.description,
            previewUpdated: false,
            sideLayers: sideLayersData,
        }]
    }

    const _fetchProductInfo = async () => {
        setLoading(true)
        setLoadingInfo(true)
        const productsRes = await retrieveHighlightDetailWithAbstract(sampleProductId)
        const {success: productSuccess, data: productsData} = productsRes
        const {
            sample_product: sampleProduct,
            abstract_product: abstractProduct,
            mockup_version: mockupVersion
        } = productsData

        if (!productSuccess)
            return

        let attrData = {}
        abstractProduct.child_attributes.forEach((attribute) => {
            if (attribute.name === 'Color') {
                attrData[attribute.name] = [attribute.child_attributes_value_set[0].id]
            } else {
                attribute.child_attributes_value_set.sort((attr1, attr2) => (attr1.sort_index - attr2.sort_index))
                attrData[attribute.name] = attribute.child_attributes_value_set.map((a) => a.id)
            }
        })

        const {variants, attributes} = updateAttributes(attrData, abstractProduct)
        const userProductData = await transformUserProduct(sampleProduct, abstractProduct, variants)
        const state = {
            product: {
                step: 0,
                defaultBackgroundColor: sampleProduct.background_color || DEFAULT_BACKGROUND_COLOR,
                originalSampleProductId: sampleProductId,
                mockupVersion: mockupVersion,
                abstract_product_id: sampleProduct.abstract_product,
                userProducts: userProductData,
                description: sampleProduct.description,
                attributes,
                // shops: userProduct.shop_user_product_set.map(item => item.shop.id),
                variants,
            },
            abstractProduct,
        }
        setState(state)
        setLoading(false)
    }

    return state && !(Object.keys(state).length === 0) && !loadingInfo ? (
        <NewProductContainer
            modeData={{
                mode: SAMPLE_PRODUCT_CUSTOM,
                defaultData: state.product,
                // defaultPrices: state.variantPrices,
                // productId: sampleProductId,
                abstractProduct: state.abstractProduct,
                stepTitle: SAMPLE_PRODUCT_CUSTOM_STEP_TITLE
            }}
        />
    ) : (<LoadingScreen/>)
}

export default CustomizeSampleProduct
