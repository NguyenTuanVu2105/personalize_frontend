import React, {useContext, useEffect, useState} from 'react'
import {cancelOrder, getOrder, requestFulfill} from '../../../services/api/orders'
import './OrderDetail.scss'
import {Col, Empty, Modal, notification, Row} from 'antd'
import Paths from '../../../routes/Paths'
import UserPageContext from '../../userpage/context/UserPageContext'
import OrderInformation from './order-detail/OrderInformation'
import DocTitle from '../../shared/DocTitle'
import OrderPack from './order-detail/OrderPack'
import FulfillStatusTag from './share/FulfillStatusTag'
import FinancialStatusTag from './share/FinancialStatusTag'
import AppContext from '../../../AppContext'
import {DisplayText, TextContainer} from '@shopify/polaris'
import OrderHistory from './order-detail/order-history/OrderHistory'
import {DestructiveConfirmModal} from '../../shared/DestructiveConfirmModal'
import {ConfirmModal} from '../../shared/ConfirmModal'
import OrderSteps from "./order-detail/steps/OrderSteps"
import OrderTimeDelayNotice from "./orders/OrderTimeDelayNotice"
import {DISPLAY_TYPE} from "../constants"
import RechargeButton from "./share/RechargeButton"
import OrderDetailContext from "./order-detail/context/OrderDetailContext"
import AddOrderItemModal from "./order-detail/addItems/AddOrderItemModal"
import OrderFulfillmentTypeInfo from "./order-detail/OrderFulfillmentTypeInfo"


