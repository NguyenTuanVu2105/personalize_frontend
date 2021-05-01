import React from 'react'
import PaymentMethodItem from './PaymentMethodItem'
import MastercardIcon from '../../../../assets/images/mastercard.svg'
import {stripeCharge} from '../../../../services/api/stripeCharge'
import {convert_to_smallest_unit} from '../../../../services/util/convertToSmallestUnit'
import Paths from '../../../../routes/Paths'
import {notification} from 'antd'

export default ({id, type, price, invoiceId, currency = 'usd', last4, exp}) => {
    const onCharge = async () => {
        const reqData = {
            'id': id,
            'type': type,
            'total_cost': parseInt(convert_to_smallest_unit(currency.toUpperCase(), price)),
            'currency': currency,
            'metadata': {
                'invoice_id': invoiceId
            }
        }
        const {success, data} = await stripeCharge(reqData)
        if (success && data.sussess) {
            notification.success({
                message: data.message
            })
        } else if (data.code === 'invalid') {
            window.location.href = Paths.AddStripeCardDetails() + `/?from=${invoiceId}`
        } else {
            notification.error({
                message: data.message
            })
        }
    }

    return (
        <div>
            <PaymentMethodItem icon={MastercardIcon} message={`**** **** **** ${last4}`} expiredDate={exp}
                               onClick={onCharge}/>
        </div>
    )
}
