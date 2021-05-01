import React, {useEffect, useState} from 'react'
import './LoginContainer.css'
import LoginForm from './LoginForm'
import GoogleAuthButton from '../../components/GoogleAuthButton'
import {Banner, DisplayText, Frame, Loading, Stack} from '@shopify/polaris'
import logo from '../../../assets/presentations/logo.png'
import * as qs from 'query-string'
import {LOGIN_BANNER_CODE, LoginBanner} from '../../auth/constants/loginBanner'
import AppBanner from "../../userpage/components/AppBanner";

const LoginContainer = (props) => {
    const params = qs.parse(props.location.search)
    const [loading, setLoading] = useState(true)
    const [displayBanner, setDisplayBanner] = useState(!!params.email && !!params.case && !!LoginBanner[params.case] && !!params.store)

    useEffect(() => {
        setTimeout(() => setLoading(false), 100)
    }, [])

    return (
        <div className="container-fluid login-container pt-5">
            {<AppBanner/>}
            <div className="row">
                <div className="col-md-1"/>
                <div className="col-md-6">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-md-8 align-items-center justify-content-center login-card">
                            {loading && (
                                <Frame>
                                    <Loading/>
                                </Frame>
                            )}
                            {!loading && (
                                <div>
                                    <Stack alignment={'center'}>
                                        <Stack.Item>
                                            <div className={'text-right mb-4'}>
                                                <DisplayText size={'large'}>Login</DisplayText>
                                            </div>
                                        </Stack.Item>
                                        <Stack.Item fill>
                                            <div className={'text-right'}
                                                 style={{marginTop: "5%", marginBottom: "10%"}}>
                                                <img src={logo} alt="PrintHolo" height={'35px'}/>
                                            </div>
                                        </Stack.Item>
                                    </Stack>
                                    {
                                        displayBanner &&
                                        <div className={'pb-4'}>
                                            <Banner status={'info'} onDismiss={() => {
                                                setDisplayBanner(false)
                                            }}>
                                                {
                                                    LoginBanner[params.case].content(params.email)
                                                }
                                                {/*<p>If you forget your password, you can click <Link url={`${Paths.ForgotPassword}/?${serializeObjectToQueryString({email:params.email})}`}>Forgot password?</Link> to reset it</p>*/}
                                            </Banner>
                                        </div>
                                    }
                                    <div>
                                        <GoogleAuthButton
                                            redirectToApp={[LOGIN_BANNER_CODE.AI_STORE_EMAIL_EXIST, LOGIN_BANNER_CODE.AI_STORE_EXIST].includes(params.case)}
                                            store={params.store}
                                        />
                                        <div className={'w-100 text-center my-5'}>
                                            <hr/>
                                        </div>
                                        <LoginForm placeholderEmail={params.email}
                                                   redirectToApp={[LOGIN_BANNER_CODE.AI_STORE_EMAIL_EXIST, LOGIN_BANNER_CODE.AI_STORE_EXIST].includes(params.case)}
                                                   store={params.store}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
                <div className="col-md-5"/>
            </div>
        </div>
    )
}

export default LoginContainer
