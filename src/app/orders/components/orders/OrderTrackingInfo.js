import React from 'react'
import TrackingStatusTag from '../share/TrackingStatusTag'
import {Popover, Typography} from 'antd'

const {Paragraph, Text} = Typography

const OrderTrackingInfo = (props) => {
    const {orderMetadata, tracking} = props
    if (!orderMetadata || !orderMetadata.packs || orderMetadata.packs.length === 0) {
        return <div>
            Unshipped
        </div>
    }
    return <div>
        {orderMetadata.packs.map((pack, index) => (
            <Popover key={index} placement='leftTop' content={(
                <div>
                    <Paragraph>
                        <Text strong>Carrier:</Text><br/>
                        <Text>{pack.tracking_company}</Text>
                    </Paragraph>
                    <Paragraph>
                        <Text strong>Tracking code:</Text><br/>
                        <Text copyable>{pack.tracking_number}</Text>
                    </Paragraph>

                </div>
            )}>
                <div className="tracking-info-item">
                    {tracking ? <TrackingStatusTag statusText={'all_delivered'}/> : <TrackingStatusTag statusText={pack.tracking_status}/>}
                </div>
            </Popover>
        ))}
    </div>
}

export default OrderTrackingInfo
