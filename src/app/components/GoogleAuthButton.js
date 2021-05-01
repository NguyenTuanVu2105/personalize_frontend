import React, {useContext} from 'react'
import Paths from '../../routes/Paths'
import {withRouter} from 'react-router-dom'
import {getSessionStorage, removeSessionStorage, SESSION_KEY} from '../../services/storage/sessionStorage'
import AppContext from '../../AppContext'
import {GoogleLogin} from 'react-google-login'
import {googleAuth} from '../../services/api/googleAuth'
import {getReactEnv} from '../../services/env/getEnv'
import {saveLogInAccount} from "../../services/auth/auth"

const clientID = getReactEnv('GOOGLE_CLIENT_ID')
const shopifyAPIKey = getReactEnv("SHOPIFY_CLIENT_ID")

const GoogleAuthButton = (props) => {
    const {redirectToApp, store} = props
    const context = useContext(AppContext)
    const loginSuccess = (googleLoginResult) => {
        context.setUser({
            ...googleLoginResult,
            userId: googleLoginResult.user_id,
        })
        saveLogInAccount(googleLoginResult)
        const redirectUrl = getSessionStorage(SESSION_KEY.REDIRECT_URL)
        if (redirectToApp && store) {
            window.location.href = `https://${store}/admin/apps/${shopifyAPIKey}`

        } else if (redirectUrl) {
            removeSessionStorage(SESSION_KEY.REDIRECT_URL)
            const redirectUrlList = redirectUrl.split('?')
            props.history.push({
                pathname: redirectUrlList[0],
                search: redirectUrlList[1],
                redirected: true
            })
        } else {
            props.history.push(Paths.HomePage)
        }
    }

    const responseGoogle = async (response) => {
        // console.log(response)
        const reqData = {
            'id_token': response.tokenId,
            'access_token': response.accessToken,
        }
        const {success, data} = await googleAuth(reqData)
        if (success && data.email != null) {
            loginSuccess(data)
        }

    }

    const failureGoogle = async (response) => {
        console.log(response)
    }

    return (
        <div>
            <GoogleLogin
                clientId={clientID}
                buttonText="Continue with Google"
                onSuccess={responseGoogle}
                onFailure={failureGoogle}
                cookiePolicy={'single_host_origin'}
                className={props.className || 'w-100'}
            />
        </div>

    )
}


export default withRouter(GoogleAuthButton)
