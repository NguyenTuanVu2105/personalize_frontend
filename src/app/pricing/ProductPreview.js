import React, {useContext, useEffect, useState} from "react"
import {Card} from "@shopify/polaris"
import {Col, Row, Tooltip} from "antd"
import {LightboxPreview} from "../products/components/product-detail/LightboxPreview"
import NewProductContext from "../new-product/context/NewProductContext"
import {prepareMockupPreviewData} from "../new-product/helper/prepareMockupPreviewData"
import _ from "lodash"


const AttributeDisplay = ({attribute}) => {
    const display = attribute.value_set.map((item, index) =>
        (
            <span className={`attribute-${item.id}`} key={index}>
                {item.label + (index < attribute.value_set.length - 1 ? " - " : "")}
            </span>
        )
    )

    return (
        <div key={attribute.id} className="d-flex" style={{marginTop: '10px', cursor: "context-menu"}}>
            <div>
                <label className="lb-100" style={{color: "#454F5B"}}>
                    <b>{attribute.name}</b>
                </label>
            </div>
            <div style={{
                overflowWrap: "break-word"
            }}>{display}</div>
        </div>
    )

}

const ProductPreview = ({userProduct, attributes}) => {
    const [heightImage, setHeightImage] = useState(150)
    const [imageView, setImageView] = useState(false)
    const [viewIndex, setViewIndex] = useState(0)
    const [imagePreview, setImagePreview] = useState([])
    const {product} = useContext(NewProductContext)

    const getHeightImage = () => {
        let interval
        const find = () => {
            const element = document.querySelector('.product-artwork.product-image-preview')
            if (element) {
                setHeightImage(element.offsetWidth)
                clearInterval(interval)
                return true
            } else {
                setHeightImage(150)
                return false
            }
        }
        if (!find()) interval = setInterval(find, 100)
    }

    useEffect(() => {
        getHeightImage()
        window.addEventListener('resize', getHeightImage)
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setViewIndex(0)
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProduct])

    const fetchPreview = async () => {
        let result = []
        if (product.abstract.sides.length > 0) {
            const info = {}
            for (const sideLayer of userProduct.sideLayers) {
                let list = [...sideLayer.layers]
                list = _.orderBy(list, ["layerIndex"], ["asc"])
                const backgroundColor = sideLayer.backgroundColor
                await prepareMockupPreviewData(backgroundColor, list, sideLayer.side, info)
            }
            for (const [key, value] of Object.entries(info)) {
                const side = product.abstract.sides.find((side) => side.type === key)
                result.push({side: side, data: URL.createObjectURL(value.blob)})
            }
        } else {
            result = userProduct.preview.map(artwork => artwork)
        }
        setImagePreview(result)
    }

    useEffect(() => {
        fetchPreview()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProduct.artworks])


    const onClickProductImage = (index) => {
        setViewIndex(index)
        setImageView(true)
    }

    const closeImageView = () => {
        setImageView(false)
    }


    return (
        <Card.Section>
            <Row gutter={24}>
                <Col span={12}>
                    <div className="d-flex" style={{marginTop: '10px', cursor: "context-menu"}}>
                        <div>
                            <label className="lb-100" style={{color: "#454F5B"}}>
                                <b>Product title</b>
                            </label>
                        </div>
                        <div
                            style={{
                                overflowWrap: "break-word"
                            }}
                        >
                            {userProduct.title}
                        </div>
                    </div>

                    <div>
                        {
                            attributes.map((attribute, index) => {
                                return <AttributeDisplay key={index} attribute={attribute}/>
                            })
                        }
                    </div>
                </Col>
                <Col span={12}>
                    <Row
                        gutter={24}
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            flexWrap: 'wrap'
                        }}
                    >
                        {
                            imagePreview.map((image, index) => {
                                return (
                                    <Col
                                        span={12}
                                        lg={6}
                                        key={index}
                                        className="align-self-end"
                                    >
                                        <p align={"center"}>
                                            {
                                                product.abstract.sides.length > 0
                                                    ? <b>
                                                        {image.side ? image.side.type : "Unknown"}
                                                    </b>
                                                    : <span/>
                                            }

                                        </p>
                                        <div
                                            className="product-artwork product-image-preview"
                                            style={{height: heightImage}}
                                            onClick={() => onClickProductImage(index)}
                                        >
                                            <Tooltip title="Click to preview image">

                                                <img src={image.data}
                                                     alt={`variant-${index}`}/>
                                            </Tooltip>
                                        </div>
                                    </Col>
                                )
                            })
                        }
                    </Row>
                </Col>
            </Row>
            {imageView && (
                <LightboxPreview
                    currentIndex={viewIndex}
                    imageList={
                        imagePreview.map((artwork) => (artwork.data))
                    }
                    setCurrentIndex={setViewIndex}
                    closeImageView={closeImageView}
                />
            )}
        </Card.Section>
    )
}


export default ProductPreview
