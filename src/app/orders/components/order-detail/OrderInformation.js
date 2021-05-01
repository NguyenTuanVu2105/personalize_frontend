import React, {useState} from 'react'
import {withRouter} from 'react-router-dom'
import OrderInfoItem from './order-info/OrderInfoItem'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt'
import {formatDatetime} from '../../../../services/util/datetime'
import EditShippingModal from './EditShippingModal'
import {Badge, Card, Tag} from '@shopify/polaris'
import EditShippingPlanModal from './EditShippingPlanModal'
import "./OrderInformation.scss"
import {numberFormatCurrency} from "../../../shared/FormatNumber";
import {Icon, Input, notification} from "antd";
import {redeemCoupon, removeCoupon} from "../../../../services/api/orders";
import OrderCostItem from "./order-info/OrderCostItem";
import {DEFAULT_CURRENCY} from "../../../new-product/constants/constants"
import {convertCurrency} from "../../../pricing/helper/priceCalculate"
import BigNumber from "bignumber.js"

const {Search} = Input
const OrderInformation = function (props) {
    const {order, refetch, isSampleOrder} = props
    // const customer = order.customer_info
    const shipping_address = order.shipping_address
    const shipping_rate = order.shipping_rate
    const [code, setCode] = useState('')
    const [errors, setErrors] = useState([])
    const cardAction = order.order_number ? [
        {
            content: "View in Shop",
            icon: <FontAwesomeIcon style={{fontSize: '1.4rem'}} icon={faExternalLinkAlt}/>,
            url: `https://${order.shop.url}/admin/orders/${order.order_id}`,
            external: true
        }
    ] : []

    const onRemoveCoupon = async (coupon) => {
        const {data, success} = await removeCoupon(order.id, coupon)
        if (success) {
            if (data.success) {
                refetch()
            } else {
                notification['error']({
                    message: 'Cannot remove coupon',
                    description:
                        '',
                });
            }
        }
    }
    const handleApplyCoupon = async () => {
        const {data, success} = await redeemCoupon(order.id, code)
        if (success) {
            if (data.success) {
                setErrors([])
                refetch()
            } else {
                const errors = []
                Object.keys(data.errors).forEach(key => {
                    errors.push(data.errors[key])
                })
                setErrors(errors)
            }
        }
    }
    const renderCoupon = (order.is_coupon_editable &&
        <Search
            value={code}
            onChange={(e) => {
                setErrors([])
                setCode(e.target.value)
            }}
            style={{maxWidth: '300px'}}
            placeholder="Add a coupon"
            enterButton="Apply"
            size={'large'}
            onSearch={handleApplyCoupon}
        />)

    const currency = (order.packs[0] && order.packs[0].currency) || DEFAULT_CURRENCY.currency
    const storeCurrencyInfo = order.shop.currency_info

    const convertedTotalPrice = convertCurrency(order.total_price, storeCurrencyInfo.rate, DEFAULT_CURRENCY.rate, DEFAULT_CURRENCY.precision)
    const profit = new BigNumber(convertedTotalPrice).minus(new BigNumber(order.total_cost)).toNumber()

    const renderProfit = (profit) => {
        return (
            <b style={{color: profit >= 0 ? "#027706" : "#DE3618", fontSize: 18}}>
                {numberFormatCurrency(profit, DEFAULT_CURRENCY.currency)}
            </b>
        )
    }

    return (
        <div>
            <Card sectioned title={'Order information'} actions={cardAction}>
                <div>
                    <OrderInfoItem title="ID" value={`#${order.id}`}/>
                    <OrderInfoItem title="Order from" value={order.shop.ecommerce.name || "Unknown"}/>
                    {order.order_number &&
                    <OrderInfoItem title={order.shop.ecommerce.name + " number"} value={`#${order.order_number}`}/>}
                    {order.order_number && <OrderInfoItem title="Store" value={order.shop.url}/>}
                    <OrderInfoItem title="Create time" value={formatDatetime(order.create_time)}/>
                    <OrderInfoItem title="Last update" value={formatDatetime(order.update_time)}/>
                </div>
            </Card>
            <Card title={'Financial information'}>
                <Card.Section title={"Order cost"}>
                    <OrderCostItem title="Production cost" value={<b
                        style={{color: '#404040'}}>{order.production_cost > 0 ? numberFormatCurrency(parseFloat(order.production_cost), currency) : "N/A"}</b>}/>
                    <OrderCostItem title="Shipping cost" value={<b
                        style={{color: '#404040'}}>{Math.round(order.shipping_cost * 100) === 0 ? 'Free' : numberFormatCurrency(parseFloat(order.shipping_cost), currency)}</b>}/>
                    {parseFloat(order.discount) !== 0 &&
                    <OrderCostItem title="Discount" value={<b
                        style={{color: 'orange'}}> - {numberFormatCurrency(parseFloat(order.discount), currency)}</b>}/>}
                    {order['refund_amount'] !== 0 ?
                        <div>
                            <OrderCostItem title="Refund" value={<b
                                style={{color: 'orange'}}> - {numberFormatCurrency(order['refund_amount'], currency)}</b>}
                            />
                            <hr/>
                            <OrderCostItem title={(<b>Total cost</b>)} value={<b
                                style={{
                                    color: '#404040',
                                    fontSize: 18
                                }}>{numberFormatCurrency(parseFloat(order.total_cost) - order['refund_amount'], currency)}</b>}/>
                        </div>
                        : <div>
                            <hr/>
                            <OrderCostItem title={(<b>Total cost</b>)} value={<b
                                style={{
                                    color: '#404040',
                                    fontSize: 18
                                }}>{order.total_cost > 0 ? numberFormatCurrency(parseFloat(order.total_cost), currency) : "N/A"}</b>}/>
                        </div>}
                </Card.Section>
                {!isSampleOrder && false && (
                    <Card.Section title={"Profit"}>
                        <OrderCostItem title="Order price" value={<b
                            style={{color: '#404040'}}>{numberFormatCurrency(convertedTotalPrice, DEFAULT_CURRENCY.currency)}</b>}/>
                        <OrderCostItem title="Order cost" value={<b
                            style={{color: '#404040'}}>{numberFormatCurrency(parseFloat(order.total_cost), DEFAULT_CURRENCY.currency)}</b>}/>
                        <hr/>
                        <OrderCostItem title={(<b>Order profit</b>)} value={renderProfit(profit)}/>
                    </Card.Section>
                )}
            </Card>
            {false &&
            // {(order.is_coupon_editable || order.applied_coupons.length > 0) &&
            <Card sectioned title={'Voucher'}>
                <div className="d-flex">
                    <div className="mr-4 mt-3">Coupon:</div>
                    <div>
                        {renderCoupon}
                        {errors.length > 0
                        && (
                            <div className="mt-3" style={{color: 'red'}}>
                                {
                                    errors.map(error => (
                                        <div>
                                            <Icon type="exclamation-circle" theme="filled"/>
                                            &nbsp;
                                            {error}
                                        </div>
                                    ))
                                }
                            </div>
                        )
                        }
                        <div className={order.is_coupon_editable ? "mt-3" : "mt-2"}>
                            {
                                order.applied_coupons.map(coupon => (
                                    // <div style={{fontSize: '14px', fontWeight: 800}}>{coupon.code}</div>
                                    <Tag
                                        onRemove={order.is_edit_coupon ? () => onRemoveCoupon(coupon.code) : null}><b>{coupon.code}</b></Tag>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </Card>
            }
            {/*{customer && <Card sectioned title={'Customer'} actions={[*/}
            {/*    {*/}
            {/*        content: "View in Shop",*/}
            {/*        icon: <FontAwesomeIcon style={{fontSize: '1.4rem'}} icon={faExternalLinkAlt}/>,*/}
            {/*        url: `https://${order.shop.url}/admin/customers/${customer.customer_id}`,*/}
            {/*        external: true*/}
            {/*    }*/}
            {/*]}>*/}
            {/*    <div>*/}
            {/*        <OrderInfoItem title="First Name" value={customer.first_name || ''}/>*/}
            {/*        <OrderInfoItem title="Last Name" value={customer.last_name || ''}/>*/}
            {/*        <OrderInfoItem title="Email" value={customer.email || 'No email'}/>*/}
            {/*        <OrderInfoItem title="Phone" value={customer.phone || 'No phone'}/>*/}
            {/*    </div>*/}
            {/*</Card>}*/}
            {shipping_address && (
                <Card>
                    <Card.Header title={'Shipping information'}>
                    </Card.Header>
                    <Card.Section title={'Shipping address'} actions={[
                        {
                            content: <EditShippingModal
                                // visible={order.fulfill_status === "unfulfilled" || order.fulfill_status === "pending"}
                                visible={order.is_shipping_address_editable}
                                cityEditable={order.is_shipping_city_editable}
                                address={shipping_address}
                                id={order.id}
                                refetch={props.refetch}
                            />,
                        }
                    ]}>
                        <OrderInfoItem title="Name" value={shipping_address.name || '---'}/>
                        <OrderInfoItem title="Phone" value={shipping_address.phone || '---'}/>
                        <OrderInfoItem title="Address 1" value={shipping_address.address1 || '---'}/>
                        <OrderInfoItem title="Address 2" value={shipping_address.address2 || '---'}/>
                        <OrderInfoItem title="City" value={shipping_address.city || '---'}/>
                        <OrderInfoItem title="Province" value={shipping_address.province || '---'}/>
                        <OrderInfoItem title="Country" value={shipping_address.country || '---'}/>
                        <OrderInfoItem title="Zip Code" value={shipping_address.zip || '---'}/>
                    </Card.Section>
                    {shipping_rate && (
                        <Card.Section title={'Shipping plan'} actions={[
                            {
                                content: <EditShippingPlanModal
                                    visible={order.is_shipping_rate_editable}
                                    // visible={order.fulfill_status === "unfulfilled" || order.fulfill_status === "pending"}
                                    shipping={shipping_rate}
                                    id={order.id}
                                    refetch={props.refetch}
                                />
                            }]}>
                            <div className="space-between">
                <span style={{fontSize: '14px', lineHeight: '28px'}}>
                <span style={{fontWeight: 400}}>Plan</span>:
                    &nbsp;
                    <span className="shipping-badge">
                <Badge status={"info"}>{shipping_rate.name || ''}</Badge>
                </span>
                </span>
                            </div>
                            {/*<OrderInfoItem title="Plan" value={shipping_rate.name || ''}/>*/}
                        </Card.Section>)}
                </Card>)}
            {order.note && <Card sectioned title={'Customer note'} actions={[]}>
                <div>
                    {order.note}
                </div>
            </Card>}
        </div>
    )
}

export default withRouter(OrderInformation)