const OrderDetail = (props) => {
    const id = parseInt(props.match.params.id)
    const {setNameMap, setViewWidth, setDefaultViewWidth} = useContext(UserPageContext)
    const [order, setOrder] = useState(null)
    const [packs, setPacks] = useState([])
    const [userSettings, setUserSettings] = useState({})
    const {setLoading, reloadTrigger, triggerReloadPage} = useContext(AppContext)
    const [contextSelectedVariants, setContextSelectedVariants] = useState([])
    const [contextSelectedVariantIds, setContextSelectedVariantIds] = useState([])
    const {instantPrompts} = useContext(AppContext)

    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.Orders]: 'Orders',
            [Paths.OrderDetail(id)]: id,
        })
        setViewWidth(100)
        _fetchOrderById()
        return () => {
            setDefaultViewWidth()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.match.params.id, reloadTrigger])

    const _fetchOrderById = async () => {
        setLoading(true)
        const orderResp = await getOrder(id)

        const {success, data: orderResult, message} = orderResp

        if (!success) {
            Modal.error({
                content: message
            })
        }
        if (!orderResult) return

        setOrder(orderResult)
        setPacks(orderResult.packs)
        setUserSettings(orderResult.user_settings)

        let selectedVariants = []
        let selectedVariantIds = []
        orderResult.packs.forEach(pack => {
            pack.items.forEach(item => {
                selectedVariants.push({
                    user_product: item.variant.user_product_id,
                    user_variant: item.variant.id,
                    quantity: item.quantity,
                    title: item.variant.title
                })
                selectedVariantIds.push(item.variant.id.toString())
            })
        })
        // console.log(selectedVariants)
        // console.log(selectedVariantIds)
        setContextSelectedVariants(selectedVariants)
        setContextSelectedVariantIds(selectedVariantIds)

        // const selectedVariantIds

        setLoading(false)
    }

    const onConfirmCancel = async () => {
        let res = await cancelOrder(order.id)
        if (res.data.success) {
            notification.success({
                message: 'Cancel Order Success',
                description:
                    'Your request is succeeded',
            })
            triggerReloadPage()
        } else {
            notification.error({
                message: 'ERROR',
                description:
                    'Error',
            })
        }
    }

    const onConfirmFulfillRequest = async () => {
        let res = await requestFulfill(order.id)
        if (res.data.success) {
            notification.success({
                message: 'Success!',
                description:
                    'Your request to fulfill this order is sent successfully',
            })
            triggerReloadPage()
        } else {
            notification.error({
                message: 'ERROR',
                description:
                    'Error',
            })
        }
    }

    if (!order) {
        return <div/>
    }

    // const packsCanCancelShipping = order.packs
    //     .map((pack, index) => ({rawIndex: index, ...pack}))
    //     .filter(pack => pack.fulfill_status === 'in_production')
    //     .filter(pack => pack.cancel_shipping_requests.length === 0 || pack.cancel_shipping_requests.every(req => !['pending', 'approved'].includes(req.status)))

    const getTrackingInfos = () => {
        let result = []
        order.packs.forEach(pack => {
            pack.tracking_info.forEach(track => {
                result.push(track)
            })
        })
        return result
    }

    const isSampleOrder = order.shop && order.shop.ecommerce.name === "PrintHolo"

    return (
        <OrderDetailContext.Provider value={{
            contextSelectedVariants,
            contextSelectedVariantIds
        }}>
            <DocTitle title={`#${id} | Order Detail`}/>
            {instantPrompts && instantPrompts.includes('order_processing_time') && (
                <Row className="m-t-10">
                    <OrderTimeDelayNotice status={'info'} instantKey={'order_processing_time'}/>
                </Row>
            )}
            {order &&
            (<div className={'order-detail-page'}>
                <div className={'disable-props'}>
                    <div className="page-header">
                        <div className="flex-start">
                            <TextContainer spacing="tight">
                                <DisplayText element="h3" size="large">{'Order #' + order.id}</DisplayText>
                            </TextContainer>
                            &nbsp;&nbsp;
                            <span className="flex-center">
                                <FulfillStatusTag statusText={order.fulfill_status}/>
                                <span className={'ml-3'}/>
                                <FinancialStatusTag statusText={order.financial_status}
                                                    fulfill_status={order.fulfill_status}/>
                                {/*<span className={'ml-3'}/>*/}
                                {/*<CommonStatusTag progress={"complete"} status={"info"} text={"Auto fulfillment 30 minutes (20 minutes left)"}/>*/}
                            </span>

                            <div className="auto-m-l" style={{display: "flex"}}>
                                {
                                    order.financial_status === "failed" && (
                                        <RechargeButton displayType={DISPLAY_TYPE.DETAIL} orderId={id}
                                                        callback={_fetchOrderById}/>
                                    )
                                }
                                {order.can_request_fulfillment ? (
                                    <div className={"m-l-10"}>
                                        <ConfirmModal butttonType={"polaris"}
                                                      buttonText={"Request fulfillment"}
                                                      title={"Are you sure to request to fulfill this order?"}
                                                      content={"The order item and shipping plan will not be editable. This action can not be undone."}
                                                      primaryAction={{
                                                          content: 'Confirm',
                                                          onAction: onConfirmFulfillRequest,
                                                      }}
                                                      secondaryActionText={"Cancel"}
                                        />
                                    </div>) : ''}
                                {order.is_cancellable ? (
                                    <div className={"m-l-10"}>
                                        <DestructiveConfirmModal butttonType={"polaris"}
                                                                 buttonText={"Cancel order"}
                                                                 title={"Do you want to cancel this order?"}
                                                                 content={"This action cannot be undone"}
                                                                 primaryAction={{
                                                                     content: 'Confirm',
                                                                     onAction: onConfirmCancel,
                                                                     destructive: true
                                                                 }}
                                                                 secondaryActionText={"Cancel"}
                                        />
                                    </div>) : ''}
                                {/*{packsCanCancelShipping.length > 0 ?*/}
                                {/*    <div className={"m-l-20"}>*/}
                                {/*        <CancelShippingModal order={order} packs={packsCanCancelShipping}/>*/}
                                {/*    </div>*/}
                                {/*    : ''}*/}
                            </div>
                        </div>
                    </div>
                    <Row className="m-t-10">
                        <Col span={24} lg={16} className={'mt-3'}>
                            {
                                order.can_request_fulfillment && <OrderFulfillmentTypeInfo order={order} refresh={_fetchOrderById}/>
                            }
                            <OrderSteps
                                history={order.histories}
                                tracking_infos={getTrackingInfos()}
                            />
                            <div>
                                <div className={"mb-4 flex-start"}>
                                    <div>
                                        <DisplayText size="small"><b>Order items</b></DisplayText>
                                        <p>Items are split into packs for processing and shipping</p>
                                    </div>
                                    <div className={"auto-m-l"}>
                                        {
                                            order.is_item_addable && (
                                                <AddOrderItemModal orderId={id} reFreshFunction={_fetchOrderById}/>
                                            )
                                        }
                                    </div>
                                </div>
                                {
                                    packs.length > 0 && packs.map((pack, index) =>
                                        <OrderPack
                                            orderId={order.id}
                                            key={index}
                                            value={pack}
                                            index={index}
                                            refetch={_fetchOrderById}
                                            packs={packs}
                                            is_editable={order.is_item_editable}
                                            isSampleOrder={isSampleOrder}
                                        />
                                    )
                                }
                                {
                                    packs.length === 0 && (
                                        <div className={"flex-center"}>
                                            <Empty description={"No order pack available"}/>
                                        </div>
                                    )
                                }
                            </div>
                            <div className="d-none d-lg-block">
                                <OrderHistory history={order.histories}/>
                            </div>
                        </Col>
                        <Col span={24} lg={8} className="pl-lg-4 mt-3">
                            {
                                userSettings.edit_order_items_delay && (
                                    <OrderInformation refetch={_fetchOrderById}
                                                      order={order}
                                                      userSettings={userSettings}
                                                      isSampleOrder={isSampleOrder}/>
                                )
                            }
                            <div className="d-lg-none mt-5">
                                <OrderHistory history={order.histories}/>
                            </div>
                        </Col>

                    </Row>
                </div>
            </div>)
            }
        </OrderDetailContext.Provider>
    )

}

export default OrderDetail
