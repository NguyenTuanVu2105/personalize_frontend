import React, {useContext, useState} from 'react'
import {Banner, Button} from '@shopify/polaris'
import Paths from '../../../../routes/Paths'
import {Link} from 'react-router-dom'
import {ignoreInstantPrompt} from "../../../../services/api/instantPrompt"
import AppContext from "../../../../AppContext"

const OrderTimeDelayNotice = ({status = 'info', instantKey}) => {
    const [bannerVisible, setBannerVisible] = useState(true)
    const {reloadUnreadInstantPrompt} = useContext(AppContext)

    const onClickIgnore = async () => {
        setBannerVisible(false)
        const reqData = {
            type: instantKey
        }
        const {success, data} = await ignoreInstantPrompt(reqData)
        if (success && data.success) {
            reloadUnreadInstantPrompt()
            // add notification if necessary
        }
    }

    return (
        <div className={'m-b-20'}>
            {
                bannerVisible && (
                    <Banner title="Order delay processing time" status={status}
                            onDismiss={() => setBannerVisible(false)}>
                        <div className="p-b-10">
                            <p>Your orders will be sent to production automatically by PrintHolo Fulfillment system
                                after 30 minutes since we received them. You can change this process to manual or set
                                a period of time for sending orders to production in account settings panel.</p>
                        </div>

                        <Link to={{pathname: Paths.Settings, highlightContainerID: "#user-setting-order-processing"}}>
                            <Button primary>Go to settings now</Button>
                        </Link>
                        <Button onClick={onClickIgnore}>Do not show this notice again</Button>
                    </Banner>
                )
            }
        </div>
    )
}
export default OrderTimeDelayNotice
