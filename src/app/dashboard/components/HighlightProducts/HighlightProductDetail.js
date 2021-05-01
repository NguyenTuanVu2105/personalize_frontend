import React, {useEffect, useRef, useState} from 'react'
import './HighlightProductDetail.scss'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {
    faChevronLeft,
    faChevronRight,
    faInfoCircle,
    faMoneyCheckAlt,
    faShippingFast
} from "@fortawesome/free-solid-svg-icons"
import {Heading, Modal} from "@shopify/polaris"
import {numberFormatCurrency} from "../../../shared/FormatNumber"
import {Carousel} from "antd"
import SanitizeHTML from "../../../shared/SanitizeHTML"
import ShippingZoneInfo from "../../../new-product/components/choose-product/ShippingZoneInfo"
import _ from "lodash"
import Paths from "../../../../routes/Paths"
import {useHistory} from "react-router-dom"
import {getDetailCost} from "../../../../services/api/products"
import {getShippingCostDetail} from "../../../../shared/setCostDetail"
import ShippingCostTable from "../../../pricing/ShippingCostTable"
import ShippingTimeTable from "../../../new-product/components/product-info/ShippingTimeTable"
import {getProductStatistic} from "../../../../services/api/productStatistic"
import BigNumber from "bignumber.js"


const HighlightProductDetail = ({productId, productDetail, detailModalVisible, setDetailModalVisible}) => {
    const {abstract_meta: productMeta, attributes: productAttributes, detail_data: detailData, abstract_sku} = productDetail
    const [selectedMockupIndex, setSelectedMockupIndex] = useState(0)
    const [shippingCost, setShippingCost] = useState([])
    const [productionStatistic, setProductionStatistic] = useState([])

    const history = useHistory()

    const carousel = useRef()

    const handleOpen = () => setDetailModalVisible(true)

    const handleClose = () => setDetailModalVisible(false)

    useEffect(() => {
        // setSelectedMockupIndex(0)
    }, [productMeta])

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown, false);
        fetchCost().then()
        getStatistic().then()

        return () => {
            document.removeEventListener("keydown", handleKeyDown, false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleKeyDown = (e) => {
        e.stopPropagation()
        const nextArrow = document.querySelector(".mockup-sample-container .arrow.arrow-right")
        const backArrow = document.querySelector(".mockup-sample-container .arrow.arrow-left")
        const productInfoDetailSection = document.querySelector(".product-info-detail-section")

        if (productInfoDetailSection) {
            if (e.keyCode === 37) {
                if (backArrow) {
                    backArrow.click()
                }
            } else if (e.keyCode === 39) {
                if (nextArrow) {
                    nextArrow.click()
                }
            }
        }

    }

    const processShippingComponent = () => {
        const dataSources = productMeta.shipping_meta.shipping_zones.map((shipping_zone, index) => {
            const statistic = productionStatistic.find(item => item.sku && item.production_time_default > 0.0 && item.sku.includes(abstract_sku))
            if (statistic && statistic.production_time_default) {
                return {...shipping_zone, id: index, avg_progressing_range: statistic.production_time_default}
            } else {
                return {...shipping_zone, id: index}
            }
        })

        return (
            <div>
                <div className="flex-center-vertical mb-4">
                    <FontAwesomeIcon icon={faShippingFast} className={'heading-icon'}/> &nbsp;
                    <Heading>Processing and shipping</Heading>
                </div>
                <p className={"mb-4"}>We will take about {productMeta.shipping_meta.processing_time} to create and print
                    your products.
                    Then they will be shipped to your buyers as soon as possible. The production and shipping time
                    depends on the product type and buyer shipping area.
                    In the table below you can see the production and shipping time that we estimate for each supported
                    country/region.</p>
                <ShippingTimeTable dataSources={dataSources}/>
                <ShippingCostTable shippingDetail={shippingCost}/>
            </div>
        )
    }


    const handleMockup = () => {
        const mockupSamples = []
        detailData.user_variant_data.map(variant => {
            return variant.user_variant_side_mockup_data.map(mockup => {
                return mockupSamples.push({url: mockup.mockup_url})
            })
        })
        return _.uniqBy(mockupSamples, 'url');

    }

    const mockupSamples = handleMockup()
    // const mockupSamples = productMeta.template_meta.mockup_samples

    const onClickMockupThumbnail = (index) => {
        carousel.current.goTo(index, false)
        setSelectedMockupIndex(index)
    }

    const onClickLeftArrow = () => {
        carousel.current.prev()
        if (selectedMockupIndex > 0) {
            setSelectedMockupIndex(selectedMockupIndex - 1)
        } else setSelectedMockupIndex(mockupSamples.length - 1)
    }

    const onClickRightArrow = () => {
        carousel.current.next()
        if (selectedMockupIndex < mockupSamples.length - 1) {
            setSelectedMockupIndex(selectedMockupIndex + 1)
        } else setSelectedMockupIndex(0)

    }

    const fetchCost = async () => {
        const response = await getDetailCost(productMeta.abstract_product)
        if (response.success) {
            const shippingCosts = response.data.costs
            const shippingZones = response.data.shipping_zones
            const shippingRates = response.data.shipping_rates
            const result = getShippingCostDetail(shippingCosts, shippingZones, shippingRates)
            setShippingCost(result)
        }
    }

    const getStatistic = async () => {
        const {success, data} = await getProductStatistic()
        if (success) {
            if (data) {
                setProductionStatistic(data)
            }
        }
    }

    return (
        <div className={'product-info-modal-container mb-4'}>
            <div className={'product-info-button w-100 px-4 py-4 font-weight-bold'} onClick={handleOpen}>
                <FontAwesomeIcon icon={faInfoCircle}
                                 color="#3793fa"/>&nbsp; Product info
            </div>
            <div className={'product-info-modal'}>
                <Modal open={detailModalVisible}
                       onClose={handleClose}
                       title={detailData.title}
                       primaryAction={{
                           content: 'Customize this product',
                           onAction: () => history.push(Paths.CustomizeSampleProduct(productId))
                       }}
                       secondaryActions={[{
                           content: 'Close',
                           onAction: handleClose
                       }]}
                       large
                >
                    <Modal.Section>
                        <div className="row mx-0 product-info-detail-section">
                            <div className="col-lg-6">
                                <div className="row mockup-sample-container">
                                    <div className="w-100 d-flex flex-column position-relative">
                                        <div
                                            className={`arrow arrow-left ${mockupSamples.length < 2 ? "d-none" : ""}`}
                                            onClick={onClickLeftArrow}
                                        >
                                            <FontAwesomeIcon icon={faChevronLeft}/>
                                        </div>
                                        <div
                                            className={`arrow arrow-right ${mockupSamples.length < 2 ? "d-none" : ""}`}
                                            onClick={onClickRightArrow}
                                        >
                                            <FontAwesomeIcon icon={faChevronRight}/>
                                        </div>
                                        <Carousel ref={carousel} autoplay={false} dots={false} arrows={false}>
                                            {
                                                mockupSamples.map((image, index) => (
                                                    <img src={image.url} alt={image} key={index}/>
                                                ))
                                            }
                                        </Carousel>
                                    </div>
                                </div>
                                <div className="row flex-center mt-3">
                                    {
                                        mockupSamples.map((mockup, index) => {
                                            const isSelected = index === selectedMockupIndex
                                            return (
                                                <div
                                                    className={isSelected ? 'mockup-thumbnail mockup-active' : 'mockup-thumbnail'}
                                                    key={index}
                                                    onClick={() => onClickMockupThumbnail(index)}>
                                                    <img src={mockup.url} alt="" width={80}/>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            <div className="col-lg-6 pl-5">
                                <div className="flex-center-vertical mb-4">
                                    <FontAwesomeIcon icon={faInfoCircle} className={'heading-icon'}/> &nbsp;
                                    <Heading>Product details</Heading>
                                </div>
                                <div className={'attribute-section mt-2'}>
                                    <p className={'font-weight-bold'}>Attributes</p>
                                    <ul className={'mt-1'}>
                                        {
                                            productAttributes.map((attribute, index) => {
                                                const attributeValueList = attribute.child_attributes_value_set.map(value => value.label)
                                                return (
                                                    <li key={index}>
                                                        <span>
                                                            <em className={'font-weight-bold'}>{attribute.name}</em>: {attributeValueList.join(" - ")}
                                                        </span>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                                <SanitizeHTML className={'mt-4'} html={detailData.description}/>
                                <hr className={'w-100'}/>

                                <div className="flex-center-vertical my-4">
                                    <FontAwesomeIcon icon={faMoneyCheckAlt} className={'heading-icon'}/> &nbsp;
                                    <Heading>Product pricing</Heading>
                                </div>
                                <div className={'row mt-3'}>
                                    <div className="col-6">
                                        <ShippingZoneInfo
                                            shippingZones={productMeta.shipping_meta.shipping_zones} iconSize={34}/>
                                    </div>
                                    <div className="col-6" style={{display: 'inline-flex', padding: '10px'}}>
                                        <em className={'meta-basecost-caption'}
                                            style={{paddingRight: '10px', fontSize: '14px'}}>Starting from</em>
                                        <div className="meta-basecost">
                                            {numberFormatCurrency(BigNumber(productMeta.base_cost).toNumber() + BigNumber(detailData.extra_cost).toNumber())}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Section>
                    <div className={'product-info-tab-section'}>
                        <Modal.Section>
                            {processShippingComponent()}
                        </Modal.Section>
                    </div>
                </Modal>
            </div>
        </div>
    )
}

export default HighlightProductDetail
