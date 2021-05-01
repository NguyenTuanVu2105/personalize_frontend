import React, {useContext, useEffect, useState} from 'react'
import './SettingContainer.scss'
import {Col, InputNumber, notification, Radio, Row} from 'antd'
import UserPageContext from '../userpage/context/UserPageContext'
import {Button, Card, DisplayText, Heading, Select, Spinner, TextContainer} from '@shopify/polaris'
import {TIMEZONES} from './constants/timezones'
import {getUserSettings, updateUserSettings} from '../../services/api/userSettings'
import {COOKIE_KEY} from '../../services/storage/sessionStorage'
import {parseDurationToSecond} from '../../services/util/datetime'
import {setLocalStorage} from '../../services/storage/localStorage'
import {orderDelayOptions} from "./constants/orderDelay"
import Paths from "../../routes/Paths"


const trackingOptions = {
    DEFAULT: -3,
    ASAP: -2,
    FULFILLED: -1,
    CUSTOM: 0,
}

const trackingInfo = [
/*    {
        title: "Default",
        value: trackingOptions.DEFAULT,
        description: "Do not customize tracking generation time. Use tracking whenever PrintHolo updates tracking number for your order"
    },*/
    {
        title: "At Packaging stage",
        value: trackingOptions.FULFILLED,
        description: "Update tracking number after the order is produced successfully"
    },
    {
        title: "ASAP",
        value: trackingOptions.ASAP,
        description: "Update tracking number immediately after PrintHolo received and started processing your order"
    },
    {
        title: "Custom",
        value: trackingOptions.CUSTOM,
        description: "Generate tracking number several days after PrintHolo has started processing your order or at packaging stage"
    }
]

const orderDelayRadioOptions = {
    MANUAL: 1,
    AUTOMATIC: 2
}

const defaultDelayDay = 5

