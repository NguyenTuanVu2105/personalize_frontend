import React, {useEffect, useState} from 'react'
import DocTitle from '../../shared/DocTitle'
import NewProduct from './NewProduct'

import NewProductContext from '../context/NewProductContext'
import {layerErrorToString} from '../helper/checkArtworkConstraints'
import {
    getSessionStorage,
    removeSessionStorage,
    SESSION_KEY,
    setSessionStorage
} from '../../../services/storage/sessionStorage'
import {withRouter} from 'react-router-dom'
import {DUPLICATE, ECOMMERCEVARIANT, NEW_PRODUCT, SAMPLE_PRODUCT_CUSTOM} from "../constants/newproductMode"
import {parseArtwork} from "../helper/parseArtwork"
import {createMappingVariant, createSellerNoArtworkProduct, retrieveDefaultCurrency} from "../../../services/api/seller"
import {notification} from "antd"
import {NEW_PRODUCT_STEP_TITLE} from "../constants/stepTitle"
import Paths from "../../../routes/Paths"
import {DEFAULT_CURRENCY, LAYER_TYPE} from "../constants/constants"
import SemaphoreUpload from "../../../shared/semaphoreUpload"
import {UploadStatus} from "../constants/upload"
import {StepStatus} from "../../../shared/steps"
import {getProductStatistic} from "../../../services/api/productStatistic"
import _ from "lodash"
import {getDetailCost, logErrorProduct} from "../../../services/api/products"
import {getShippingCostDetail} from "../../../shared/setCostDetail"
import {getAllFont} from "../../../services/api/font"

const maxUploadArtWork = 2
const semaphore = new SemaphoreUpload(maxUploadArtWork, () => {
})


