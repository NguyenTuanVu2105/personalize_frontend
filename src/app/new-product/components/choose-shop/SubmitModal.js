import {Avatar, Icon, List, notification, Progress, Spin} from 'antd'
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react'
import {withRouter} from 'react-router-dom'
import Paths from '../../../../routes/Paths'
import {createSellerProduct} from '../../../../services/api/seller'
import {
    getSessionStorage,
    removeSessionStorage,
    SESSION_KEY,
    setSessionStorage
} from '../../../../services/storage/sessionStorage'
import NewProductContext from '../../context/NewProductContext'
import './SubmitModal.scss'
import {Badge, Banner, Button, Modal, Stack, Tooltip} from '@shopify/polaris'
import {LAYER_TYPE, MAX_BACKGROUND_COLORS_CACHING_ALLOW} from "../../constants/constants"
import {generateMockupPreview} from "../../../../services/api/mockupPreview"
import {mockupPreviewPreprocessing} from "../../helper/mockupPreviewPreprocessing"
import {LightboxPreview} from "../../../products/components/product-detail/LightboxPreview"
import {Beforeunload} from 'react-beforeunload'
import {StepStatus} from "../../../../shared/steps"
import {parseArtwork} from "../../helper/parseArtwork"

const UPLOAD_QUEUE_SIZE = 3
const PREVIEW_MOCKUP_SIZE = 2
let isWillContinueGenerate = true
let isPreviewOpend = false

const SUBMIT_MODAL_TITLE = {
    UPLOADING: "Uploading...",
    GENERATING: "Mockup Generating...",
    COMPLETED: "Mockup completed"
}

const MOCKUP_GENERATE_STATUS = {
    GENERATING: "Generating",
    PENDING: "Pending",
    PUBLISHING: "Publishing",
    COMPLETED: "Completed",
    ERROR: "Error",
}

const SubmitModal = (props) => {
    const {visible, setVisible} = props
    const {product, setProduct, artworkUploadPercent, uploadManager, setStepPublish} = useContext(NewProductContext)
    const [generateStatuses, setGenerateStatuses] = useState([])
    const [pauseAvailable, setPauseAvailable] = useState(true)
    const [pauseLoading, setPauseLoading] = useState(false)
    const [submitModalTitle, setSubmitModalTitle] = useState(SUBMIT_MODAL_TITLE.UPLOADING)
    const [imageViewVisible, setImageViewVisible] = useState(false)
    const [viewIndex, setViewIndex] = useState(0)
    const [imageUrls, setImageUrls] = useState([])
    const [isUploadCompleted, setIsUploadCompleted] = useState(false)
    const [, updateState] = useState()

    const numGeneratedProductRef = useRef(0)
    const numQueuedItems = useRef(0)

    useEffect(() => {
        initUploadStatus()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product.userProducts.length])

    useEffect(() => {
        isWillContinueGenerate = true
        setPauseAvailable(true)
        if (visible) submit()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible])

    const totalProduct = product.userProducts ? product.userProducts.length : 0
    const forceUpdate = useCallback(() => updateState({}), [])

    const checkUploadStatus = () => {
        if (!visible) return
        if (visible && !isWillContinueGenerate) {
            notification['info']({
                message: 'Continue generating your mockups'
            })
            isWillContinueGenerate = true
            submit()
        }
    }

    const initUploadStatus = () => {
        // console.log("initUploadStatus")
        return setGenerateStatuses(product.userProducts.map((item, i) => ({
            index: i,
            status: MOCKUP_GENERATE_STATUS.PENDING,
            title: item.title
        })))
    }

    const closeImageView = () => setImageViewVisible(false)
    const openImageView = () => {
        setImageViewVisible(true)
        isPreviewOpend = true
    }

    const sellerBackgroundColorCaching = (product) => {
        let sellerBackgroundColors = getSessionStorage(SESSION_KEY.SELLER_BACKGROUND_COLORS, [])
        product.userProducts.forEach(userProduct => {
            userProduct.sideLayers.forEach((sideLayer) => {
                if (sideLayer.backgroundColor) {
                    const color = sideLayer.backgroundColor.toUpperCase()
                    if (sellerBackgroundColors.includes(color)) {
                        const colorIndex = sellerBackgroundColors.indexOf(color)
                        if (colorIndex > -1) sellerBackgroundColors.splice(colorIndex, 1)
                    }
                    sellerBackgroundColors.unshift(color)
                    if (sellerBackgroundColors.length > MAX_BACKGROUND_COLORS_CACHING_ALLOW) sellerBackgroundColors = sellerBackgroundColors.slice(0, MAX_BACKGROUND_COLORS_CACHING_ALLOW)
                }
            })
        })
        setSessionStorage(SESSION_KEY.SELLER_BACKGROUND_COLORS, sellerBackgroundColors)
    }

    const submit = async () => {
        let data = {
            abstract_product_id: product.abstract_product_id,
            shops: product.shops,
            variants: product.variants.map(({price, currency, abstract_variant}) => ({
                price,
                currency,
                abstract_variant
            }))
        }

        const useArtwork = product.abstract.sides.length > 0

        sellerBackgroundColorCaching(product)

        if (useArtwork) {
            let pastUpload = JSON.parse(JSON.stringify(generateStatuses))
            for (const [index, userProduct] of product.userProducts.entries()) {
                console.log(index)
                await waitForFreeQueueSlot()
                if (!isWillContinueGenerate)
                    break
                if (generateStatuses[index] && generateStatuses[index].status !== MOCKUP_GENERATE_STATUS.PENDING)
                    continue
                produceSingleProductDataAndUpload(product, index, userProduct, data, pastUpload)
            }
            // setUploading(false)
            removeSessionStorage(SESSION_KEY.NEW_PRODUCT)
            removeSessionStorage(SESSION_KEY.NEW_PRODUCT_STEP)

            if (!isWillContinueGenerate) {
                notification['info']({
                    message: 'Mockup generation progress has been paused'
                })
                setSubmitModalTitle("Mockup generation paused")

            } else if (checkSuccess()) {


                notification['success']({
                    message: 'Create Product Success',
                    description:
                        'Your product is created successfully. It will take some minutes for syncing your product up with your store',
                })
                props.history.push(Paths.ListProducts)
            }
            setPauseLoading(false)
            if (totalProduct > UPLOAD_QUEUE_SIZE) setPauseAvailable(false)
            else setPauseAvailable(true)
            // setPauseAvailable(false)
        }
    }

    const checkSuccess = () => {
        let res = true
        generateStatuses.every(element => {
            if (element.status !== MOCKUP_GENERATE_STATUS.COMPLETED) {
                res = false
            }
            return res
        })
        return res
    }

    // const onCancel = () => {
    //     isContinueGenerate = true
    //     setGenerateStatuses([])
    //     props.history.push(Paths.ListProducts)
    // }


    const onSubmitCheckDone = () => {
        removeSessionStorage(SESSION_KEY.NEW_PRODUCT)
        props.history.push(Paths.ListProducts)
    }

    const waitForFreeQueueSlot = () => {
        return new Promise((resolve) => {
            setInterval(() => {
                if (numQueuedItems.current < UPLOAD_QUEUE_SIZE) {
                    resolve(true)
                }
            }, 50)
        })
    }

    const updateNumUploadedProduct = () => {
        // console.log("updateNumUploadedProduct", numGeneratedProductRef.current)
        numGeneratedProductRef.current += 1
        // console.log("updateNumUploadedProduct", numGeneratedProductRef.current)
        if (totalProduct > UPLOAD_QUEUE_SIZE && numGeneratedProductRef.current >= totalProduct - UPLOAD_QUEUE_SIZE) {
            setPauseAvailable(false)
            setPauseLoading(false)
        } else {
            setPauseAvailable(true)
            setPauseLoading(false)
        }
        // setNumGeneratedProduct(numGeneratedProductRef.current)
    }

    const increaseQueuedNumber = () => numQueuedItems.current += 1

    const decreaseQueuedNumber = () => numQueuedItems.current -= 1

    // const parseArtwork = (artwork) => {
    //     const side = product.abstract.sides.find(item => item.id === artwork.side)
    //     const mockupInfoId = product.variants[0].abstract.mockup_info
    //     const mockupInfo = product.abstract.mockup_infos.find(info => info.id === mockupInfoId).preview[side.type]
    //
    //     let frameRatio = mockupInfo.frame_width / mockupInfo.frame_height
    //     let imageRatio = artwork.width / artwork.height
    //     let fusion_size = side.fusion_size.artwork_fusion_size
    //     let imageOriginScale = (imageRatio > frameRatio)
    //         ? (fusion_size.width / artwork.originWidth)
    //         : (fusion_size.height / artwork.originHeight)
    //
    //     // console.log("SM - artwork", artwork)
    //
    //     return {
    //         side: {
    //             name: (side && side.type) || '',
    //             id: side.id
    //         },
    //         artworksList: [
    //             {
    //                 id: artwork.id,
    //                 name: artwork.name,
    //                 position: (artwork.translateRatio && {
    //                     'x': artwork.translateRatio[0] * fusion_size.width,
    //                     'y': artwork.translateRatio[1] * fusion_size.height
    //                 }) || {
    //                     'x': 0,
    //                     'y': 0
    //                 },
    //                 scale: standardFloatNumber((artwork.scale ? artwork.scale[0] : 1) * imageOriginScale, SCALE_DECIMAL_PLACES),
    //                 dndScale: standardFloatNumber(artwork.scale ? artwork.scale[0] : 1, SCALE_DECIMAL_PLACES),
    //                 // imageOriginScale: imageOriginScale,
    //                 rotation: artwork.rotate * -1 || 0,
    //                 meta: artwork.meta,
    //                 // artworkOriginWidth: artwork.originWidth,
    //                 // artworkOriginHeight: artwork.originHeight
    //             }
    //         ]
    //     }
    // }

    const produceSingleProductDataAndUpload = async (product, index, userProduct, data, pastUpload) => {
        increaseQueuedNumber()
        // let userProductClone = JSON.parse(JSON.stringify(userProduct))
        userProduct.description = product.description

        let currentItemStatus = {
            index: index,
            status: MOCKUP_GENERATE_STATUS.GENERATING,
            title: userProduct.title
        }

        const currentItem = pastUpload.find(item => item.index === index)
        for (let attr in currentItemStatus) {
            currentItem[attr] = currentItemStatus[attr]
        }

        setGenerateStatuses([...pastUpload])

        const layers = []

        userProduct.sideLayers.forEach((sideLayer) => {
            layers.push(...sideLayer.layers)
        })

        for (const layer of layers) {
            if (layer.type !== LAYER_TYPE.text && !layer.id) {
                try {
                    await waitArtworkUpload(layer)
                } catch (e) {
                    break
                }
            }
        }

        setSubmitModalTitle(SUBMIT_MODAL_TITLE.GENERATING)
        uploadSingleProduct(index, userProduct, data, pastUpload).then()
    }


    const waitArtworkUpload = (artwork) => {
        return new Promise((resolve, error) => {
            const internal = setInterval(() => {
                if (artwork.status === 'uploaded') {
                    resolve()
                    clearInterval(internal)
                } else if (artwork.status === 'error') {
                    error()
                }
            }, 200)
        })
    }


    const uploadSingleProduct = async (index, userProduct, data, pastUpload) => {
        let loadingInterval
        let processingInterval
        const sides = product.abstract.sides

        const fetchMockup = async () => {
            let imageCollection = []

            try {
                const data = await mockupPreviewPreprocessing(product, userProduct, sides, loadingInterval, processingInterval)
                const res = await generateMockupPreview(data)
                if (res && res.success && res.data.success) {
                    let data = res.data.data
                    const colorKeys = Object.keys(data)
                    const isAOPMockup = colorKeys.length === 1
                    for (const key of colorKeys) {
                        if (data[key] && data[key].length)
                            for (const image of data[key]) {
                                const updatedImage = {
                                    ...image,
                                    isAOPMockup,
                                    color: key
                                }
                                imageCollection.push(updatedImage)
                            }
                        console.log("imageCollection", imageCollection)
                        userProduct.previewUpdated = true
                    }
                    const currentItem = pastUpload.find(item => item.index === index)
                    currentItem['status'] = MOCKUP_GENERATE_STATUS.PUBLISHING
                    updateGenerateStatus(pastUpload)
                }

            } catch (e) {
                let newData = {index: index, title: userProduct.title}
                newData['status'] = MOCKUP_GENERATE_STATUS.ERROR
                notification.error({
                    message: userProduct.title,
                    description: `An error occurred when creating this product. Please try again or contact our support team.`,
                    duration: 3
                })
                const currentItem = pastUpload.find(item => item.index === index)
                currentItem['status'] = MOCKUP_GENERATE_STATUS.ERROR

                updateGenerateStatus(pastUpload)

            }
            return imageCollection
        }

        const userProductMockups = (userProduct.previewUpdated === true && userProduct.previews) ? userProduct.previews : await fetchMockup()
        if (userProductMockups.length !== 0) {
            const userProducts = product.userProducts
            userProducts[index].previews = userProductMockups
            setProduct({userProducts: userProducts})

            let userProductClone = JSON.parse(JSON.stringify(userProduct))

            data.user_product_infos = [userProductClone]

            userProductClone.sideLayers = parseArtwork(product, userProduct.sideLayers)
            userProductClone.userProductMockups = userProductMockups

            const res = await createSellerProduct(data)
            let newData = {index: index, title: userProduct.title}
            if (res && res.data && res.data.success) {
                newData['status'] = MOCKUP_GENERATE_STATUS.COMPLETED
                newData['product_id'] = res.data.product_ids[0]
            } else if (res && res.data && !res.data.success) {
                newData['status'] = MOCKUP_GENERATE_STATUS.ERROR
                newData['message'] = res.data.message || 'Unknown Error'
                notification['error']({
                    message: userProduct.title,
                    description: (res.data.message || '')
                })
            } else {
                newData['status'] = MOCKUP_GENERATE_STATUS.ERROR
                newData['message'] = 'Unknown Error'
                if (res && res.status && res.status.toString() === '429')
                    newData['message'] = 'You have uploaded too many products today. Please contact system administrator for more support.'
                notification['error']({
                    message: userProduct.title,
                    description: newData['message']
                })
            }

            const currentItem = pastUpload.find(item => item.index === index)
            for (let attr in newData) {
                currentItem[attr] = newData[attr]
            }
            // console.log(currentItem)
            updateGenerateStatus(pastUpload)
            forceUpdate()

        } else {
            let newData = {index: index, title: userProduct.title}
            newData['status'] = MOCKUP_GENERATE_STATUS.ERROR
            notification.error({
                message: userProduct.title,
                description: `An error occurred when creating this product. Please try again or contact our support team.`,
                duration: 3
            })
            const currentItem = pastUpload.find(item => item.index === index)
            currentItem['status'] = MOCKUP_GENERATE_STATUS.ERROR

            updateGenerateStatus(pastUpload)

        }
    }

    const updateGenerateStatus = (pastUpload) => {
        setIsUploadCompleted(isAllProductSucceedOrError(pastUpload))
        if (isAllProductSucceedOrError(pastUpload)) {
            setStepPublish(StepStatus.FINISH)
        }
        setGenerateStatuses(pastUpload)
        updateNumUploadedProduct()
        decreaseQueuedNumber()
    }

    const onUserProductImageClick = (userProductPreviews, index) => {
        const imageList = userProductPreviews.map(userProductPreview => userProductPreview.original)
        setImageUrls(imageList)
        setViewIndex(index)
        openImageView()
        // setImageViewVisible(true)
    }

    const renderIconStatus = useCallback((index) => {
        const item = generateStatuses[index]
        if (item.status === MOCKUP_GENERATE_STATUS.COMPLETED) {
            return <div className="status-upload"><Badge status="success" progress="complete">{item.status}</Badge>
            </div>
        } else if (item.status === MOCKUP_GENERATE_STATUS.GENERATING) {
            return <div className="status-upload"><Badge status="info"
                                                         progress="partiallyComplete">{item.status}</Badge></div>
        } else if (item.status === MOCKUP_GENERATE_STATUS.PUBLISHING) {
            return <div className="status-upload"><Badge status="info"
                                                         progress="partiallyComplete">{item.status}</Badge></div>
        } else if (item.status === MOCKUP_GENERATE_STATUS.PENDING) {
            return <div className="status-upload"><Badge progress="incomplete">{item.status}</Badge></div>
        } else return (
            <div className="status-upload">
                <Tooltip content={item.message}><Badge status="critical"
                                                       progress="incomplete">{item.status}</Badge></Tooltip>
            </div>
        )
    }, [generateStatuses])

    const renderMockupPreview = (index) => {
        let userProduct = product.userProducts[index]
        if ((!isWillContinueGenerate && generateStatuses[index].status === MOCKUP_GENERATE_STATUS.PENDING) || generateStatuses[index].status === MOCKUP_GENERATE_STATUS.ERROR) {
            return <Tooltip content="This product's mockup generation progress is paused">
                <Avatar shape="square" size={40}/>
            </Tooltip>
        } else if (userProduct.previewUpdated === true && userProduct.previews && userProduct.previews.length > 0) {
            const userProductLength = userProduct.previews.length
            const iteratorSize = userProductLength > PREVIEW_MOCKUP_SIZE ? PREVIEW_MOCKUP_SIZE : userProductLength
            return (
                <div className={'product-image-preview'}>
                    <Tooltip content='Click to preview image'>
                        {
                            Array.from({length: iteratorSize}, (x, i) => i).map(index => (
                                    <Avatar shape={'square'} src={userProduct.previews[index].original}
                                            alt={userProduct.title}
                                            size={40} className={'ml-1'}
                                            key={index}
                                            onClick={() => onUserProductImageClick(userProduct.previews, index)}/>
                                )
                            )
                        }
                        {
                            userProductLength > PREVIEW_MOCKUP_SIZE && (
                                <Avatar shape={'square'} alt={userProduct.title}
                                        size={40} className={'ml-1'}
                                        onClick={() => onUserProductImageClick(userProduct.previews, PREVIEW_MOCKUP_SIZE)}>+{userProductLength - PREVIEW_MOCKUP_SIZE}</Avatar>
                            )
                        }
                    </Tooltip>
                </div>
            )
        } else {
            const loadingIcon = <Icon type="loading" style={{fontSize: 14}} spin/>;
            return (
                <Tooltip content='Generating mockup'>
                    <Avatar shape="square" size={40} icon={<Spin indicator={loadingIcon}/>}/>
                </Tooltip>
            )
        }
    }

    const onCloseModal = (e) => {
        if (isPreviewOpend && e.keyCode === 27) {
            isPreviewOpend = false
        } else {
            if (isUploadCompleted) {
                onSubmitCheckDone()
            } else {
                const isGenerating = generateStatuses.map((generateStatus) => generateStatus.status).includes(MOCKUP_GENERATE_STATUS.GENERATING)
                if (!isUploadCompleted && !pauseAvailable && !isGenerating) {
                    setVisible(false)
                    // onCancel()
                    return
                }
                notification['error']({
                    message: 'Can not terminate ongoing progress'
                })
            }
        }
    }

    const onPauseButtonClick = () => {
        setPauseLoading(true)
        if (numGeneratedProductRef.current < totalProduct - 1) {
            isWillContinueGenerate = false
        }

    }

    const onContinueButtonClick = () => {
        if (numGeneratedProductRef.current < totalProduct - UPLOAD_QUEUE_SIZE) setPauseAvailable(true)
        checkUploadStatus()
    }

    const leavingProgressConfirm = (e) => {
        e.preventDefault()
        return "Your incomplete products 's data will be lost"
    }

    const renderProductTitle = (productTitle) => {
        return productTitle.length > 30 ? productTitle.substring(0, 30) + "..." : productTitle
    }

    const isAllProductSucceedOrError = (generateStatuses) => {
        const filterArray = [MOCKUP_GENERATE_STATUS.ERROR, MOCKUP_GENERATE_STATUS.COMPLETED]
        return generateStatuses.every(generateStatus => filterArray.includes(generateStatus.status))
    }

    const succedProducts = generateStatuses.filter(generateStatus => generateStatus.status === MOCKUP_GENERATE_STATUS.COMPLETED).length
    const footerButtonDisable = totalProduct > UPLOAD_QUEUE_SIZE ? numGeneratedProductRef.current >= totalProduct - UPLOAD_QUEUE_SIZE : true

    return (
        <Beforeunload onBeforeunload={(visible && !isUploadCompleted) ? leavingProgressConfirm : () => {
        }}>
            <Modal
                size={'large'}
                title={isUploadCompleted ? SUBMIT_MODAL_TITLE.COMPLETED : submitModalTitle}
                open={visible}
                // large
                onClose={onCloseModal}
                footer={[
                    // (!_continue && !isUploadCompleted && <Button key="close" onClick={onCancel}>Close</Button>),
                    (!isUploadCompleted && !pauseAvailable &&
                        <Button key="back" primary onClick={onContinueButtonClick}
                                disabled={footerButtonDisable && isWillContinueGenerate}>
                            Continue
                        </Button>),
                    (!isUploadCompleted && pauseAvailable &&
                        <Button key="back" onClick={onPauseButtonClick}
                                destructive loading={pauseLoading}
                                disabled={footerButtonDisable && isWillContinueGenerate}>
                            Pause
                        </Button>),

                    (isUploadCompleted && (
                        <div key={"done"}>
                            <span>
                                <Button key="submit" primary onClick={onSubmitCheckDone}>
                                    Go home
                                </Button>
                            </span>
                        </div>
                    ))
                ]}
            >
                <Modal.Section>
                    <Stack>
                        <Stack.Item>
                            Upload Artwork
                        </Stack.Item>
                        <Stack.Item fill>
                            <Progress
                                percent={uploadManager.length > 0 ? artworkUploadPercent : 100}
                                status={
                                    uploadManager.length > 0
                                        ? (artworkUploadPercent === 100 ? "success" : "active")
                                        : "success"
                                }
                            />
                        </Stack.Item>
                    </Stack>
                </Modal.Section>
                <Modal.Section>
                    <div className='choose-shop-submit-container'>
                        <div className={'generate-status-banner'}>
                            <Banner
                                title={`Completed ${succedProducts}/${totalProduct} products`}
                                status={succedProducts >= totalProduct ? 'success' : isUploadCompleted ? 'critical' : 'info'}
                            />
                        </div>
                        <List
                            itemLayout={'horizontal'}
                            dataSource={generateStatuses}
                            renderItem={item => (
                                <List.Item>
                                    <div className="row ml-0 flex-space">
                                        <div className={"col-lg-3 pl-0"}>
                                            {renderIconStatus(item.index)}
                                        </div>
                                        <div className="col-lg-6 item-title-list">
                                            {
                                                item.product_id && (
                                                    <Tooltip content={"See product detail in new tab"}>
                                                        <a className={'title-list-uploading'}
                                                           href={Paths.ProductDetail(item.product_id)}
                                                           rel="noopener noreferrer">{renderProductTitle(item.title)}</a>
                                                    </Tooltip>
                                                )
                                            }
                                            {!item.product_id &&
                                            <h6 className={'title-list-uploading'}>{renderProductTitle(item.title)}</h6>}
                                        </div>
                                        <div className={"col-lg-3 pr-0 text-right"}>
                                            {renderMockupPreview(item.index)}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                </Modal.Section>
            </Modal>
            {imageViewVisible && (
                <LightboxPreview currentIndex={viewIndex}
                                 imageList={imageUrls}
                                 setCurrentIndex={setViewIndex}
                                 closeImageView={closeImageView}/>
            )}
        </Beforeunload>
    )
}

export default withRouter(SubmitModal)
