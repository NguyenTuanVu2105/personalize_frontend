import React, {useRef} from 'react'
import {Banner, Icon} from '@shopify/polaris'
import './PreviewArea.scss'
import {Carousel, Col, Row} from 'antd'
import {ChevronLeftMinor, ChevronRightMinor} from "@shopify/polaris-icons"
import {DESIGN_SECTION_SQUARE_SIZE} from "../../../../constants/constants"
import ProductDescription from "../product-info-view/ProductDescription"

const PreviewArea = (props) => {
    const {abstract: abstract_product} = props
    const carousel = useRef()

    // console.log("PROPS", abstract_product.mockup_infos)
    const image2DList = abstract_product.mockup_infos.map(mockup_info => {
        return mockup_info.meta.mockup_infos.map(mockup => mockup.image_url)
    })
    const imageList = [].concat(...image2DList);

    return (
        <Row className="width-full p1em">
            <Col span={9} className={""}>
                <ProductDescription/>
            </Col>
            <Col span={15}>
                <div className="non-artwork preview-container w-100 px-4 pr-0">
                    <div className="fullWidth mb-4">
                        <Banner
                            title="This product does not require artwork"
                            status="info"
                        >
                        </Banner>
                    </div>
                    {/*<div className={"preview-image-card"}>*/}
                    {/*<img src={abstract_product.preview_image_url} alt="" width={"100%"}/>*/}
                    {/*</div>*/}
                    <div className={"preview-image-card p-4"}>
                        <div className="w-100 d-flex flex-column position-relative">
                            <div
                                className={`arrow arrow-left ${imageList.length < 2 ? "d-none" : ""}`}
                                onClick={() => {
                                    carousel.current.prev()
                                }}
                            >
                                <Icon source={ChevronLeftMinor} color="indigoDark"/>
                            </div>
                            <div
                                className={`arrow arrow-right ${imageList.length < 2 ? "d-none" : ""}`}
                                onClick={() => {
                                    carousel.current.next()
                                }}
                            >
                                <Icon source={ChevronRightMinor} color="indigoDark"/>
                            </div>
                            <Carousel ref={carousel} autoplay={false} dots={false} arrows={false}>
                                {
                                    imageList.map((image, index) => (
                                        <img src={image} alt={image} key={index} width={DESIGN_SECTION_SQUARE_SIZE}/>
                                    ))
                                }
                            </Carousel>
                        </div>
                    </div>
                </div>
            </Col>
        </Row>
    )
}


export default PreviewArea
