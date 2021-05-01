import {Col, notification, Row} from 'antd'
import React, {useEffect, useState} from 'react'
import {changePassword} from '../../../services/api/auth'
import {Banner, Button, Card, FormLayout, Heading, Stack, TextContainer, TextField} from '@shopify/polaris'
import {formatDatetime} from "../../../services/util/datetime"

const ACOUNTTYPE = {
    'normal': '1',
    'google': '2'
}

const ChangePassword = (props) => {
    const [_hideOldPassword, _setHideOldPassword] = useState(false)
    const [_oldPassword, _setOldPassword] = useState(null)
    const [_oldPasswordError, _setOldPasswordError] = useState(null)
    const [_newPassword, _setNewPassword] = useState(null)
    const [_newPasswordError, _setNewPasswordError] = useState(null)
    const [_confirmNewPassword, _setConfirmNewPassword] = useState(null)
    const [_confirmNewPasswordHelptext, _setConfirmNewPasswordHelptext] = useState(null)
    const [_confirmNewPasswordError, _setConfirmNewPasswordError] = useState(null)
    const [saveLoading, setSaveLoading] = useState(false)
    useEffect(() => {
        checkAcount()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleOldPasswordChange = (v) => _setOldPassword(v)
    const handleNewPasswordChange = (v) => _setNewPassword(v)
    const handleConfirmNewPasswordChange = (v) => {
        _setConfirmNewPassword(v)
        if (!_newPassword) {
            _setConfirmNewPasswordHelptext('Please input New password first!')
        } else {
            if (_newPassword !== v) {
                _setConfirmNewPasswordHelptext('Password is not match!')
            } else {
                _setConfirmNewPasswordHelptext(null)
            }
        }
    }

    const checkAcount = () => {
        const profile = props.profile
        if (isGAuthAndNoChangePassword(profile)) {
            _setHideOldPassword(true)
        }
    }

    const isGAuthAndNoChangePassword = (profile) => {
        return profile.account_type && profile.account_type.toLowerCase() === ACOUNTTYPE.google && profile.last_change_password == null
    }

    const submitChangePassword = async (oldPassword, newPassword) => {
        setSaveLoading(true)
        const profile = props.profile
        const reqData = {
            old_password: isGAuthAndNoChangePassword(profile) ? 'google' : oldPassword,
            new_password: newPassword
        }
        const {success, data} = await changePassword(reqData)
        if (success && data.success) {
            notification['success']({
                message: 'Success',
                description: data.message,
            })
        } else {
            // console.log(data)
            if (data.message && data.message.toLowerCase().includes('incorrect')) {
                _setOldPasswordError('Your current password is incorrect')
            } else {
                notification.error({
                    message: 'Error',
                    description: "An error occurs, please try again",
                })
            }
        }
        setSaveLoading(false)

    }

    const monthDiff = (month, other) => {
        var months;
        months = (other.getFullYear() - month.getFullYear()) * 12;
        months -= month.getMonth() + 1;
        months += other.getMonth();
        return months <= 0 ? 0 : months;
    }

    const extraInfo = () => {
        const last_change_password = props.profile.last_change_password
        if (last_change_password != null) {
            const password_time = monthDiff(new Date(last_change_password), new Date())
            return password_time !== 0 ? (
                <p>You last changed your password {password_time} month{password_time>1 ? "s": ""} ago.</p>
            ) : (
                <p>You last changed your password at {formatDatetime(last_change_password)}.</p>
            )
        } else return (
            <p>You haven't changed your password yet.</p>
        )

    }

    const onSave = () => {
        // console.log(_hideOldPassword, _oldPassword)
        if (!_hideOldPassword && !_oldPassword) {
            _setOldPasswordError('Please input your current password')
        } else if (!_newPassword) {
            _setNewPasswordError('Please input your new password')
        } else if (_newPassword.length <= 8) {
            _setNewPasswordError('Your new password is too weak')
        } else if (_newPassword !== _confirmNewPassword) {
            _setConfirmNewPasswordError('Confirm password is not match')
        } else {
            submitChangePassword(_oldPassword, _newPassword)
        }
    }

    return (
        <Row className={'mt-4'}>
            <Col span={24} md={8} className="mb-4">
                <TextContainer>
                    <Heading>Security</Heading>
                    <p>Confirm and change your password</p>
                </TextContainer>
            </Col>
            <Col span={24} md={16}>
                <Card>
                    <Card.Section>
                        <Stack alignment="center">
                            <Stack.Item fill>
                                {extraInfo()}
                            </Stack.Item>
                            <Stack.Item>
                                <Button primary onClick={onSave} loading={saveLoading}>Save</Button>
                            </Stack.Item>

                        </Stack>
                    </Card.Section>
                    <Card.Section>
                        <FormLayout>
                            {!_hideOldPassword && (
                                <TextField type='password' label="Current password" value={_oldPassword}
                                           onChange={handleOldPasswordChange} error={_oldPasswordError}
                                           onFocus={() => _setOldPasswordError('')}/>
                            )}
                            {_hideOldPassword && (
                                <Banner status={'info'}>
                                    <p>You have been login with Google Account, so let's type a new password for your
                                        account.</p>
                                </Banner>
                            )}
                            <TextField type='password' label="New password" value={_newPassword}
                                       onChange={handleNewPasswordChange}
                                       helpText="Your password must be at least 5 characters, and can’t begin or end with a space."
                                       error={_newPasswordError}
                                       onFocus={() => _setNewPasswordError('')}
                            />
                            <TextField type='password' label="Confirm new password" value={_confirmNewPassword}
                                       onChange={handleConfirmNewPasswordChange} error={_confirmNewPasswordError}
                                       helpText={_confirmNewPasswordHelptext}
                                       onFocus={() => _setConfirmNewPasswordError('')}/>
                        </FormLayout>
                    </Card.Section>

                </Card>
            </Col>
        </Row>
    )
}

export default ChangePassword