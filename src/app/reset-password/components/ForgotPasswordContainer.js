import React, {useEffect, useState} from 'react'
import './ForgotPasswordContainer.css'
import ForgotPasswordForm from './ForgotPasswordForm'
import {DisplayText, Frame, Loading, Stack} from "@shopify/polaris"
import logo from "../../../assets/presentations/logo.png"
import * as qs from "query-string"

const ForgotPasswordContainer = (props) => {
    const params = qs.parse(props.location.search)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => setLoading(false), 100)
    }, [])

    return (
        <div className="container-fluid forgot-password-container pt-5">
            <div className="row">
                <div className="col-md-1"/>
                <div className="col-md-6">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-md-8 align-items-center justify-content-center forgot-password-card">
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
                                                <DisplayText size={'large'}>Forgot Password</DisplayText>
                                            </div>
                                        </Stack.Item>
                                        <Stack.Item fill>
                                            <div className={'text-right'}
                                                 style={{marginTop: "5%", marginBottom: "10%"}}>
                                                <img src={logo} alt="PrintHolo" height={'35px'}/>
                                            </div>
                                        </Stack.Item>
                                    </Stack>
                                    <div>
                                        <ForgotPasswordForm placeholderEmail={params.email}/>
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

export default ForgotPasswordContainer
