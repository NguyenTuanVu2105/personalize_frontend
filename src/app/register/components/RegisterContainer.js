import React, {useEffect, useState} from 'react'
import DocTitle from '../../shared/DocTitle'
import Register from './Register'
import GoogleAuthButton from '../../components/GoogleAuthButton'
import {DisplayText, Frame, Loading, Stack} from "@shopify/polaris"
import "./RegisterContainer.scss"
import logo from "../../../assets/presentations/logo.png"

const RegisterContainer = function (props) {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => setLoading(false), 200)
    }, [])

    return (
        <div>
            <DocTitle title="Register"/>
            <div className="container-fluid register-container">
                <div className="row">
                    <div className="col-md-1"/>
                    <div className="col-md-6">
                        <div className="row align-items-center justify-content-center register-card">
                            {loading && (
                                <Frame>
                                    <Loading/>
                                </Frame>
                            )}
                            {!loading && (
                                <div className="col-md-12 align-items-center justify-content-center">
                                    <Stack alignment={'center'}>
                                        <Stack.Item>
                                            <div className={'text-right mb-4'}>
                                                <DisplayText size={'large'}>Register an account</DisplayText>
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
                                        <div className={'text-center'}>
                                            <GoogleAuthButton className={'w-100 text-center'}/>
                                        </div>
                                        <div className={'w-100 text-center my-5'}>
                                            <hr/>
                                        </div>
                                        <Register {...props} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-5"/>
                </div>
            </div>
        </div>
    )
}

export default RegisterContainer