const NewProductContainer = function (props) {
    const newProductModeConfig = {
        mode: NEW_PRODUCT,
        stepTitle: NEW_PRODUCT_STEP_TITLE
    }
    const modeData = props.modeData ? props.modeData : newProductModeConfig
    // console.log(modeData)
    let sessionProduct
    if (props.location && props.location.deleteSession) {
        removeSessionStorage(SESSION_KEY.NEW_PRODUCT)
        sessionProduct = null
        props.location.deleteSession = false
    } else {
        sessionProduct = getSessionStorage(SESSION_KEY.NEW_PRODUCT)
    }

    // For test pricing
    const [product, _setProduct] = useState(modeData.defaultData || sessionProduct || {
        userProducts: [],
        step: 0,
        shops: [],
        userAgreeLegal: false,
        defaultBackgroundColor: null,
        attributes: {}
    })

    const [stores, setStores] = useState(null)
    const [isSubmit, setIsSubmit] = useState(false)
    const [isLoadingImage, _setIsLoadingImage] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [uploadManager, _setUploadManager] = useState([])
    const [defaultCurrency, setDefaultCurrency] = useState({})
    const [productionStatistic, setProductionStatistic] = useState([])
    const [stepPublish, _setStepPublish] = useState(StepStatus.WAIT)
    const [hasContainer,] = useState(props.hasContainer)
    const [shippingCosts, setShippingCosts] = useState([])
    const [costDetails, setCostDetails] = useState(null)
    const [listFonts, setListFonts] = useState([])
    // const [listFontsUrlBase64,setListFontsUrlBase64]=useState(listFonts.map(data=>{
    //     // data.font_base64="data:application/x-font-woff;charset=utf-8;base64,"+base64Encode(getBinary(data.font_url))
    //     return data
    // }))
    const setStepPublish = (status) => {
        _setStepPublish(status)
    }

    const cancelUpload = (id) => {
        let uploads = uploadManager
        let upload = uploads.find(upload => upload.id === id)
        if (upload) {
            if (upload.status === UploadStatus.UPLOADING || upload.status === UploadStatus.MERGING) {
                upload.uploadChunk.cancelUpload()
                _setUploadManager(uploads)
                semaphore.release(id)
            }
            upload.status = UploadStatus.CANCELED
        }
        cleanUploadChunk()
    }
    const [artworkUploadPercent, setArtworkUploadPercent] = useState(0)

    const fetchCost = async (productID) => {
        const response = await getDetailCost(productID)
        if (response.success) {
            const costDetail = response.data
            const shippingCosts = costDetail.costs
            const shippingZones = costDetail.shipping_zones
            const shippingRates = costDetail.shipping_rates
            const result = getShippingCostDetail(shippingCosts, shippingZones, shippingRates)
            setCostDetails(costDetail)
            setShippingCosts(result)
        }
    }

    const updateListFonts = async () => {
        const res = await getAllFont()
        if (res.success) {
            setListFonts(res.data)
            // console.log("res.data",res.data)
        }
    }

    useEffect(() => {
        semaphore.setHandle(handleUpload)
        if (uploadManager.length > 0) {
            const tmp = setInterval(() => {
                const progress = progressUpload()
                if (progress.total > 0) {
                    const percent = Math.floor(100 * parseFloat(parseFloat(progress.loaded) / parseFloat(progress.total)))
                    setArtworkUploadPercent(percent)
                    if (progress.total === progress.loaded) {
                        clearInterval(tmp)
                    }
                } else {
                    setArtworkUploadPercent(100)
                }
            }, 200)
            return () => {
                clearInterval(tmp)
            }
        } else {
            setArtworkUploadPercent(0)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadManager])


    const handleUpload = (upload) => {
        if (uploadManager.includes(upload)) {
            // console.log("Uploading : ", upload.id)
            upload.uploadChunk.upload()
            upload.status = UploadStatus.UPLOADING
        }
    }

    semaphore.setHandle(handleUpload)

    const cleanUploadChunk = () => {
        let uploads = uploadManager.filter(upload => upload.status !== UploadStatus.CANCELED)
        _setUploadManager(uploads)
    }

    const clearUpload = () => {
        if (uploadManager.every(upload => upload.status === UploadStatus.COMPLETED)) {
            _setUploadManager([])
        }
    }

    const startUpload = (id) => {
        let uploads = uploadManager
        uploads.forEach(upload => {
            upload.uploadChunk.id = upload.id
            if (!upload.uploadChunk.uploadDone) {
                upload.uploadChunk.uploadDone = uploadDone
            }
            if (!upload.uploadChunk.uploadFail) {
                upload.uploadChunk.uploadFail = uploadFail
            }
            if (!upload.uploadChunk.mergeDone) {
                upload.uploadChunk.mergeDone = mergeDone
            }
            if (!upload.status) {
                upload.status = UploadStatus.PENDING
            }
        })
        let upload = uploads.find(upload => upload.id === id && upload.status === UploadStatus.PENDING)
        if (upload) {
            upload.uploadChunk.bootstrap()
            semaphore.acquire(upload)
        }
        _setUploadManager(uploads)
    }

    const uploadDone = (id) => {
        // console.log("Merge: ", id)
        let uploads = uploadManager
        let upload = uploads.find(upload => upload.id === id)
        if (upload) {
            upload.status = UploadStatus.MERGING
        }
        _setUploadManager(uploads)
        semaphore.release(id)
    }

    const mergeDone = (id, data) => {
        // console.log("Upload Complete: ", id)
        let uploads = uploadManager
        let upload = uploads.find(upload => upload.id === id)
        if (upload) {
            upload.status = UploadStatus.COMPLETED
            let allLayer = []
            product.userProducts.forEach((p, iIndex) => {
                p.sideLayers.forEach((s) => {
                    allLayer.push(...s.layers)
                })
            })

            allLayer.forEach((l) => {
                if (l.uploadID === id){
                    for (const [key, value] of Object.entries(data)){
                        l[key] = value
                    }
                }
            })
        }
        _setUploadManager(uploads)
    }

    const uploadFail = (id) => {
        // console.log("Upload Fail: ", id)
        let uploads = uploadManager
        let upload = uploads.find(upload => upload.id === id)
        if (upload) {
            if (upload.status === UploadStatus.UPLOADING) {
                semaphore.release(id)
            }
            upload.status = UploadStatus.ERROR
        }
        _setUploadManager(uploads)
    }

    useEffect(() => {
        if (modeData.mode === ECOMMERCEVARIANT && !modeData.isModalClose) setStep(0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modeData.isModalClose])


    useEffect(() => {
        if (modeData.mode === ECOMMERCEVARIANT && modeData.isModalSubmit) submitMappingVariant(product)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modeData.isModalSubmit])

    useEffect(() => {
        if (modeData.mode === ECOMMERCEVARIANT) {
            if (product.userProducts.length > 0) {
                modeData.setCanSubmitModal(true)
            } else {
                modeData.setCanSubmitModal(false)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product])

    useEffect(() => {
        getStatistic()
        getDefaultCurrency()
        updateListFonts()
    }, [])

    const getStatistic = async () => {
        const {success, data} = await getProductStatistic()
        if (success) {
            if (data) {
                setProductionStatistic(data)
            }
        }
    }


    const submitMappingVariant = async (_product) => {
        // console.log(_product)
        const dataSubmit = {
            "ecomerce_variant_id": modeData.ecommerceVariant.id,
            "abstract_variant_id": _product.variants[0].abstract_variant,
            "artworks": parseArtwork(_product, _product.userProducts[0].sideLayers)
        }
        const resp = await createMappingVariant(dataSubmit)
        if (resp.success && resp.data.success) {
            modeData.setModalClose(false)
        } else {
            notification['error']({
                message: "Error",
                description: resp.data.error
            })
        }
        modeData.setModalSubmit(false)
        modeData.fetchData()
    }

    const submitProduct = () => {
        // console.log("product-         console.log(\"product-         // eslint-disable-next-line react-hooks/exhaustive-deps\\n\")\n")
        // console.log(product)

        // setLocalStorage(LOCALSTORAGE_KEY.SELECTED_STORE, product.shops)
        const useArtwork = product.abstract && product.abstract.sides.length > 0
        setStepPublish(StepStatus.PROCESS)
        return useArtwork ? setIsSubmit(true) : submitNonArtworkProduct()
    }

    const submitNonArtworkProduct = async () => {
        // console.log("submitNonArtworkProduct")
        // console.log(product)
        setIsPublishing(true)
        let reqData = {
            abstract_product_id: product.abstract_product_id,
            shops: product.shops,
            variants: product.variants.map(({price, currency, abstract_variant}) => ({
                price,
                currency,
                abstract_variant
            })),
            user_product_infos: [{
                title: product.userProducts[0].title,
                description: product.description,
                artworks: []
            }]
        }
        const res = await createSellerNoArtworkProduct(reqData)
        if (res.success && res.data.success) {
            notification['success']({
                message: 'Create Product Success',
                description:
                    'Your product is created successfully. It will take some minutes for syncing your product up with your store',
            })
            setTimeout(() => props.history.push(Paths.ListProducts), 500)
        }
    }

    // console.log(props.location.deleteSession)

    const setProductInStorage = async (p) => {

        setSessionStorage(SESSION_KEY.NEW_PRODUCT, {
            attributes: p.attributes,
            description: p.description,
            abstract: p.abstract,
            abstract_product_id: p.abstract_product_id,
            step: Math.min(p.step, 1),
            userProducts: p.abstract && p.abstract.sides.length === 0 ? p.userProducts : [],
            variants: p.variants,
            // userAgreeLegal: false,
            // backgroundColor: null
        })

    }

    const setProduct = (values) => {
        // console.log("setProduct - values", values)
        _setProduct(pro => {
            const newProduct = {...pro, ...values}
            setProductInStorage(newProduct).then()
            return newProduct
        })
    }

    const appendTextToSide = (sideId, curProductIndex) => {
        const currentProduct = product.userProducts[curProductIndex]
        currentProduct.previewUpdated = false
        const curSide = currentProduct.sideLayers.find((s) => s.side.id === sideId)
        const tmpLayers = [...curSide.layers]
        let lastLayerIndex = 0
        tmpLayers.forEach((i) => {
            lastLayerIndex = Math.max(lastLayerIndex, i.layerIndex)
        })
        lastLayerIndex++
        const textLayer = {
            sideId: sideId,
            visible: true,
            translate: [0, 0],
            layerIndex: lastLayerIndex,
            rotate: 0,
            scale: [1, 1],
            type: LAYER_TYPE.text,
            width: 123,
            height: 45,
            originWidth: 123,
            originHeight: 45,
            firstRender: true,
            xml: "",
            textStyle: {
                typeFace: "",
                //     {
                //     "id": 12111643662341,
                //     "title": "Auther",U
                //     "font_url": "https://storage.googleapis.com/printholo/temp-fonts/Auther%20Typeface.otf",
                //     "description": null,
                //     "create_time": "2021-03-04T16:59:12.587000Z",
                //     "update_time": "2021-03-04T16:58:59.017000Z",
                //     "font_base64":""
                // },
                defaultFontSize: 30,
                currentFontSize: 30,
                textColor: "#000000",
                letterSpacing: 0,
                arc: 0,
                fontUrlBase64: '',
            },
            isLegalAccepted: true,
            textPreview: "Preview text",
            displayText: "Preview text",
            data: "Preview text",
        }
        curSide.layers = [...curSide.layers, textLayer]
        setProduct({userProducts: product.userProducts})
        return lastLayerIndex
    }


    const appendArtworkToSide = (artworks, sideId, curProductIndex) => {
        artworks = [...artworks]

        const currentProduct = product.userProducts[curProductIndex]
        currentProduct.previewUpdated = false
        const curSide = currentProduct.sideLayers.find((s) => s.side.id === sideId)
        const tmpLayers = [...curSide.layers]
        let lastLayerIndex = 0
        tmpLayers.forEach((i) => {
            lastLayerIndex = Math.max(lastLayerIndex, i.layerIndex)
        })
        artworks.forEach((artwork) => {
            artwork.side = sideId
            lastLayerIndex++
            artwork.layerIndex = lastLayerIndex
            artwork.visible = true
            artwork.translate = [0, 0]
            artwork.rotate = 0
            artwork.scale = [1, 1]
        })
        curSide.layers = [...curSide.layers, ...artworks]
        setProduct({userProducts: product.userProducts})
        return lastLayerIndex
    }

    const duplicateLayer = (productIndex, sideId, layerIndex) => {
        const currentProduct = product.userProducts[productIndex]
        const curSide = currentProduct.sideLayers.find((s) => s.side.id === sideId)
        const tmpLayers = [...curSide.layers]
        let lastLayerIndex = 0
        tmpLayers.forEach((i) => {
            lastLayerIndex = Math.max(lastLayerIndex, i.layerIndex)
        })
        const originalLayer = curSide.layers.find((l) => l.layerIndex === layerIndex)
        if (!originalLayer.isProcessing) {
            const tmpLayer = _.cloneDeep(originalLayer)
            lastLayerIndex++
            tmpLayer.layerIndex = lastLayerIndex
            curSide.layers = [...curSide.layers, tmpLayer]
            currentProduct.previewUpdated = false
        }
        setProduct({userProducts: product.userProducts})
        return lastLayerIndex
    }

    const addNewProduct = () => {
        const sideLayers = []
        product.abstract.sides.forEach((side) => {
            const data = {}
            data.side = {...side}
            data.backgroundColor = product.defaultBackgroundColor
            data.layers = []
            sideLayers.push(data)
        })
        const title = product.abstract.title + "_" + product.userProducts.length
        product.userProducts.push({
            title: title,
            description: product.abstract.meta.description,
            sideLayers: sideLayers
        })
        setProduct({userProducts: product.userProducts})
        return product.userProducts.length
    }

    const removeProduct = (index) => {
        let userProducts = [...product.userProducts]
        userProducts.splice(index, 1)
        if (userProducts.length < 1) {
            const sideLayers = []
            product.abstract.sides.forEach((side) => {
                const data = {}
                data.side = {...side}
                data.layers = []
                data.backgroundColor = product.defaultBackgroundColor
                sideLayers.push(data)
            })
            const userProduct = product.abstract ? {
                title: product.abstract.title,
                description: product.description,
                sideLayers: sideLayers
            } : {}
            userProducts = [userProduct]
        }
        setProduct({userProducts: userProducts})
        return userProducts.length
    }

    const appendUserProducts = (userProducts) => {
        product.userProducts = [...userProducts, ...product.userProducts]
        setProduct({userProducts: product.userProducts})
    }

    const hasColorAttribute = () => {
        return product && product.attributes && !!product.attributes.Color
    }

    const updateArtwork = (artwork, sideId, productIndex) => {
        // let productArtworks = product.userProducts[productIndex].artworks
        // product.userProducts[productIndex].previewUpdated = false
        // productArtworks = productArtworks.filter(artwork => artwork.side !== sideId)
        // artwork.side = sideId
        // artwork.layerIndex = 0
        // productArtworks.push(artwork)
        // product.userProducts[productIndex].artworks = productArtworks
        // setProduct({userProducts: product.userProducts})
    }

    const replaceLayers = (srcSideId, srcProductIndex, destSideId, destProductIndex) => {
        const srcSide = product.userProducts[srcProductIndex].sideLayers.find(side => side.side.id === srcSideId)
        const destSide = product.userProducts[destProductIndex].sideLayers.find(side => side.side.id === destSideId)
        const srcLayers = _.cloneDeep(srcSide.layers)
        if (srcLayers.length > 0) {
            product.userProducts[destProductIndex].previewUpdated = false
            srcLayers.forEach(i => i.sideId = destSideId)
            destSide.layers = srcLayers
            destSide.backgroundColor = srcSide.backgroundColor
        }
        setProduct({userProducts: product.userProducts})
    }

    // const initUserProduct = () => {
    //     if(product.userProducts.length ===0) {
    //         const userProduct = {
    //             "title": product.abstract.title,
    //             "description": product.description,
    //             "artworks": []
    //         }
    //         if (product.abstract.sides.length === 0 || product.userProducts.length === 0) product.userProducts = [userProduct]
    //     }
    // }

    const removeArtwork = (sideId, productIndex, layerIndex) => {
        const curSide = product.userProducts[productIndex].sideLayers.find((s) => s.side.id === sideId)
        let uploadID = null
        const layers = curSide.layers.filter((layer) => {
            if (layer.layerIndex !== layerIndex) {
                return true
            } else {
                layer.canceled = true
                if (layer.uploadID) {
                    uploadID = layer.uploadID
                }
                return false
            }
        })
        let allLayer = []
        product.userProducts.forEach((p, iIndex) => {
            p.sideLayers.forEach((s) => {
                allLayer.push(...s.layers)
            })
        })

        let countLayerHasSameUploadId = 0
        allLayer.forEach((l) => {
            if (l.uploadID === uploadID) {
                countLayerHasSameUploadId++
            }
        })

        if (countLayerHasSameUploadId <= 1) {
            cancelUpload(uploadID)
        }

        product.userProducts[productIndex].previewUpdated = false

        curSide.layers = [...layers]
        let tempLayers = [...layers]
        tempLayers = _.orderBy(tempLayers, "layerIndex", "asc")
        tempLayers.forEach((value, index) => value.layerIndex = index + 1)

        setProduct({userProducts: product.userProducts})
        return tempLayers.length
    }

    const removeAllArtworks = () => {
        product.userProducts.forEach(product => {
            product.sideLayers.forEach((sideLayer) => {
                sideLayer.layers.forEach((layer) => {
                    layer.canceled = true
                })
            })
        })
        uploadManager.forEach(upload => {
            upload.uploadChunk.cancelUpload()
            upload.status = UploadStatus.CANCELED
        })
        semaphore.purge()
        _setUploadManager([])

        // product.userProducts.length = 0

        const sideLayers = []
        if (product.abstract) {
            product.abstract.sides.forEach((side) => {
                const data = {}
                data.side = {...side}
                data.layers = []
                data.backgroundColor = product.defaultBackgroundColor
                sideLayers.push(data)
            })
        }
        const userProduct = product.abstract ? {
            title: product.abstract.title,
            description: product.description,
            sideLayers: sideLayers
        } : {}
        product.userProducts = [userProduct]
        setProduct({userProducts: product.userProducts})
    }

    const updateAttributes = (selectedAttributes, instantaneousProduct) => {
        const commonProduct = instantaneousProduct ? instantaneousProduct : product
        // console.log("selectedAttributes", selectedAttributes)
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
        const attributeCount = commonProduct.abstract.child_attributes.length

        const rawVariants = commonProduct.abstract.abstract_product_variants

        let variants = rawVariants.filter((variant) => {
            return (variant.attributeValues.length === attributeCount
                && variant.attributeValues.every((id) => selectedAttributeValues.includes(id))
            )
        }).filter((variant) => {
            return modeData.defaultPrices ? modeData.defaultPrices.find(price => price.id === variant.id) : true
        }).map(variant => {
                return ({
                    abstract_variant: variant.id,
                    abstract: variant,
                    orderIndex: variant.attributeValues.reduce((result, v) => result + selectedAttributeValueIndexes[v], 0),
                    price: modeData.defaultPrices && modeData.defaultPrices.find(price => price.id === variant.id).prices
                })
            }
        )

        variants.sort((variant1, variant2) => variant1.orderIndex - variant2.orderIndex)
        setProduct({variants: variants, attributes: selectedAttributes})
    }


    const setStep = (step) => {
        // console.log(product, step)
        if (!canMoveStep(product, step)) {
            setProduct({step: step})
        }

    }

    // const isAllValidArtwork = (userProducts) => {
    //
    // }

    const setIsLoadingImage = (v) => {
        _setIsLoadingImage(v)
    }

    const reloadVariants = (product) => {
        if (product.abstract) {
            if (_.isEmpty(product.attributes)) {
                // console.log("empty")
                let attrData = {}
                product.abstract.child_attributes.forEach((attribute) => {
                    if (attribute.name === 'Color') {
                        attrData[attribute.name] = [attribute.child_attributes_value_set[0].id]
                    } else {
                        attribute.child_attributes_value_set.sort((attr1, attr2) => (attr1.sort_index - attr2.sort_index))
                        attrData[attribute.name] = attribute.child_attributes_value_set.map((a) => a.id)
                    }
                })
                updateAttributes(attrData, product)
            } else {
                // console.log(product.attributes)
                updateAttributes(product.attributes, product)
            }
        }
        // console.log(product.attributes)
        // console.log(product.variants)
    }


    // null: Can move,
    const canMoveStep = (_product, step = null) => {
        if (modeData.mode === DUPLICATE) {
            return canMoveStepDesign(_product)
        } else if (modeData.mode === SAMPLE_PRODUCT_CUSTOM) {
            if (step == null) step = _product.step + 1
            if (step === 2) {
                if (isPublishing) return {
                    description: 'Publishing... Please wait'
                }
            }
            if (step >= 1) {
                return canMoveStepDesign(_product)
            }
            return null
        } else {
            if (step == null) step = _product.step + 1
            if (step === 3) {
                if (isPublishing) return {
                    description: 'Publishing... Please wait'
                }
            }
            if (step >= 1 && !_product.abstract) return {
                description: 'Please choose a product'
            }
            if (step >= 2) {
                return canMoveStepDesign(_product)
            }
            return null
        }
    }

    const canMoveStepDesign = (_product) => {
        // console.log("_product", _product)
        const allArtworkAcceptedLegal = _product.userProducts.every(userProduct => {
            const layers = []
            userProduct.sideLayers.forEach((s) => {
                layers.push(...s.layers)
            })
            return layers.length > 0 && layers.every(artwork => artwork.isLegalAccepted)
        })
        // console.log("allArtworkAcceptedLegal", allArtworkAcceptedLegal)

        const useArtwork = _product.abstract && _product.abstract.sides.length > 0
        if (!useArtwork) {
            return null
        }

        const productError = isAllProductValid()
        if (productError) return productError
        if (!allArtworkAcceptedLegal && !_product.userAgreeLegal) {
            return {
                description: 'You have to agree legal/notice before publishing your products',
                selector: ['#legal']
            }
        }
        if (isLoadingImage) return {
            description: 'Image is loading'
        }
        if (_product.variants.length === 0) {
            logErrorProduct(_product.abstract_product_id).then()
            return {
                description: 'Please choose at least one color'
            }
        }
    }

    const highLightError = () => {
        const error = canMoveStep(product)
        if (error) {
            if (error.selector) {
                error.selector.forEach(selector => {
                    const element = document.querySelector(selector)
                    if (element) {
                        if (!element.classList.contains('importantError')) {
                            element.classList.add('importantError')
                            setTimeout(() => {
                                element.classList.remove('importantError')
                            }, 2000)
                        }
                    }
                })
                const selector = document.querySelector(error.selector[0])
                if (selector) {
                    selector.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                    })
                }
            }
        }
    }

    const removeAllInvalidArtworks = () => {
        const sides = {}

        product.abstract.sides.forEach(side => {
            sides[side.id] = side
        })

        product.userProducts.forEach((userProduct, productIndex) => {
            userProduct.sideLayers.forEach((sideLayer) => {
                sideLayer.layers.forEach((layer) => {
                    let upload = null;
                    if (layer.uploadID) {
                        upload = uploadManager.find(upload => upload.id === layer.uploadID)
                    }
                    if (layer.data && layerErrorToString(layer, sideLayer.side, upload)) {
                        removeArtwork(sideLayer.side.id, productIndex, layer.layerIndex)
                    }
                })
            })
        })
    }


    const isAllProductValid = () => {
        let result = null
        let listIndex = []
        let error = null
        product.userProducts.forEach((currentProduct, index) => {
            const tmpError = isProductValid(currentProduct)
            if (tmpError) {
                listIndex.push(`.product-artwork-item-container.product-${index}`)
                error = tmpError
            }
        })
        if (error) {
            result = {
                description: error,
                selector: listIndex
            }
        }
        return result
    }

    const isProductValid = (currentProduct) => {
        let error = null
        for (const sideLayer of currentProduct.sideLayers) {
            for (const layer of sideLayer.layers) {
                let upload = null
                if (layer && layer.uploadID) {
                    upload = uploadManager.find(upload => upload.id === layer.uploadID)
                }
                error = layerErrorToString(layer, sideLayer.side, upload)
                if (error) {
                    return error
                }
            }

        }
        return error
    }

    const nextStep = () => setStep(product.step + 1)


    const prevStep = () => {
        if (modeData.mode === NEW_PRODUCT) {
            if (product.step === 1) {
                removeAllArtworks()
            }
        }
        setStep(product.step - 1)
    }
    const setUploadManager = (v) => {
        _setUploadManager(v)
    }

    const setUserProductScreenshotProcessing = (productIndex, status) => {
        product.userProducts[productIndex].isCapturingScreenshot = status
    }

    const setUserProductPreviewImageStatusNotUpdated = (productIndex) => {
        product.userProducts[productIndex].previewUpdated = false
        setUserProductScreenshotProcessing(productIndex, false)
        setProduct({userProducts: product.userProducts})
    }

    const progressUpload = () => {
        if (uploadManager.length > 0) {
            let total = 0
            let loaded = 0
            uploadManager.forEach(upload => {
                if (upload.status !== UploadStatus.CANCELED) {
                    total += (upload.uploadChunk.chunks.length + 1)
                    upload.uploadChunk.chunks.forEach(chunk => {
                        loaded += chunk.percent
                    })
                    loaded += upload.uploadChunk.merge ? upload.uploadChunk.merge.percent : 0
                }
            })
            return ({
                total: total,
                loaded: loaded
            })
        } else {
            return ({
                total: 0,
                loaded: 0
            })
        }
    }

    const getDefaultCurrency = async () => {
        const {success, data} = await retrieveDefaultCurrency()
        const defaultCurrency = success ? data : DEFAULT_CURRENCY
        setDefaultCurrency({
            name: defaultCurrency.currency,
            exchangeRate: defaultCurrency.rate,
            precision: defaultCurrency.precision
        })
    }
    return (
        <NewProductContext.Provider value={{
            product: product,
            setProduct,
            step: product.step,
            setStep,
            nextStep,
            prevStep,
            canMoveStep,
            stores,
            setStores,
            defaultCurrency,
            appendArtworkToSide,
            appendTextToSide,
            updateArtwork,
            replaceLayers,
            updateAttributes,
            removeArtwork,
            appendUserProducts,
            removeAllArtworks,
            removeAllInvalidArtworks,
            isProductValid,
            isAllProductValid,
            isDuplicate: modeData.mode === DUPLICATE,
            isSampleCopy: modeData.mode === SAMPLE_PRODUCT_CUSTOM,
            isSubmit,
            setIsSubmit,
            submitProduct,
            setUserProductPreviewImageStatusNotUpdated,
            setUserProductScreenshotProcessing,
            setIsLoadingImage,
            highLightError,
            isEcommerceVariant: modeData.mode === ECOMMERCEVARIANT,
            modeData,
            uploadManager,
            setUploadManager,
            cancelUpload,
            startUpload,
            cleanUploadChunk,
            duplicateLayer,
            artworkUploadPercent,
            clearUpload,
            stepPublish,
            setStepPublish,
            hasColorAttribute,
            productionStatistic,
            hasContainer,
            addNewProduct,
            removeProduct,
            shippingCosts,
            costDetails,
            fetchCost,
            reloadVariants,
            updateListFonts,
            listFonts
        }}>
            <DocTitle
                title={props.title ? props.title : (modeData.mode === DUPLICATE ? "Duplicate product" : "Create product")}
            />
            <NewProduct {...props} />
        </NewProductContext.Provider>
    )
}

export default withRouter(NewProductContainer)
