import React, {useState} from 'react'
import {sendActivationEmail} from '../../../services/api/sendActivationEmail'
import {Banner} from "@shopify/polaris"
import {Modal, notification} from 'antd'

const ActivationEmailRequestButton = () => {
    const [_loading, _setLoading] = useState(false)

    const requestActivationEmail = async () => {
        _setLoading(true)
        const {success, data} = await sendActivationEmail()
        if (success) {
            if (data.success) {
                notification.success({
                    message: data.message
                })
                _setLoading(false)
            } else {
                Modal.error({
                    content: data.message
                })
                _setLoading(false)
            }
        } else {
            Modal.error({
                content: 'An error occurs. Please ty again'
            })
            _setLoading(false)
        }
    }

    return (
        <div className={'mb-3'}>
            <Banner
                status="info"
                action={
                    {
                        content: "Resend Activation Email",
                        onAction: requestActivationEmail,
                        loading: _loading

                    }
                }
                // onDismiss={() => {
                // }}
            >
                <p>
                    It seems that you have't actived your account yet.
                </p>
            </Banner>
        </div>
    )


}

export default ActivationEmailRequestButton
