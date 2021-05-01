import React from 'react'
import CancelShippingRequestTag from './CancelShippingRequestTag'
import './OrderPack.scss'
import SummaryFulfillmentInfo from './SummaryFulfillmentInfo'
import FulfillmentItem from './FulfillmentItem'
import FulfillStatusTag from '../share/FulfillStatusTag'
import FinancialStatusTag from '../share/FinancialStatusTag'
import {Card, Heading} from '@shopify/polaris'
import TrackingStatusTag from '../share/TrackingStatusTag'
import {Popover, Typography} from 'antd'

const {Paragraph, Text} = Typography

const OrderPack = function (props) {

    let cancelShippingRequest = null
    const pack = props.value
    if (pack.cancel_shipping_requests.length > 0) {
        cancelShippingRequest = pack.cancel_shipping_requests.sort((r1, r2) => r2.update_time - r1.update_time)[0]
    }
    const isPackEditable = props.is_editable

    const contentActionCard = () => {
        if (cancelShippingRequest || pack.tracking_info.length > 0) {
            return [
                {
                    content: <div className="col-12 flex-end pr-0">
                        {cancelShippingRequest && (
                            <CancelShippingRequestTag request={cancelShippingRequest}/>
                        )}
                        {pack.tracking_info.length > 0 &&
                        (
                            <div style={{textAlign: "right"}}>
                                <div style={{fontWeight: 'bold', color: "black", paddingBottom: '5px'}}>Tracking</div>
                                {pack.tracking_info.map(tracking => (
                                    <>
                                        {tracking.tracking_number &&
                                        <Popover placement='top' content={(
                                            <div>
                                                {tracking.tracking_company !== 'Other' &&
                                                <Paragraph>
                                                    <Text strong>Carrier:</Text><br/>
                                                    <Text>{tracking.tracking_company}</Text>
                                                </Paragraph>
                                                }
                                                <Paragraph>
                                                    <Text strong>Tracking code:</Text><br/>
                                                    <Text copyable>{tracking.tracking_number}</Text>
                                                </Paragraph>

                                            </div>
                                        )}>
                                            <div className='pb-2'>
                                                {tracking.tracking_status !== 'unknown' &&
                                                <><TrackingStatusTag statusText={tracking.tracking_status}/>&nbsp;</>
                                                }
                                                <a href={tracking.tracking_url} target={"_blank"}
                                                   rel="noopener noreferrer">
                                                    {tracking.tracking_number}
                                                </a>
                                            </div>
                                        </Popover>}
                                    </>
                                ))}
                            </div>
                        )

                        }
                    </div>
                }
            ]
        } else {
            return
        }
    }

    //Sort items by id
    pack.items.sort((a, b) => a.id - b.id)

    return (
        <div className='order-pack-card'>
            <Card
                sectioned
                title={
                    <div className="flex-middle">
                        <Heading>Pack #{props.index + 1}</Heading>&nbsp;&nbsp;
                        <FulfillStatusTag statusText={pack.fulfill_status}/>&nbsp;&nbsp;
                        <FinancialStatusTag statusText={pack.financial_status}/>
                    </div>
                }
                actions={contentActionCard()}
            >
                <div className="row mx-0">
                    {pack.items.map(item => {
                        return item.quantity > 0 ? (
                            <FulfillmentItem
                                fulfillStatus={pack.fulfill_status}
                                item={item}
                                key={item.id}
                                refetch={props.refetch}
                                orderId={props.orderId}
                                packs={props.packs}
                                is_editable={isPackEditable}
                                isSampleOrder={props.isSampleOrder}
                            />
                        ) : <div/>
                    })}
                </div>
                <SummaryFulfillmentInfo pack={pack}/>
            </Card>
        </div>
    )
}

export default OrderPack
