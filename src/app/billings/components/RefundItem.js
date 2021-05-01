import {Avatar, Badge, Col, Row} from 'antd'
import React from 'react'
import Paths from '../../../routes/Paths'
import {numberFormatCurrency} from "../../shared/FormatNumber"

/*
const AttributeContainer = ({attribute_name, label, style, className, labelStyle}) => {
    return (
        <div style={style} className={className}>
            <div>
                <span style={{
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    fontSize: '.75em',
                    color: '#7d8c99'
                }}>{attribute_name}</span>
            </div>
            <div>
                <div>
                    <span style={labelStyle}>{label}</span>
                </div>
            </div>
        </div>
    )
}
 */

const RefundItem = ({item,currency}) => {
    let variant = item.variant
    let {attributes_value} = variant.abstract_variant
    let product_id = variant.user_product_id
    return (
        <div className={'billing-item-container'}>
            <Row>
                <Col span={2}>
                    <span style={{marginRight: 24}}>
                        <Badge count={item.quantity} showZero>
                            <Avatar shape="square" size={70} src={variant.mockup_per_side.length > 0 ? variant.mockup_per_side[0].mockup_url :
                                variant.preview_image_url} className={'border-avatar'}/>
                        </Badge>
                    </span>
                </Col>
                <Col span={22}>
                    <Row>
                        <Col span={24}>
                            <div>
                                <a href={Paths.ProductDetail(product_id)} className={'item-variant-title'}>{variant.title}</a>
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
                                <b>{item.quantity}</b>
                            </div>
                        </Col>
                        <Col span={8} className="text-right">
                            <span className="color-gray">
                                Production Cost
                            </span>
                            <br/>
                            <div className="flex-end item-price-info">
                                <b>-{numberFormatCurrency(item.production_cost, currency)} </b>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>

    )
}

export default RefundItem
