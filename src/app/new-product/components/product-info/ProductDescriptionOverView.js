import React, {useEffect, useRef, useState} from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faChevronLeft, faChevronRight, faInfoCircle, faMoneyCheckAlt} from "@fortawesome/free-solid-svg-icons"
import {Carousel} from "antd"
import {Heading} from "@shopify/polaris"
import SanitizeHTML from "../../../shared/SanitizeHTML"
import ShippingZoneInfo from "../choose-product/ShippingZoneInfo"
import {numberFormatCurrency} from "../../../shared/FormatNumber"

const ProductDescriptionOverView = ({productMeta, productAttributes}) => {
    const [selectedMockupIndex, setSelectedMockupIndex] = useState(0)
    const carousel = useRef()

    const mockupSamples = productMeta && productMeta.template_meta ? productMeta.template_meta.mockup_samples : []

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown, false);
        return () => {
            document.removeEventListener("keydown", handleKeyDown, false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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

    const onClickMockupThumbnail = (index) => {
        carousel.current.goTo(index, false)
        setSelectedMockupIndex(index)
    }

    const onClickLeftArrow = () => {
        carousel.current.prev()
    }

    const onClickRightArrow = () => {
        carousel.current.next()
    }

    const beforeChange = (from, to) => {
        setSelectedMockupIndex(to)
    }

    return (
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
                        <Carousel ref={carousel} autoplay={false} dots={true} arrows={false} beforeChange={beforeChange}>
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
                        mockupSamples && mockupSamples.map((mockup, index) => {
                            const isSelected = (index === selectedMockupIndex)
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
                <SanitizeHTML className={'mt-4'} html={productMeta.description}/>
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
                            {numberFormatCurrency(productMeta.base_cost)}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ProductDescriptionOverView