import React, {useEffect, useState} from 'react'
import './styles.scss'
import {notification, Select, Spin} from 'antd'
import paypal from '../../../../assets/images/paypal.svg'
import stripe from '../../../../assets/images/stripe_logo.svg'
import {addUserSettings, getUserSettings, updateUserSettings} from '../../../../services/api/userSettings'
import {COOKIE_KEY} from '../../../../services/storage/sessionStorage'
import {getLocalStorage} from '../../../../services/storage/localStorage'

const {Option} = Select

const UserSettings = ({col}) => {
    const [_settings, _setSettings] = useState({})
    const [_loading, _setLoading] = useState(true)

    useEffect(() => {
        getSettings()
    }, [])

    const getSettings = async () => {
        const {success, data} = await getUserSettings()
        let defaultPaymentMethod, setting_id = null
        if (success && data.count > 0) {
            defaultPaymentMethod = data.results[0].default_payment_method
            setting_id = data.results[0].id
        } else defaultPaymentMethod = 1
        await _setSettings({..._settings, defaultMethod: defaultPaymentMethod, setting_id: setting_id})
        await _setLoading(false)
    }

    const handleChange = async (value) => {
        await _setSettings({..._settings, defaultMethod: value})
        // console.log(`selected ${value}`)
    }

    const submit = async () => {
        let reqData = {
            default_payment_method: `${_settings.defaultMethod}`
        }
        if (_settings.setting_id != null) {
            const {success, data, message} = await updateUserSettings(reqData, _settings.setting_id)
            if (success && data.id != null) {
                notification.success({
                    message: 'Save Successfully!!'
                })
            } else {
                notification.error({
                    message: message
                })
            }
        } else {
            reqData.user = getLocalStorage(COOKIE_KEY.USER_ID)
            const {success, data, message} = await addUserSettings(reqData)
            if (success && data.id != null) {
                notification.error({
                    message: 'Save Successfully!!'
                })
            } else {
                notification.error({
                    message: message
                })
            }
        }

    }

    return (
        <div className={`col-lg-${col} pb-3 user-settings py-3`}>
            <div className={'flex-horizontal'}>
                <div className={'flex-horizontal my-2'}>
                    <h5 className="px-3">Payment Settings</h5>
                </div>
            </div>
            <div className={'row mx-3'}>
                <div className="col-12">
                    <div className={'flex-horizontal'}>
                        <div className={'flex-horizontal'}>
                            <h6 className="px-0">Default Payment Method</h6>
                        </div>
                        <div className={'flex-horizontal'}>
                            <img alt="" src={paypal} width={50} className={'m-r-10'}/>
                            <img alt="" src={stripe} width={50} className={'m-r-10'}/>
                        </div>
                    </div>
                    {_loading ? (
                        <div className={`col-lg-${col} py-3 text-center`}>
                            <Spin size="large"/>
                        </div>
                    ) : (
                        <Select defaultValue={`${_settings.defaultMethod}`} style={{width: '100%'}}
                                onChange={handleChange}>
                            <Option value="1">PayPal</Option>
                            <Option value="2">Credit Cards (via Stripe)</Option>
                        </Select>
                    )}
                </div>
                <div className={'col-12'}>
                    <button onClick={submit} className="btn btn-primary mt-4 mb-3 btn-sm">Save</button>
                </div>
            </div>
            <hr className={'mx-3'}/>
        </div>
    )
}

export default UserSettings
