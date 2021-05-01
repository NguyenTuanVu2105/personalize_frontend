import {Avatar, Badge, Typography} from 'antd'
import {numberFormatCurrency} from '../../../shared/FormatNumber'
import React from 'react'
import EditItemModal from './EditItemModal'
import {Link} from 'react-router-dom'
import Paths from '../../../../routes/Paths'
import CommonStatusTag from '../../../shared/CommonStatusTag'

const {Text} = Typography

const FulfillmentItem = (props) => {

    let imgUrl = ''

    const {item, refetch, orderId, packs, is_editable, isSampleOrder} = props

    // console.log(item, fulfillStatus)
    imgUrl = item.variant.mockup_per_side.length > 0 ?
        item.variant.mockup_per_side[0].mockup_url : item.variant.preview_image_url
    const attributes = item.variant.abstract_variant.attributes_value

    const isRejected = item.fulfill_status === 'rejected'

    return (
        <div className={`order-item-container order-item-container-${item.fulfill_status}`}>
            <div className="d-flex align-items-start">
                <div>
                    <Badge count={item.quantity} showZero>
                        <Avatar shape="square" size={70} src={imgUrl} className={`border-avatar`}/>
                        <EditItemModal
                            orderId={orderId}
                            item={item}
                            visible={is_editable}
                            refetch={refetch}
                            packs={packs}
                        />
                    </Badge>
                </div>
                <div className="p-l-30 w-100 flex-column align-items-start">
                    <div className={'row'}>
                        <div className={'col-12'}>
                            <Text className={`item-variant-title width-full ${item.fulfill_status}`} ellipsis>
                                <Link
                                    to={Paths.ProductDetail(item.variant.user_product_id)}
                                    rel="noopener noreferrer">
                                    <span className="item-variant-title-text">{item.variant.title}</span>&nbsp;
                                </Link>
                                {isRejected && (<CommonStatusTag status='warning' text="Rejected" progress='complete'
                                                                 tooltip="Item is rejected. Refund has been returned to your payment"/>)}
                            </Text>
                        </div>
                    </div>
                    <div className="row item-detail">
                        <div className="col-3">
                            <span className="item-sku-info">{attributes.map(a => a.label).join(' / ')}</span>
                            <br/>
                            <span className="item-sku-info">SKU:&nbsp;{item.variant.sku}</span>
                        </div>
                        {
                            !isSampleOrder && (
                                <div className="col-2 text-right" style={{borderRight: 'dashed 1px gray'}}>
                                    <span className="color-gray">
                                        Retail Price
                                    </span>
                                    <br/>
                                    <div className="flex-end item-price-info">
                                        <b>{numberFormatCurrency(parseFloat(item.price), item.currency)}</b>
                                    </div>
                                </div>
                            )
                        }
                        {
                            isSampleOrder && (
                                <div className="col-2"/>
                            )
                        }
                        <div className="col-2 text-right">
                            <span className="color-gray">
                                Cost per item
                            </span>
                            <br/>
                            <div className="flex-end item-price-info">
                                <b>{item.base_cost > 0 ? numberFormatCurrency(parseFloat(item.base_cost) + parseFloat(item.extra_cost), 'USD') : "N/A"}</b>
                            </div>
                        </div>
                        <div className="col-2 text-right">
                            <span className="color-gray">
                                Quantity
                            </span>
                            <br/>
                            <div className="flex-end item-price-info">
                                <b>x {item.quantity}</b>
                            </div>
                        </div>

                        <div className="col-3 text-right">
                            <span className="color-gray">
                                Production Cost
                            </span>
                            <br/>
                            <div className="flex-end item-price-info">
                                <b>{item.production_cost > 0 ? numberFormatCurrency(item.production_cost, 'USD') : "N/A"} </b>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default FulfillmentItem
