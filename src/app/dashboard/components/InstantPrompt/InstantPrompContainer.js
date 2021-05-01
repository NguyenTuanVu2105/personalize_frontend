import React, {useContext} from 'react'
import AppContext from '../../../../AppContext'
import AddShopPrompt from './Prompts/AddShopPrompt'
import AddPaymentMethodPrompt from './Prompts/AddPaymentMethodPrompt'
import BillingChargeFailedPrompt from './Prompts/BillingChargeFailedPrompt'
import OrderTimeDelayNotice from "../../../orders/components/orders/OrderTimeDelayNotice"


const INSTANT_PROMPTS = {
    'add_shop': <AddShopPrompt key={'add_shop'}/>,
    'add_payment_method': <AddPaymentMethodPrompt key={'add_payment_method'}/>,
    'billing_charge_failed': <BillingChargeFailedPrompt key={'billing_charge_failed'}/>,
    'order_processing_time': <OrderTimeDelayNotice key={'order_processing_time'} status={'info'} instantKey={'order_processing_time'}/>
}

const InstantPromptContainer = (props) => {
    const {instantPrompts} = useContext(AppContext)
    
    return (
        (!instantPrompts && instantPrompts.length === 0)
            ? (<div/>)
            : (
                <div>
                    {instantPrompts.map(prompt => INSTANT_PROMPTS[prompt])}
                </div>
            )
    )

}
export default InstantPromptContainer
