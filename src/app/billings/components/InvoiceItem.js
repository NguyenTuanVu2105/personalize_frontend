import {Avatar, Badge, Col, Row} from 'antd'
import React from 'react'
import {formatPrice} from '../../../services/util/string'
import Paths from '../../../routes/Paths'

import {numberFormatCurrency} from "../../shared/FormatNumber"
import CommonStatusTag from "../../shared/CommonStatusTag"
import {Link, withRouter} from "react-router-dom"


const  InvoiceItem =  ({invoiceItem}) => {
    let {order_item, quantity, price, currency} = invoiceItem
    let {variant} = order_item
    let {attributes_value} = variant.abstract_variant
    let product_id = invoiceItem.order_item.variant.user_product_id
    price = formatPrice(parseFloat(price))
    const isRejected = order_item.fulfill_status === 'rejected'
    return (
        <div className={`billing-item-container billing-item-container-${order_item.fulfill_status}`}>
            <div className="d-flex align-items-start">
                <div>
                    <Badge count={quantity} showZero>
                        <Avatar shape="square" size={70} src={variant.mockup_per_side.length > 0 ? variant.mockup_per_side[0].mockup_url :
                            variant.preview_image_url} className={'border-avatar'}/>
                    </Badge>
                </div>
                <div className="p-l-30 w-100 flex-column align-items-start">
                    <Row>
                        <Col span={24}>
                            <div>
                                <Link to={Paths.ProductDetail(product_id)} className={'item-variant-title'}>{variant.title}</Link>
                                {isRejected && (<CommonStatusTag status='attention' text="Refunded" progress='complete' tooltip="Item is refunded" />)}
                            </div>
                        </Col>
                    </Row>
                    <Row className={'m-t-15 pr-20'}>
                        <Col span={10}>
                            <span className="item-sku-info">{attributes_value.map(a => a.label).join(' / ')}</span>
                            <br/>
                            <span className="item-sku-info">SKU: {variant.sku}</span>
                        </Col>
                        <Col span={6} className={'text-right'}>
                            <span className="color-gray">
                                Quantity
                            </span>
                            <br/>
                            <div className=" item-price-info">
                                <b>{quantity}</b>
                            </div>
                        </Col>
                        <Col span={8} className="text-right">
                            <span className="color-gray">
                                Production Cost
                            </span>
                            <br/>
                            <div className="flex-end item-price-info">
                                <b>{numberFormatCurrency(price, currency)} </b>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>

    )
}

export default withRouter(InvoiceItem)