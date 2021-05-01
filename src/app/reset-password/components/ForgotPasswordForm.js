import React, {useState} from 'react'
import Paths from '../../../routes/Paths'
import './ForgotPasswordForm.css'
import {Banner, Button, Form, FormLayout, Stack, TextField} from "@shopify/polaris"
import ReCAPTCHA from "react-google-recaptcha"
import {getReactEnv} from "../../../services/env/getEnv"
import {resetPasswordRequest} from "../../../services/api/forgotPassword"
import {withRouter} from "react-router-dom"

const RECAPTCHA_SITE_KEY = getReactEnv('RECAPTCHA_SITE_KEY')
const recaptchaRef = React.createRef()

const ForgotPasswordForm = (props) => {
    const {placeholderEmail} = props
    const [buttonLoading, setButtonLoading] = useState(false)
    const [email, setEmail] = useState(placeholderEmail)
    const [emailError, setEmailError] = useState(null)
    const [_gRecaptcha, _setGRecaptcha] = useState('')
    const [successSubmit, setSuccessSubmit] = useState(false)
    const [err, setErr] = useState('')

    const handleEmailChange = (value) => setEmail(value)

    const onChange = (value) => {
        _setGRecaptcha(value)
    }

    const validateEmail = (email) => {
        //eslint-disable-next-line
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(String(email).toLowerCase())
    }


    const onSubmit = async (e) => {
        e.preventDefault()
        if (!validateEmail(email)) {
            setEmailError("This email is invalid!")
        } else if (_gRecaptcha.length <= 10) {
            setErr('Please confirm reCaptcha')
        } else {
            setButtonLoading(true)
            const reqData = {
                email, gRecaptcha: _gRecaptcha
            }
            const forgotPasswordResp = await resetPasswordRequest(reqData)
            const forgotPasswordRespData = forgotPasswordResp.data
            if (forgotPasswordResp.success && forgotPasswordRespData.success) {
                setButtonLoading(false)
                setSuccessSubmit(true)
                // notification['success']({
                //     message: 'Success',
                //     description: forgotPasswordRespData.data.message,
                // })
            } else {
                setButtonLoading(false)
                setErr('An error is occurred. Please try again')
                // notification['error']({
                //     message: 'Error',
                //     description: "An error is occurred. Please try again",
                // })
            }
        }
    }


    return (
        <div>
            {
                successSubmit ? (
                    <div>
                        <Banner status="success">
                            <p>An email is send to your email. Please check your email inbox to get the link for
                                password resetting.</p>
                        </Banner>
                    </div>
                ) : (
                    <div>
                        {err && (
                            <div className={'mb-5'}>
                                <Banner status={"critical"}>
                                    <p>{err}</p>
                                </Banner>
                            </div>
                        )
                        }
                        <Form onSubmit={onSubmit}>
                            <FormLayout>
                                <TextField
                                    value={email}
                                    onChange={handleEmailChange}
                                    label="Your registered email"
                                    autoFocus
                                    type="email"
                                    error={emailError} onFocus={() => setEmailError('')}
                                />
                                <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY}
                                           onChange={onChange}
                                           ref={recaptchaRef}
                                />
                                <Stack alignment="center">
                                    <Stack.Item>
                                        <Button fullWidth submit primary loading={buttonLoading}>Send me an
                                            email</Button>
                                    </Stack.Item>
                                </Stack>
                            </FormLayout>
                        </Form>
                    </div>
                )
            }
            <hr className={"my-5"}/>
            <div className="row justify-content-center mt-4">
                <div className="col-md-12 text-right">
                    <span className={'mx-3'}><span className={'link-ui'}
                                                   onClick={() => props.history.push(Paths.HomePage)}>Home</span></span>
                    <span className={'mx-3'}><span className={'link-ui'}
                                                   onClick={() => props.history.push(Paths.Login)}>Login</span></span>
                    <span className={'ml-3'}><span className={'link-ui'}
                                                   onClick={() => props.history.push(Paths.Register)}>Register</span></span>
                </div>
            </div>
        </div>
    )
}

export default withRouter(ForgotPasswordForm)