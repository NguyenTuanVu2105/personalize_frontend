import React, {useState} from 'react'
import {register} from '../../../services/api/register'
import {Form, notification} from 'antd'

import './Register.css'
import Paths from '../../../routes/Paths'
import {getReactEnv} from '../../../services/env/getEnv'
import ReCAPTCHA from 'react-google-recaptcha'
import {Banner, Button, FormLayout, Stack, TextField} from "@shopify/polaris"
import {withRouter} from "react-router-dom"

const RECAPTCHA_SITE_KEY = getReactEnv('RECAPTCHA_SITE_KEY')
const recaptchaRef = React.createRef()

const RegistrationForm = (props) => {
    const [err, setErr] = useState('')
    const [_gRecaptcha, _setGRecaptcha] = useState('')
    const [_submitLoading, _setSubmitLoading] = useState(false)

    const [email, setEmail] = useState(null)
    const [emailError, setEmailError] = useState(null)
    const [name, setName] = useState(null)
    const [nameError, setNameError] = useState(null)
    const [password, setPassword] = useState(null)
    const [confirmPassword, setConfirmPassword] = useState(null)
    const [passwordError, setPasswordError] = useState(null)
    const [confirmPasswordError, setConfirmPasswordError] = useState(null)
    const [confirmPasswordHepltext, setConfirmPasswordHelptext] = useState(null)

    const handleEmailChange = (value) => {
        setEmail(value)
        setEmailError('')
    }
    const handleNameChange = (value) => {
        setName(value)
        setNameError('')
    }
    const handlePasswordChange = (value) => setPassword(value)
    const handleConfirmPasswordChange = (value) => {
        setConfirmPassword(value)
        setConfirmPasswordError('')
        if (!password) {
            setConfirmPasswordHelptext('Please input New password first!')
        } else if (password !== value) {
            setConfirmPasswordHelptext('Password is not match!')
        } else setConfirmPasswordHelptext('')
    }

    const validateEmail = (email) => {
        //eslint-disable-next-line
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(String(email).toLowerCase())
    }

    const registerAnAccount = async (data) => {
        setErr('')
        const respone = await register(data)
        _setSubmitLoading(false)
        recaptchaRef.current.reset()
        if (respone.success) {
            if (respone.data.success) {
                notification["success"]({
                    message: 'Register successfully',
                    description:
                        'Your account is created successfully. Please check your mail to active account.',
                })
                props.history.push('/login')
            } else {
                setErr('That Email is registered')
                _setSubmitLoading(false)
            }
        } else {
            setErr('Something went wrong. Try refreshing page and register again')
            _setSubmitLoading(false)
        }
    }

    const onChange = (value) => {
        _setGRecaptcha(value)
    }


    const onRegister = (e) => {
        e.preventDefault()
        if (!validateEmail(email)) {
            setEmailError("This email is invalid!")
        } else if (!name) {
            setNameError("Please fill your name!")
        } else if (password !== confirmPassword) {
            setConfirmPasswordHelptext('')
            setConfirmPasswordError('Confirm password is not match')
        } else if (_gRecaptcha.length <= 10) {
            setErr('Please confirm reCaptcha')
        } else {
            _setSubmitLoading(true)
            const reqData = {
                email, password, name, gRecaptcha: _gRecaptcha
            }
            registerAnAccount(reqData)
        }
    }

    return (
        <div>
            {err && (
                <div className={'mb-3'}>
                    <Banner status={"critical"}>
                        <p>{err}</p>
                    </Banner>
                </div>
            )
            }
            <Form onSubmit={onRegister}>
                <FormLayout>
                    <div className="row">
                        <div className="col-6">
                            <TextField type='email' label="Email" value={email} onChange={handleEmailChange}
                                       error={emailError} onFocus={() => setEmailError('')}/>
                        </div>
                        <div className="col-6">
                            <TextField type='text' label="Name" value={name} onChange={handleNameChange}
                                       error={nameError} onFocus={() => setNameError('')}/>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-6">
                            <TextField type='password' label="Password" value={password}
                                       onChange={handlePasswordChange}
                                       helpText="Your password must be at least 5 characters, and can’t begin or end with a space."
                                       error={passwordError}
                                       onFocus={() => setPasswordError('')}
                            />
                        </div>
                        <div className="col-6">
                            <TextField type='password' label="Confirm password" value={confirmPassword}
                                       onChange={handleConfirmPasswordChange} error={confirmPasswordError}
                                       onFocus={() => setConfirmPasswordError('')} helpText={confirmPasswordHepltext}/>
                        </div>
                    </div>
                </FormLayout>
                <Stack alignment={'center'}>
                    <Stack.Item fill>
                        <div className="row mx-0 my-4">
                            <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY}
                                       onChange={onChange}
                                       ref={recaptchaRef}
                            />
                        </div>
                    </Stack.Item>
                    <Button submit primary loading={_submitLoading}>
                        Register
                    </Button>
                </Stack>
            </Form>
            <hr/>
            <div className="row justify-content-center">
                <span className="col-md-6 text-center"> Already have an account ? &nbsp; <span className={'link-ui'}
                                                                                               onClick={() => props.history.push(Paths.Login)}>Login</span></span>
            </div>
        </div>)
}

export default withRouter(RegistrationForm)
