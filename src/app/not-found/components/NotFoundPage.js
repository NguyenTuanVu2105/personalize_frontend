import React, {useContext} from 'react'
import './NotFoundPage.css'
import Paths from '../../../routes/Paths'
import AppContext from '../../../AppContext'
import {Button, DisplayText, TextContainer} from '@shopify/polaris'
import {SESSION_KEY, setSessionStorage} from '../../../services/storage/sessionStorage'

const NotFoundPage = function (props) {
    const {user} = useContext(AppContext)

    const gotoDashboard = () => {
        if (user && user.userId) {
            props.history.push(Paths.Dashboard)
        } else {
            setSessionStorage(SESSION_KEY.REDIRECT_URL, Paths.Dashboard)
            props.history.push(Paths.Login)
        }
    }

    return (
        <div className="container-fluid height-100" style={{paddingTop: '100px'}}>
            <div className="row align-items-center height-100">
                <div className="col-4 offset-2 flex-middle">
                    <TextContainer>
                        <DisplayText size="extraLarge">The page you’re looking for couldn’t be found</DisplayText>
                        &nbsp;
                        <DisplayText size="small">Check the web address and try again or return to the home
                            page.</DisplayText>
                        &nbsp;
                        <div className="flex-start">
                            <Button primary size="large" onClick={gotoDashboard}>Go to home page
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
    )
}

export default NotFoundPage
