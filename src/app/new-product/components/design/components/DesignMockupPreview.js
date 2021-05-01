import React, {useContext, useEffect, useRef, useState} from 'react'
import {Icon, Spinner} from '@shopify/polaris'
import {Carousel} from 'antd'
import './DesignMockupPreview.scss'
import {ChevronLeftMinor, ChevronRightMinor, SmileySadMajorMonotone} from '@shopify/polaris-icons'
import NewProductContext from '../../../context/NewProductContext'
import NewProductDesignContext from '../context/NewProductDesignContext'
import {getMockupInfoSide} from '../../../helper/getMockupInfo'
import {DESIGN_SECTION_SQUARE_SIZE} from "../../../constants/constants"
import {generateMockupPreview} from "../../../../../services/api/mockupPreview"
import {mockupPreviewPreprocessing} from "../../../helper/mockupPreviewPreprocessing"

function DesignMockupPreview({setHasMockup}) {
    const {product} = useContext(NewProductContext)

    const {designState} = useContext(NewProductDesignContext)

    const userProduct = product.userProducts[designState.currentProductIndex] || {}
    const productId = product.abstract_product_id
    const sides = product.abstract.sides

    const [previewImages, setPreviewImages] = useState(userProduct.previews || [])
    const [isLoaded, setIsLoaded] = useState(true)

    const carousel = useRef()
    const axiosRequestsFlag = useRef(0)

    const mockupInfo = getMockupInfoSide(product.abstract, designState.currentSideId, designState.currentVariant)

    useEffect(() => {
        setPreviewImages(userProduct.previews || [])
        userProduct.previews && userProduct.previews.length > 0 && setHasMockup(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProduct.previews])

    useEffect(() => {
        let loadingInterval
        let processingInterval

        const fetchMockup = async () => {
            setHasMockup(false)
            const currentRequestIndex = axiosRequestsFlag.current + 1
            axiosRequestsFlag.current += 1
            if (currentRequestIndex !== axiosRequestsFlag.current) return

            // console.log("PREPARE DATA", product)
            const data = await mockupPreviewPreprocessing(product, userProduct, sides, loadingInterval, processingInterval)
            // console.log("DATA", data)
            const res = await generateMockupPreview(data)
            // console.log(res);

            if (res && res.success && res.data.success) {
                let imageCollection = []
                let data = res.data.data
                const colorKeys = Object.keys(data)
                const isAOPMockup = colorKeys.length === 1
                for (const key of Object.keys(data)) {
                    if (data[key] && data[key].length)
                        for (const image of data[key]) {
                            const updatedImage = {
                                ...image,
                                isAOPMockup,
                                color: key
                            }
                            imageCollection.push(updatedImage)
                        }
                }
                userProduct.previews = imageCollection
                setHasMockup(true)
                userProduct.previewUpdated = true
                setIsLoaded(true)
            } else {
                setIsLoaded(true)
            }
        }

        if (!userProduct.previewUpdated) {
            userProduct.previews = []
            setIsLoaded(false)
            fetchMockup()
        }
        return () => {
            clearInterval(loadingInterval)
            clearInterval(processingInterval)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProduct.artworks, userProduct, productId, sides])

    if (!mockupInfo) return (<div/>)

    return (
        userProduct ? (
                <div className="preview-container d-flex justify-content-center align-items-center"
                     style={{minHeight: DESIGN_SECTION_SQUARE_SIZE - 40}}>
                    {
                        previewImages.length > 0
                            ? <div className="w-100 d-flex flex-column position-relative">
                                <div className={`arrow arrow-left ${previewImages.length < 2 ? "d-none" : ""}`}
                                     onClick={() => {
                                         carousel.current.prev()
                                     }}
                                >
                                    <Icon source={ChevronLeftMinor} color="indigoDark"/>
                                </div>
                                <div className={`arrow arrow-right ${previewImages.length < 2 ? "d-none" : ""}`}
                                     onClick={() => {
                                         carousel.current.next()
                                     }}
                                >
                                    <Icon source={ChevronRightMinor} color="indigoDark"/>
                                </div>
                                <Carousel ref={carousel} autoplay={false} dots={true} arrows={false}
                                    // beforeChange={beforeChange}
                                >
                                    {
                                        previewImages.map((image, index) => (
                                            <img className={"image-mockup-preview"} src={image.original} alt={image} key={index}/>
                                        ))
                                    }
                                </Carousel>
                            </div>
                            : isLoaded
                            ? (
                                <div style={{position: "absolute", top: "40%"}}>
                                    <div className={"my-3"}><Icon source={SmileySadMajorMonotone}/></div>
                                    <div>Nothing to preview</div>
                                    {/*<Spinner accessibilityLabel="Loading" size="large" color="teal"/>*/}
                                </div>
                            )
                            : (
                                <div>
                                    <Spinner accessibilityLabel="Loading" size="large" color="teal"/>
                                </div>
                            )
                    }
                </div>
            )
            : <div className="text-center">
                No products here
            </div>
    )
}

export default DesignMockupPreview
