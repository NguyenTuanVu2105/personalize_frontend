import React from 'react'
import {formatPrice} from '../../../services/util/string'
import {formatDatetime} from '../../../services/util/datetime'
import {Card} from '@shopify/polaris'

const RefundInfoItem = ({label, id, update_time, amount}) => {
    return (
        <Card.Section title={label} actions={[
            {
                content: <b style={{color: "#006fbb"}}>{amount}</b>,
                disabled: true

            }
        ]}>
            <div style={{color: '#637381', display: "flex", justifyContent: "space-between"}}>
                <span>#{id}</span>
                <span>{update_time}</span>
            </div>

        </Card.Section>
    )
}

export default ({refunds}) => {
    if (refunds.length > 0) {
        return (
            <Card>
                <Card.Header title={'Refunds'}>
                </Card.Header>
                {refunds.reverse().map((refund, i) => {
                    const {id, amount, currency, status, update_time, description} = refund
                    return <RefundInfoItem key={id} label={description}
                                           id={id}
                                           update_time={formatDatetime(update_time)}
                                           amount={`${formatPrice(parseFloat(amount))} ${currency}`}
                                           status={status} textBold={true}/>
                })}

            </Card>
        )
    } else {
        return null
    }

}