const UserSettings = (props) => {
    const {setNameMap} = useContext(UserPageContext)
    const {location} = props

    const [_settings, _setSettings] = useState({})
    const [_editOrderItemDelay, _setEditOrderItemDelay] = useState(0)
    const [_loading, _setLoading] = useState(true)
    const [tracking, setTracking] = useState(trackingOptions.FULFILLED)
    const [delayDay, setDelayDay] = useState(defaultDelayDay)
    const [selectedOrderDelayOption, setSelectedOrderDelayOption] = useState(false)

    const [saveLoading, setSaveLoading] = useState(false)

    useEffect(() => {
        // console.log(props.location.highlightContainerID)
        const selector = props.location.highlightContainerID
        if (selector) {
            const element = document.querySelector(selector)
            if (element) {
                if (!element.classList.contains('importantError')) {
                    element.classList.add('importantError')
                    setTimeout(() => {
                        element.classList.remove('importantError')
                    }, 2000)
                }
            }
        }

    }, [props])

    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [location.pathname]: 'Settings'
        })
        getSettings()
        _setLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const timezoneOptions = Object.keys(TIMEZONES).map((zone) => {
        return {
            label: TIMEZONES[zone],
            value: zone
        }
    })

    const handleEditOrderItemDelayChange = (value) => _setEditOrderItemDelay(value)

    const handleTimezoneSelectChange = (value) => {
        _setSettings({..._settings, timezone: value})
    }

    const handleTrackingChange = (event) => {
        setTracking(event.target.value)
    }

    const getSettings = async () => {
        const {data, success} = await getUserSettings()
        if (!success) {
            return
        }
        const settingsData = data.results[0]
        _setSettings(settingsData)
        const {edit_order_items_delay, tracking_generation_time, request_order_processing_manually} = settingsData
        if (request_order_processing_manually) setSelectedOrderDelayOption(orderDelayRadioOptions.MANUAL)
        else setSelectedOrderDelayOption(orderDelayRadioOptions.AUTOMATIC)
        _setEditOrderItemDelay(parseDurationToSecond(edit_order_items_delay).toString())
        if (tracking_generation_time) {
            if (tracking_generation_time >= 0) {
                setTracking(0)
                setDelayDay(tracking_generation_time)
            } else {
                setTracking(tracking_generation_time)
                setDelayDay(defaultDelayDay)
            }
        } else {
            setTracking(trackingOptions.FULFILLED)
            setDelayDay(defaultDelayDay)
        }
    }

    const saveSettings = async () => {
        setSaveLoading(true)
        const reqData = {
            timezone: _settings.timezone,
            edit_order_items_delay: parseInt(_editOrderItemDelay),
            request_order_processing_manually: selectedOrderDelayOption === orderDelayRadioOptions.MANUAL,
            tracking_generation_time: tracking >= 0 ? delayDay : tracking
        }

        const {data, success} = await updateUserSettings(reqData, _settings.id)
        if (success && data.success) {
            notification.success({
                message: "Success",
                description: "Your settings is saved successfully!"
            })
            setLocalStorage(COOKIE_KEY.TIMEZONE, _settings.timezone)
            getSettings()
        } else {
            notification.error({
                message: "Error",
                description: "An error occurred when saving your settings. Please try again or contact our support team."
            })

        }
        setSaveLoading(false)
    }

    const handleDelayDayChange = (value) => {
        const days = parseInt(value)
        if (!isNaN(days)) {
            setDelayDay(days)
        }
    }

    const radioStyle = {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
    }

    const handleOrderDelayRadioChange = (event) => {
        setSelectedOrderDelayOption(event.target.value)
    }

    return _loading ? (
        <div className={"row justify-content-center pt-5 mt-5"}>
            <div className="col-12 text-center pt-5">
                <Spinner accessibilityLabel="Loading..." size="large" color="teal"/>
            </div>
        </div>
    ) : (
        <div>
            <div className={'ui-title-bar--separator'} style={{display: 'flex', justifyContent: 'space-between'}}>
                <TextContainer spacing="tight">
                    <DisplayText element="h3" size="large">Settings</DisplayText>
                </TextContainer>
                <div className="btn-heading">
                    <Button primary onClick={saveSettings} loading={saveLoading}>Save</Button>
                </div>
            </div>
            <div className="page-main-content">
                <Row className="ui-title-bar--separator">
                    <Col span={24} md={7} className="mb-4">
                        <TextContainer>
                            <Heading>Standards and formats</Heading>
                            <p>Standards and formats are used to calculate product prices, shipping weights, and order
                                times.</p>
                        </TextContainer>
                    </Col>
                    <Col md={1}/>
                    <Col span={24} md={16}>
                        <Card sectioned>
                            <Select
                                label="Timezone"
                                options={timezoneOptions}
                                onChange={handleTimezoneSelectChange}
                                value={_settings.timezone}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row className="p-t-20 ui-title-bar--separator" style={{zIndex: 99}}
                     id={"user-setting-order-processing"}>
                    <Col span={24} md={7} className="mb-4">
                        <TextContainer>
                            <Heading>Order processing time</Heading>
                            <div>
                                1. <b>Manually request fulfill</b>: Orders will be sent to production process after you
                                click "Request fulfill" button on each order detail panel (note: you CAN NOT cancel or
                                redo this action)
                            </div>
                            <div>
                                2. <b>Automatically request fulfill</b>: Orders will be sent to production process
                                automatically after the period of time that you set in this section (since it was
                                created).
                            </div>
                        </TextContainer>
                    </Col>
                    <Col md={1}/>
                    <Col span={24} md={16}>
                        <Card sectioned>
                            <Radio.Group
                                name="order_delay"
                                className="d-flex flex-column"
                                value={selectedOrderDelayOption}
                                onChange={handleOrderDelayRadioChange}
                            >
                                <Radio style={radioStyle} value={orderDelayRadioOptions.MANUAL}>Manual fulfill</Radio>
                                <Radio style={radioStyle} value={orderDelayRadioOptions.AUTOMATIC}>Auto fulfill</Radio>
                            </Radio.Group>
                            <div className={"mt-3"}>
                                {
                                    selectedOrderDelayOption === orderDelayRadioOptions.AUTOMATIC && (
                                        <Select
                                            label="Auto fulfill delay"
                                            options={orderDelayOptions}
                                            onChange={handleEditOrderItemDelayChange}
                                            value={_editOrderItemDelay}
                                        />
                                    )
                                }
                            </div>
                        </Card>
                    </Col>
                </Row>
                <Row className="m-t-20">
                    <Col span={24} md={7} className="mb-4">
                        <TextContainer>
                            <Heading>Customize tracking generation time</Heading>
                            <p>Customize the time you would like to update tracking number for your orders that are
                                fulfilled by PrintHolo.</p>
                        </TextContainer>
                    </Col>
                    <Col md={1}/>
                    <Col span={24} md={16}>
                        <Card sectioned>
                            <Radio.Group
                                name="tracking"
                                className="d-flex flex-column"
                                value={tracking}
                                defaultValue={trackingOptions.DEFAULT}
                                onChange={handleTrackingChange}
                            >
                                {
                                    trackingInfo.map((info, index) => {
                                        return (
                                            <div className={`d-flex ${index > 0 ? "mt-4" : ""}`} key={index}>
                                                <Radio value={info.value}/>
                                                <div>
                                                    <div style={{cursor: "pointer"}}
                                                         onClick={() => setTracking(info.value)}>
                                                        <Heading>{info.title}</Heading>
                                                        <span>{info.description}</span>
                                                    </div>
                                                    {
                                                        (tracking === trackingOptions.CUSTOM && info.value === trackingOptions.CUSTOM)
                                                        && (
                                                            <div className="mt-4">
                                                                <InputNumber
                                                                    min={0}
                                                                    style={{width: 100, marginRight: 5}}
                                                                    onChange={handleDelayDayChange}
                                                                    value={delayDay}
                                                                    defaultValue={defaultDelayDay}
                                                                />
                                                                <span>day(s)</span>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </Radio.Group>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default UserSettings
