import React, {useEffect, useState} from 'react'
import "./HighlightProductsContainer.scss"
import {Button, DisplayText, TextContainer} from "@shopify/polaris"
import {retrieveHighlightDetails, retrieveHighlightSampleProducts} from "../../../../services/api/highlightProducts"
import {notification, Skeleton} from "antd"
import HighlightProductDetail from "./HighlightProductDetail"
import {useHistory} from "react-router-dom"
import Paths from "../../../../routes/Paths"

const HighlightProductsContainer = (props) => {
    const [sampleProducts, setSampleProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [productDetail, setProductDetail] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [detailModalVisible, setDetailModalVisible] = useState(false)

    const history = useHistory()

    useEffect(() => {
        getListHighlightProducts()
    }, [])

    const getListHighlightProducts = async () => {
        const {success, data} = await retrieveHighlightSampleProducts()
        if (success) {
            setSampleProducts(data)
            setLoading(false)
        } else notification.error({
            message: "Error",
            description: `An error occurred. Please try again or contact our support team.`,
            duration: 3
        })
    }

    const handleOpen = async (productId) => {
        setSelectedProduct(productId)
        const {success, data} = await retrieveHighlightDetails(productId)
        if (!success) notification.error({
            message: "Error",
            description: "An error occurred, please try again or contact our support team"
        })
        else {
            setProductDetail(data)
            // console.log(data)
            setDetailModalVisible(true)
        }
    }

    const renderHighlightItem = (item, index) => {
        const productColumn = 2
        const productClass = index % (12 / productColumn) === 0 ? `col-lg-${productColumn} ml-0 p-3` : (index + 1) / (12 / productColumn) === 0 ? `col-lg-${productColumn} mr-0 p-3` : `col-lg-${productColumn} p-3`

        return (
            <div className={productClass} key={index}>
                <div className={"highlight-item-card"}>
                    <img
                        src={item.preview_image_url}
                        alt="" className="highlight-item-card__image"/>
                    <div className="highlight-item-card__text-wrapper">
                        <h2 className="highlight-item-card__title">{item.title}</h2>
                        <div className="highlight-item-card__details-wrapper">
                        <span className="mx-1 highlight-action-btn btn-see-info">
                            <Button size={"slim"} onClick={() => handleOpen(item.id)}>See info</Button>
                        </span>
                            <span className="mx-1 highlight-action-btn">
                            <Button primary size={"slim"}
                                    onClick={() => history.push(Paths.CustomizeSampleProduct(item.id))}>Customize</Button>
                        </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderHighlightSkeletonItem = (index) => {
        const productColumn = 2
        const productClass = index % (12 / productColumn) === 0 ? `col-lg-${productColumn} ml-0` : (index + 1) / (12 / productColumn) === 0 ? `col-lg-${productColumn} mr-0` : `col-lg-${productColumn}`

        return (
            <div key={index} className={productClass} style={{padding: "1rem"}}>
                <Skeleton loading={loading} avatar={{
                    shape: "square"
                }}/>
            </div>
        )
    }

    return sampleProducts.length > 0 ? (
        <div className={"highlight-section"}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <TextContainer spacing="tight">
                    <DisplayText element="h3" size="large">Highlight products</DisplayText>
                    <p>
                        Highlight and trending products
                    </p>
                </TextContainer>
                <div className={'mt-3'}>

                </div>
            </div>
            <div className="highlight-content">
                {
                    !loading && (
                        <div className="row content-wrapper" style={{marginLeft: "-1rem", marginRight: "-1rem"}}>
                            {
                                sampleProducts.map((item, index) => renderHighlightItem(item, index))
                            }
                        </div>
                    )
                }
                {
                    loading && (
                        <div className="row content-wrapper mx-0">
                            {
                                Array.from({length: 12}, (x, i) => i).map(index => renderHighlightSkeletonItem(index))
                            }
                        </div>
                    )
                }
            </div>
            {detailModalVisible && productDetail &&
            <HighlightProductDetail productId={selectedProduct} productDetail={productDetail}
                                    detailModalVisible={detailModalVisible}
                                    setDetailModalVisible={setDetailModalVisible}/>}
        </div>
    ) : (<div/>)
}

export default HighlightProductsContainer