import React from 'react'
import BillingAddressContainer from './BillingAddressContainer'
import CheckoutContainer from './CheckoutContainer'
import {Card} from '@shopify/polaris'

export default ({invoiceId, customerInfo, status, totalCost, paidTime, payment_method, refunds}) => {
    return (
        <div className={'mt-4'}>
            <Card>
                <Card.Header title={'Customer Infomation'}/>
                <BillingAddressContainer customerInfo={customerInfo}/>
                <CheckoutContainer invoiceId={invoiceId} status={status} totalCost={totalCost} paidTime={paidTime}
                                   payment_method={payment_method}/>
            </Card>
        </div>
    )
}
