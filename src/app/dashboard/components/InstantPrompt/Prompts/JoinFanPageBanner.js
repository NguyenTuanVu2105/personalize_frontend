import {CalloutCard} from "@shopify/polaris"
import Paths from "../../../../../routes/Paths"
import React from "react"
import "./JoinFanPageBanner.scss"

const JoinFanPageBanner = () => {
    const onCLickAction = (e) => {
        e.preventDefault()
        window.open(Paths.JoinFanPage)
    }

    return (
        <div className={'m-b-20 join-fanpage-banner'}>
            <CalloutCard
                title="Join Facebook Group"
                illustration="https://storage.googleapis.com/printholo/shared/facebook.svg"
                primaryAction={{
                    content: 'Join us now',
                    onAction: onCLickAction,
                    // external: true
                }}
            >
                <p>Welcome to the PrintHolo Seller Community!</p>
            </CalloutCard>
        </div>
    )
}

export default JoinFanPageBanner