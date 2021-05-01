import React, {useState} from 'react'
import Paths from '../../../routes/Paths'
import './ResetPasswordForm.css'
import {useHistory} from 'react-router-dom'
import {Banner, Button, Form, FormLayout, Link, Stack, TextField} from "@shopify/polaris"
import {notification} from "antd"
import {resetPassword} from "../../../services/api/forgotPassword"
import Countdown from "react-countdown"

const WAITING_TIME_TO_REDIRECT = 5000 //ms

const ResetPasswordForm = (props) => {
    const uid = props.uid
    const token = props.token

    const [buttonLoading, setButtonLoading] = useState(false)
    const history = useHistory()
    const [password, setPassword] = useState(null)
    const [confirmPassword, setConfirmPassword] = useState(null)
    const [passwordError, setPasswordError] = useState(null)
    const [confirmPasswordError, setConfirmPasswordError] = useState(null)
    const [confirmPasswordHelpText, setConfirmPasswordHelpText] = useState(null)
    const [successSubmit, setSuccessSubmit] = useState(false)


    const handlePasswordChange = (value) => setPassword(value)
    const handleConfirmPasswordChange = (value) => {
        setConfirmPassword(value)
        setConfirmPasswordError('')
        if (!password) {
            setConfirmPasswordHelpText('Please input New password first!')
        } else if (password !== value) {
            setConfirmPasswordHelpText('Password is not match!')
        } else setConfirmPasswordHelpText('')
    }


    const onClickSubmitResetPasswordForm = async (e) => {
        e.preventDefault()
        if (password === null || password === '' || password === undefined) {
            setPasswordError('Please input New password')
        } else if (confirmPassword === null || confirmPassword === '' || confirmPassword === undefined) {
            setConfirmPasswordHelpText('')
            setConfirmPasswordError('Please input Confirm new password')
        } else if (password.length < 5) {
            setPasswordError('Your password must be at least 5 characters')
        } else if (password.includes(" ")) {
            setPasswordError('Your password can’t contain any space')
        } else if (password !== confirmPassword) {
            setConfirmPasswordHelpText('')
            setConfirmPasswordError('Confirm password is not match')
        } else {
            setButtonLoading(true)
            const reqData = {
                password, uid, token
            }
            const resetPasswordResp = await resetPassword(reqData)
            const resetPasswordRespData = resetPasswordResp.data
            if (resetPasswordResp.success && resetPasswordRespData.success) {
                setButtonLoading(false)
                setSuccessSubmit(true)
                // notification['success']({
                //     message: 'Success',
                //     description: resetPasswordRespData.data.message + ` Redirect to login page after ${WAITING_TIME_TO_REDIRCT} seconds...`,
                //     duration: WAITING_TIME_TO_REDIRCT
                // })
                // setTimeout(() => history.push(Paths.Login), WAITING_TIME_TO_REDIRCT * 1000)
            } else {
                setButtonLoading(false)
                notification['error']({
                    message: 'Error',
                    description: "An error is occurred. Please try again",
                })
            }
        }
    }

    const Completionist = () => <span>Redirecting...</span>

    const renderer = ({hours, minutes, seconds, completed}) => {
        if (completed) {
            history.push(Paths.Login)
            return <Completionist/>
        } else {
            return (
                <Banner status="success">
                    <p>
                        Your password is reset successfully. Redirecting to Login page after <span
                        className="countdown">{seconds}</span> {seconds > 1 ? 'seconds' : 'second'}
                    </p>
                </Banner>
            )
        }

    }

    const renderRedirect = () => {
        return <Countdown date={Date.now() + WAITING_TIME_TO_REDIRECT} renderer={renderer}/>
    }

    return (
        <div>
            {
                successSubmit ? (
                    <div>
                        {renderRedirect()}
                    </div>
                ) : (
                    <Form onSubmit={onClickSubmitResetPasswordForm}>
                        <FormLayout>
                            <div className="row">
                                <div className="col-12 mb-4">
                                    <TextField type='password' label="New password" value={password}
                                               onChange={handlePasswordChange}
                                               helpText="Your password must be at least 5 characters, and can’t contain any space."
                                               error={passwordError}
                                               onFocus={() => setPasswordError('')}
                                    />
                                </div>
                                <div className="col-12">
                                    <TextField type='password' label="Confirm new password" value={confirmPassword}
                                               onChange={handleConfirmPasswordChange} error={confirmPasswordError}
                                               onFocus={() => setConfirmPasswordError('')}
                                               helpText={confirmPasswordHelpText}/>
                                </div>
                            </div>
                            <Stack alignment="center">
                                <Stack.Item>
                                    <Button fullWidth submit primary loading={buttonLoading}>Reset password</Button>
                                </Stack.Item>
                            </Stack>
                        </FormLayout>
                    </Form>
                )
            }
            <hr className={"my-5"}/>
            <div className="row justify-content-center mt-4">
                <div className="col-md-12 text-right">
                    <span className={'mx-3'}><Link url={Paths.HomePage}>Home</Link></span>
                    <span className={'mx-3'}><Link url={Paths.Login}>Login</Link></span>
                    <span className={'ml-3'}><Link url={Paths.Register}>Register</Link></span>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordForm