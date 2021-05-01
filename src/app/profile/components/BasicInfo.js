import React, {useCallback, useEffect, useState} from 'react'
import ActivationEmailRequestButton from './ActivationEmailRequestButton'
import {Col, notification, Row} from 'antd'
import './BasicInfo.scss'
import {updateUserProfile} from '../../../services/api/userProfile'
import {
    Avatar,
    Banner,
    Button,
    Card,
    ChoiceList,
    FormLayout,
    Heading,
    Modal,
    Stack,
    TextContainer,
    TextField
} from '@shopify/polaris'
import {convertDatetimeWithoutTimezone} from '../../../services/util/datetime'

import {Calendar} from 'react-date-range'

import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import {retrieveUserAvatarUrl} from "../../../services/auth/auth"
import {useHistory, withRouter} from "react-router-dom"
import Paths from "../../../routes/Paths"


// const DEFAULT_AVATAR_URL = 'https://i0.wp.com/www.winhelponline.com/blog/wp-content/uploads/2017/12/user.png?fit=256%2C256&quality=100&ssl=1'


const BasicInfo = (props) => {
    const [name, setName] = useState(null)
    const [address, setAddress] = useState(null)
    const [phone, setPhone] = useState(null)
    const [gender, setGender] = useState(null)
    const [birthday, setBirthday] = useState(null)
    const [birthdayModalActive, setBirthdayModalActive] = useState(false)
    const [saveLoading, setSaveLoading] = useState(false)
    const history = useHistory()

    useEffect(() => {
        // waiting()
        setName(props.profile.name)
        setAddress(props.profile.address)
        setGender(props.profile.gender)
        setPhone(props.profile.phone_number)
        setBirthday(props.profile.birthday)
    }, [props])

    const handleBirthdayModalActive = useCallback(() => setBirthdayModalActive(!birthdayModalActive), [birthdayModalActive])

    const handleNameChange = (newValue) => setName(newValue)
    const handleAddressChange = (newValue) => setAddress(newValue)
    const handlePhoneChange = (newValue) => setPhone(newValue)
    const handleGenderChange = (newValue) => setGender(newValue)
    const handleBirthdayChange = (newValue) => {
        return newValue.toISOString() ? setBirthday(convertDatetimeWithoutTimezone(newValue.toISOString()).format('YYYY-MM-DD')) : null
    }

    const profile = props.profile

    const handleSave = async () => {
        setSaveLoading(true)
        let genderData = null
        if (gender) {
            genderData = Array.isArray(gender) ? gender[0] : gender
        }
        // console.log(genderData)
        const data = {
            name: name,
            address: address,
            phone_number: phone,
            gender: genderData,
            birthday: birthday,
        }
        await updateProfile(data)
        setSaveLoading(false)
    }

    const updateProfile = async (reqData) => {
        const {success, data} = await updateUserProfile(reqData)
        if (success && data.success) {
            props.refresh()
            notification['success']({
                message: 'Success',
                description: 'Update profile successfully!',
            })
        } else {
            notification['error']({
                message: 'Error',
                description: data.message || 'An error occurs. Please try again!',
            })
        }
        // _setLoading(false)
    }

    const renderPaymentLink = () => {
        return (
            <div className={'mb-3'}>
                <Banner
                    status="info"
                    // action={{
                    //     content: "Add payment method",
                    //     external: true,
                    //     onAction: () => {
                    //         history.push('/u/payments')
                    //     }
                    //
                    // }}
                    // onDismiss={() => {
                    // }}
                >
                    <p>It seems that you don't have any payment methods.&nbsp;
                        <span className={"link-ui"} onClick={() => history.push(Paths.PaymentManager)}>Add your payment method now</span>
                    </p>
                </Banner>
            </div>
        )
    }


    return (
        <Row className={'ui-bar--separator basic-info'}>
            <Col span={24} md={8}>
                <TextContainer>
                    <Heading>Personal Information</Heading>
                    <p>Your account details, include email, name, contact information, etc... </p>

                </TextContainer>
                <div className={'mr-5 mt-4'}>
                    {!profile.is_email_confirmed && (
                        <ActivationEmailRequestButton/>
                    )}
                    {!profile.is_valid_payment && renderPaymentLink()}
                </div>

            </Col>
            <Col span={24} md={16}>
                <Card>
                    <Card.Section>
                        <Stack alignment="center">
                            <Stack.Item fill>
                                <Avatar customer={false} size="medium"
                                        source={retrieveUserAvatarUrl(profile.avatar_url, profile.name)}/>
                            </Stack.Item>
                            <Stack.Item>
                                <Button primary onClick={handleSave} loading={saveLoading}>Save</Button>
                            </Stack.Item>

                        </Stack>
                    </Card.Section>
                    <Card.Section>
                        <div className="row">
                            <div className="col-6">
                                <FormLayout>
                                    <TextField type='text' label="Name" value={name} onChange={handleNameChange}/>
                                    <TextField type='text' label="Phone number" value={phone}
                                               onChange={handlePhoneChange}/>
                                    <TextField type='text' label="Address" value={address}
                                               onChange={handleAddressChange}/>
                                </FormLayout>
                            </div>
                            <div className="col-6">
                                <FormLayout>
                                    <TextField type='text' label="Date of birth" value={birthday}
                                               disabled
                                        // onChange={handleBirthdayChange}
                                               labelAction={{content: 'Change', onAction: handleBirthdayModalActive}}/>
                                    <ChoiceList
                                        title="Gender"
                                        choices={[
                                            {label: 'Male', value: 'Male'},
                                            {label: 'Female', value: 'Female'},
                                            {label: 'Other', value: 'Other'},
                                        ]}
                                        selected={gender || []}
                                        onChange={handleGenderChange}
                                    />
                                    <Modal
                                        open={birthdayModalActive}
                                        onClose={handleBirthdayModalActive}
                                        title="Select your date of birth"
                                        primaryAction={{
                                            content: 'Done',
                                            onAction: handleBirthdayModalActive,
                                        }}
                                        secondaryActions={[
                                            {
                                                content: 'Cancel',
                                                onAction: handleBirthdayModalActive,
                                            },
                                        ]}
                                    >
                                        <div className={'birthday-modal'}>
                                            <Calendar
                                                date={birthday ? new Date(birthday) : null}
                                                onChange={handleBirthdayChange}
                                                color={'#5C6AC4'}
                                            />
                                        </div>
                                    </Modal>
                                </FormLayout>
                            </div>
                        </div>
                    </Card.Section>
                </Card>
            </Col>
        </Row>
    )
}

export default withRouter(BasicInfo)
