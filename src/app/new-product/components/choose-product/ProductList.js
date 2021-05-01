import React, {useContext, useEffect, useState} from 'react'
import {Card, Icon, List, Popover, Skeleton, Tag} from 'antd'
import {useHistory} from "react-router-dom"
import './ProductList.scss'
import {DEFAULT_CURRENCY} from '../../constants/constants'
import {numberFormatCurrency} from '../../../shared/FormatNumber'
import ShippingZoneInfo from './ShippingZoneInfo'
import {isInFrame} from "../../../../services/util/windowUtil"
import NewProductContext from "../../context/NewProductContext"
import Paths from "../../../../routes/Paths"
import {Button} from "@shopify/polaris"
import ProductInfo from "../product-info/ProductInfo"

const ProductList = (props) => {
    const backgroundProductUrl = "https://storage.googleapis.com/printholo/event/catalog_background_2.png"
    const {products, onClickProduct} = props
    const [minHeight, setMinHeight] = useState(330)
    const {productionStatistic, hasContainer} = useContext(NewProductContext)
    const [currentProductView, setCurrentProductView] = useState(null)
    const history = useHistory()
    const handleClickProduct = (id) => {
        onClickProduct(id)
        if (hasContainer === true) {
            history.push(Paths.NewProduct)
        }
    }

    const content = (product) => {
        const statistic = productionStatistic.find(item => item.sku && item.production_time_default > 0.0 && item.sku.includes(product.sku))
        return (
            <div style={{width: '250px'}}>
                <p style={{fontSize: '20px', marginBottom: '5px'}}>{product.title}</p>
                <p style={{marginBottom: '7px'}}><span
                    className='textBold'>Base cost:</span> {numberFormatCurrency(product.meta.base_cost, DEFAULT_CURRENCY.currency)}
                </p>
                {product.child_attributes.map(att => {
                    if (att.name === 'Color') {
                        return <ul key={att.name} className="attributes-selection-preview"
                                   style={{marginBottom: '7px'}}>
                            {att.child_attributes_value_set.map((v, index) => (
                                <li key={index} className="attribute-item"><Tag style={{margin: '0 2px'}}
                                                                                color={v.value}
                                                                                className='attribute-color'/></li>
                            ))}
                        </ul>
                    } else {
                        const attribute = att.child_attributes_value_set
                        attribute.sort((att1, att2) => att1.sort_index - att2.sort_index)
                        return (<div key={att.name} style={{marginBottom: '7px'}}>
                                {
                                    attribute.map((v, index) => (
                                        index < attribute.length - 1 ?
                                            <span key={index} className='textBold'>{v.label} - </span>
                                            : <span key={index} className='textBold'
                                                    style={{margin: '0 3px'}}>{v.label}</span>
                                    ))
                                }
                            </div>
                        )
                    }
                })}
                <div style={{marginBottom: '7px', whiteSpace: 'pre-line'}}>
                    <p className='textBold'>Description: </p>
                    {product.meta.short_description}
                </div>
                <p><span className='textBold'>
                    {statistic ? "Average" : "Estimate"} processing time: </span>
                    {statistic ? parseFloat(statistic.production_time_default) + " business days" : product.meta.shipping_meta.progressing_range}
                </p>
                <p><span className='textBold'>Estimate shipping time: </span>{product.meta.shipping_meta.shipping_range}
                </p>
            </div>
        )
    }

    const getMinHeight = () => {
        const element = document.querySelector(".product-image-container")
        if (element) {
            setMinHeight(element.offsetWidth * 3 / 2)
        }
    }


    useEffect(() => {
        getMinHeight()
        window.addEventListener("resize", getMinHeight)
    }, [])


    useEffect(() => {
        getMinHeight()
    }, [products])

    return (

        <div className="product-list-container full-height" id="listProduct">
            <div id="topList"/>
            <List
                grid={{
                    gutter: 20,
                    xs: 1,
                    sm: 2,
                    md: 3,
                    lg: 3,
                    xl: isInFrame() ? 3 : 4,
                    xxl: 6,
                }}
                className="product-list-ant"
                itemLayout={"horizontal"}
                dataSource={products}
                renderItem={product => {
                    return (
                        <List.Item key={product.id} id={product.sku}>
                            {
                                product.meta
                                    ? (
                                        <Card
                                            // hoverable
                                            // onClick={() => {
                                            //     setCurrentProductView({id: product.id, title: product.title})
                                            // }}
                                            loading={!product.title}
                                            cover={product.preview_image_url &&
                                            <div className={'product-image-container'}>
                                                <div className='icon-info' onClick={(event) => {
                                                    event.stopPropagation()
                                                }}>
                                                    <Popover placement='leftTop' content={content(product)}>
                                                        <Icon style={{fontSize: '2rem'}} type="info-circle"/>
                                                    </Popover>
                                                </div>
                                                {product.categories.some(category => category.title === 'Popular') ?
                                                    <span className='border-trending'>Popular&nbsp;<span
                                                        style={{fontSize: '1.7rem'}}>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    aria-hidden="true"
                                                    focusable="false" data-prefix="fas"
                                                    data-icon="chart-line"
                                                    className="svg-inline--fa fa-chart-line fa-w-16"
                                                    role="img" viewBox="0 0 512 512">
                                                <path fill='white'
                                                      d="M432.4,142H309.1c-22.3,0-33.5,27-17.7,42.8l33.8,33.8l-76.6,76.7l-76.6-76.6c-13.1-13.1-34.2-13.1-47.3,0  l-71.8,71.8c-6.5,6.5-6.5,17.1,0,23.6l23.6,23.6c6.5,6.5,17.1,6.5,23.6,0l48.1-48.1l76.6,76.6c13.1,13.1,34.2,13.1,47.3,0  l100.3-100.3l33.8,33.8c15.8,15.8,42.8,4.6,42.8-17.7V158.7C449.1,149.5,441.7,142,432.4,142z"/>
                                                </svg> </span></span> : <div/>
                                                }
                                                <img style={{
                                                    backgroundImage: "url(" + backgroundProductUrl + ")",
                                                    backgroundSize: 'cover',
                                                    width: '100%',
                                                    minHeight: minHeight
                                                }}
                                                     className="preview-product-card-image"
                                                     alt={`product_thumb_${product.id}`}
                                                     src={product.preview_image_url}/>
                                                <div className={"product-sku"}>
                                                    {product.sku}
                                                </div>
                                            </div>
                                            }
                                        >
                                            <Card.Meta
                                                title={(
                                                    <span className={"card-meta-product-name"}>{product.title}</span>
                                                )}
                                                description={
                                                    <div style={{marginTop: '-5px', fontSize: '13px'}}>
                                                        <div className="flex-middle">
                                                        <span className="card-meta-basecost">
                                                            {numberFormatCurrency(product.meta.base_cost)}
                                                        </span>&nbsp;&nbsp;
                                                            <ShippingZoneInfo
                                                                shippingZones={product.meta.shipping_meta.shipping_zones}/>
                                                        </div>
                                                        <div
                                                            className="d-flex flex-space-between mt-2 pt-2"
                                                            onClick={(event) => {
                                                                event.stopPropagation()
                                                            }}
                                                        >
                                                            <div className="mr-2" style={{width: "100%"}}>
                                                                <Button
                                                                    size={"slim"}
                                                                    onClick={() => {
                                                                        setCurrentProductView({
                                                                            id: product.id,
                                                                            title: product.title
                                                                        })
                                                                    }}
                                                                    fullWidth={true}
                                                                >
                                                                    Info
                                                                </Button>
                                                            </div>
                                                            <div className="ml-2" style={{width: "100%"}}>
                                                                <Button
                                                                    id={`btn-create-${product.sku.toLowerCase()}`}
                                                                    size={"slim"}
                                                                    primary={true}
                                                                    fullWidth={true}
                                                                    onClick={() => handleClickProduct(product.id)}
                                                                >
                                                                    Create
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </Card>
                                    ) :
                                    (
                                        <div style={{height: '300px', padding: '10px', backgroundColor: 'white'}}>
                                            <Skeleton active/>
                                        </div>
                                    )
                            }
                        </List.Item>
                    )
                }}
                    />
                {
                    currentProductView
                    && <ProductInfo
                    productID={currentProductView.id}
                    productTitle={currentProductView.title}
                    handleDesign={() => handleClickProduct(currentProductView.id)}
                    handleClose={() => {
                    setCurrentProductView(null)
                }}
                    productionStatistic={productionStatistic}
                    />
                }

                    </div>
                    )
                }

export default ProductList
