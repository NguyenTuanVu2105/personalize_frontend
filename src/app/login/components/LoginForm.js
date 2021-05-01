import React, {useContext, useState} from 'react'
import {login} from '../../../services/api/auth'
import Paths from '../../../routes/Paths'
import './LoginForm.css'
import {useHistory, withRouter} from 'react-router-dom'
import {getSessionStorage, removeSessionStorage, SESSION_KEY} from '../../../services/storage/sessionStorage'
import AppContext from '../../../AppContext'
import {Button, Form, FormLayout, Stack, TextField} from "@shopify/polaris"
import {notification} from "antd"
import {serializeObjectToQueryString} from "../../../services/api"
import {isInFrame} from "../../../services/util/windowUtil"
import {getReactEnv} from "../../../services/env/getEnv"
import {saveLogInAccount} from "../../../services/auth/auth"

const shopifyAPIKey = getReactEnv("SHOPIFY_CLIENT_ID")

const LoginForm = (props) => {
    const {placeholderEmail, redirectToApp, store} = props
    const context = useContext(AppContext)
    const [buttonLoading, setButtonLoading] = useState(false)
    const history = useHistory()
    const [email, setEmail] = useState(placeholderEmail)
    const [password, setPassword] = useState(null)

    const handleEmailChange = (value) => setEmail(value)
    const handlePasswordChange = (value) => setPassword(value)

    const loginSuccess = (loginResult) => {
        context.setUser({
            ...loginResult.data,
            userId: loginResult.data.user_id,
        })
        saveLogInAccount(loginResult.data)
        const redirectUrl = getSessionStorage(SESSION_KEY.REDIRECT_URL)
        if (redirectToApp && store) {
            window.location.href = `https://${store}/admin/apps/${shopifyAPIKey}`

        } else if (redirectUrl) {
            removeSessionStorage(SESSION_KEY.REDIRECT_URL)
            const redirectUrlList = redirectUrl.split('?')
            history.push({
                pathname: redirectUrlList[0],
                search: redirectUrlList[1],
                redirected: true
            })

        } else {
            history.push(Paths.HomePage)
        }
        setButtonLoading(false)
    }

    const submitLogin = async () => {
        setButtonLoading(true)
        // setLoading(true)

        const loginResult = await login({
            email, password
        })
        if (loginResult.success) {
            loginSuccess(loginResult)
        } else {
            if (loginResult.data) {
                if ('message' in loginResult.data) {
                    notification.error({
                        message: "Error",
                        description: loginResult.data.message
                    })
                }
                else {
                    notification.error({
                        message: "Error",
                        description: "Invalid username or password"
                    })
                }
            } else {
                notification.error({
                    message: "Error",
                    description: "The server is busy"
                })
            }
            setButtonLoading(false)
        }
        // setLoading(false)
    }

    const registerLinkDisplay = !placeholderEmail && !isInFrame()

    return (
        <Form onSubmit={submitLogin}>
            <FormLayout>
                <TextField
                    value={email}
                    onChange={handleEmailChange}
                    autoFocus
                    label="Email"
                    type="email"
                />
                <TextField
                    value={password}
                    onChange={handlePasswordChange}
                    label="Password"
                    type="password"
                />
                <Stack alignment="center">
                    <Stack.Item fill>
                        <span className='link-ui'
                              onClick={() => props.history.push(placeholderEmail ? `${Paths.ForgotPassword}/?${serializeObjectToQueryString({email: placeholderEmail})}` : Paths.ForgotPassword)}>Forgot
                            password?</span>
                    </Stack.Item>
                    <Stack.Item>
                        <Button fullWidth submit primary loading={buttonLoading}>Login</Button>
                    </Stack.Item>
                </Stack>
                {
                    registerLinkDisplay &&
                    <div>
                        <hr/>
                        <div className="row justify-content-center">
                            <div className="col-md-6 text-center">Don't have an account? &nbsp;
                                <span><span className={'link-ui'}
                                            onClick={() => props.history.push(Paths.Register)}>Register</span></span>
                            </div>
                        </div>
                    </div>
                }
            </FormLayout>
        </Form>
    )
}

export default withRouter(LoginForm)
