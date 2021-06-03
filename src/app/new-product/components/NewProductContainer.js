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
import {createSellerNoArtworkProduct, retrieveDefaultCurrency} from "../../../services/api/seller"
import {notification} from "antd"
import Paths from "../../../routes/Paths"
import {DEFAULT_CURRENCY, LAYER_TYPE} from "../constants/constants"
import SemaphoreUpload from "../../../shared/semaphoreUpload"
import {UploadStatus} from "../constants/upload"
import {StepStatus} from "../../../shared/steps"
import {getProductStatistic} from "../../../services/api/productStatistic"
import _ from "lodash"
import {getDefaultProduct, getDetailCost} from "../../../services/api/products"
import {getShippingCostDetail} from "../../../shared/setCostDetail"
import {getAllFont} from "../../../services/api/font"

const maxUploadArtWork = 2
const semaphore = new SemaphoreUpload(maxUploadArtWork, () => {
})


const NewProductContainer = function (props) {
    // console.log(modeData)
    let sessionProduct
    if ((props.location && props.location.deleteSession)) {
        removeSessionStorage(SESSION_KEY.NEW_PRODUCT)
        sessionProduct = null
        props.location.deleteSession = false
    } else {
        sessionProduct = getSessionStorage(SESSION_KEY.NEW_PRODUCT)
    }

    // For test pricing
    const [product, _setProduct] = useState( sessionProduct || {
        userProducts: [],
        shops: [],
        defaultBackgroundColor: null,
        attributes: {},
        variants: [],
        abstract_product_id: null,
        abstract: null,
    })

    useEffect(async () => {
        if (!product.abstract_product_id) {
            const {data:respData} = await getDefaultProduct()
            let product = {
                userProducts: [],
                shops: [],
                defaultBackgroundColor: null,
                attributes: {},
                variants: [],
                abstract_product_id: respData.id,
                abstract: null,
            }
            setProduct(product)
        }
    }, [])

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
    useEffect(() => {

    }, [])
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
            userProducts: p.abstract && p.abstract.sides.length === 0 ? p.userProducts : [],
            variants: p.variants,
            // userAgreeLegal: false,
            // backgroundColor: null
        })

    }

    const setProduct = (values) => {
        _setProduct(pro => {
            const newProduct = {...pro, ...values}
            setProductInStorage(newProduct).then()
            console.log("setProduct - values", newProduct)
            return newProduct
        })
    }

    const appendTextToSide = (sideId, curProductIndex) => {
        const currentProduct = product.userProducts[curProductIndex]
        console.log(currentProduct)
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


    // const isAllValidArtwork = (userProducts) => {
    //
    // }

    const setIsLoadingImage = (v) => {
        _setIsLoadingImage(v)
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
            stores,
            setStores,
            defaultCurrency,
            appendArtworkToSide,
            appendTextToSide,
            updateArtwork,
            replaceLayers,
            removeArtwork,
            appendUserProducts,
            removeAllArtworks,
            removeAllInvalidArtworks,
            isProductValid,
            isAllProductValid,
            isSubmit,
            setIsSubmit,
            submitProduct,
            setUserProductPreviewImageStatusNotUpdated,
            setUserProductScreenshotProcessing,
            setIsLoadingImage,
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
            updateListFonts,
            listFonts
        }}>
            <DocTitle
                title={props.title ? props.title : "Create product"}
            />
            <NewProduct {...props} />
            <div id="hidden"/>
        </NewProductContext.Provider>
    )
}

export default withRouter(NewProductContainer)
