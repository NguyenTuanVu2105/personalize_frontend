import React from 'react'
import {Banner, Button} from '@shopify/polaris'
import Paths from '../../../../../routes/Paths'
import {Link} from 'react-router-dom'

const BillingChargeFailedPrompt = () => {
    return (
        <div className={'m-b-20'}>
            <Banner title="Cannot process your payment" status="warning">
                <div className="p-b-10">
                    <p>We are unable to process payment. Please check your payment methods to continue fulfillment process</p>
                </div>

                <Link to={Paths.PaymentManager}>
                    <Button>
                        Manage billing methods
                    </Button>
                </Link>


            </Banner>
        </div>
    )
}
export default BillingChargeFailedPrompt
