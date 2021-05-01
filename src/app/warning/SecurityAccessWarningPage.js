import React from 'react'
import {Button, DisplayText, TextContainer} from "@shopify/polaris"
import {getReactEnv} from "../../services/env/getEnv"
import DocTitle from "../shared/DocTitle"

const SecurityAccessWarningPage = function (props) {
    const goToFullSite = () => {
        const client_url = getReactEnv("CLIENT_URL")
        window.open(client_url)
    }
    return (
        <div className="homepage-container">
            <DocTitle title="Warning Access" {...props} />
            <div className="container-fluid height-100" style={{paddingTop: '100px'}}>
                <div className="row align-items-center height-100">
                    <div className="col-4 offset-2 flex-middle">
                        <TextContainer>
                            <DisplayText size="extraLarge">PrintHolo does not support rendering inside Shopify App while you are in security mode</DisplayText>
                            &nbsp;
                            <DisplayText size="small">Maybe due to incognito window or some 3rd party libraries has been blocked. You can open the app in full-site to continue using PrintHolo.</DisplayText>
                            &nbsp;
                            <div className="flex-start">
                                <Button primary size="large" onClick={goToFullSite}>Open Full Site
                                </Button>
                            </div>
                        </TextContainer>

                    </div>
                    <div className="col-6">
                        <img src="https://cdn.shopify.com/shopifycloud/web/assets/v1/ab10d80fe27e351d8ca4d4ec809c729c.svg"
                             role="presentation" alt="" className="_3XHLc" width="100%"/>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default SecurityAccessWarningPage
