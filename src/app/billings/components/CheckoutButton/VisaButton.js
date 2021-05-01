import React from 'react'
import PaymentMethodItem from './PaymentMethodItem'
import VisaIcon from '../../../../assets/images/visa.svg'
import {stripeCharge} from '../../../../services/api/stripeCharge'
import Paths from '../../../../routes/Paths'
import {convert_to_smallest_unit} from '../../../../services/util/convertToSmallestUnit'
import {notification} from 'antd'

export default ({id, type, price, invoiceId, currency = 'usd', exp, last4}) => {
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
        if (success && data.success) {
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
            <PaymentMethodItem icon={VisaIcon} message={`**** **** **** ${last4}`} expiredDate={exp}
                               onClick={onCharge}/>
        </div>
    )
}
