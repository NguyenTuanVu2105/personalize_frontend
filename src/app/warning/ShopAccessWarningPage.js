import React from 'react'
import {Button, DisplayText, TextContainer} from '@shopify/polaris'
import DocTitle from '../shared/DocTitle'
import {logout} from '../../services/auth/auth'

const ShopAccessWarningPage = function (props) {
    return (
        <div className="homepage-container">
            <DocTitle title="Warning Access" {...props} />
            <div className="container-fluid height-100" style={{paddingTop: '100px'}}>
                <div className="row align-items-center height-100">
                    <div className="col-4 offset-2 flex-middle">
                        <TextContainer>
                            <DisplayText size="extraLarge">Unable to access store data with logged account</DisplayText>
                            &nbsp;
                            <DisplayText size="small">It seems like this store does not belong to
                                PrintHolo account. Maybe you have installed PrintHolo app with another PrintHolo
                                account</DisplayText>
                            &nbsp;
                            <div className="flex-start">
                                <Button primary size="large" onClick={logout}>Log in with another account
                                </Button>
                            </div>
                        </TextContainer>

                    </div>
                    <div className="col-6">
                        <img
                            src="https://cdn.shopify.com/shopifycloud/web/assets/v1/ab10d80fe27e351d8ca4d4ec809c729c.svg"
                            role="presentation" alt="" className="_3XHLc" width="100%"/>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShopAccessWarningPage
