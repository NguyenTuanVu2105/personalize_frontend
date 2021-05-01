import {CalloutCard} from "@shopify/polaris"
import Paths from "../../../../../routes/Paths"
import React from "react"
import "./BasicMoreBanner.scss"

const BasicMoreBanner = () => {
    const onCLickAction = (e) => {
        e.preventDefault()
        window.open(Paths.BasicMore)
    }
    return (
        <div className={'m-b-20 basic-more-banner'}>
            <CalloutCard
                title="Get started with PrintHolo"
                illustration="https://storage.googleapis.com/printholo/shared/more_info.svg"
                primaryAction={{
                    content: 'Read more',
                    onAction: onCLickAction,
                    // external: true
                }}
            >
                <p>Make sure you check out our tutorials.</p>
            </CalloutCard>
        </div>
    )
}

export default BasicMoreBanner