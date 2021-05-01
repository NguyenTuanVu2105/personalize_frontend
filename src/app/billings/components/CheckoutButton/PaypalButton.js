import PaypalIcon from '../../../../assets/images/paypal_new.svg'
import React from 'react'
import PaymentMethodItem from './PaymentMethodItem'
import {appendPaypalCheckoutForm, PAYPAL_FORM_CONTAINER_DOM_ID} from './PaypalForm'
import {waitForElement} from '../../../../services/util/dom'

export default ({invoiceId}) => {
    const onClick = () => {
        waitForElement(PAYPAL_FORM_CONTAINER_DOM_ID, (paypalFormContainerNode) => {
            let paypalFormNode = paypalFormContainerNode.childNodes[0]
            paypalFormNode.submit()
        })
    }
    appendPaypalCheckoutForm(invoiceId)
    return (
        <div>
            <PaymentMethodItem icon={PaypalIcon} iconSize={35} message={'Express Checkout'}
                               expiredDate={''} onClick={onClick}/>
        </div>
    )
}
