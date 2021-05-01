import React from 'react'
import ReactDOM from 'react-dom'
import paypal from 'paypal-checkout'
import {activateBillingAgreement, createBillingAgreement,} from '../../../../services/api/paypalPayment'
import NewPaymentMethodContext from '../../context/NewPaymentMethodContext'
import {Modal, notification} from 'antd'
import {getReactEnv} from '../../../../services/env/getEnv'

const PayPalButton = paypal.Button.driver('react', {React, ReactDOM})
const PAYPAL_ENV = getReactEnv('PAYPAL_ENV')
var payPalError = null

class PaypalForm extends React.Component {
    static contextType = NewPaymentMethodContext
    state = {
        env: PAYPAL_ENV,
        client: {
            sandbox: '_',
            production: '_'
        },
        commit: true,
        style: {
            label: 'pay',
            branding: true, // optional
            size: 'large', // small | medium | large | responsive
            shape: 'rect', // pill | rect
            color: 'gold' // gold | blue | silve | black
        }
    }

    onClick() {
    }

    async payment(data, actions) {
        payPalError = null
        let resp = (await createBillingAgreement()).data
        if (resp.success) {
            return resp.agreement_token
        } else {
            payPalError = resp.message || 'An error has been occurred'
            throw new Error(resp.message || 'An error has been occurred')
        }


    }

    onError(err) {
        Modal.error({
            title: 'An error has been occurred',
            content: payPalError || 'An error has been occurred. Please try again'
        })
    }

    async onAuthorize(data, actions) {
        let {billingToken} = data
        if (!!billingToken) {
            let resp = await activateBillingAgreement(billingToken)
            if (resp.success) {
                let {success} = resp.data
                if (success) {
                    notification.success({
                        message: 'Authentication Success',
                        description:
                            'Your PayPal account has been integrated successfully',
                    })
                    let context = this.context
                    context.updateNewMethodAddingStatus()
                } else {
                    notification.error({
                        message: 'Cannot add payment',
                        description: resp.data.description || 'Please try again or contact administrator to get support',
                    })
                }
            }
        }

    }

    render() {
        return (
            <div className="p5">
                <div className="flex-center">
                    Your payment method will be authorized to&nbsp;<b> MERCHIZE PTE. LTD.</b>
                </div>
                <br/>
                <div className="flex-center">
                    <PayPalButton
                        commit={this.state.commit}
                        env={this.state.env}
                        client={this.state.client}
                        style={this.state.style}
                        payment={(data, actions) => this.payment(data, actions)}
                        onAuthorize={(data, actions) => this.onAuthorize(data, actions)}
                        onError={(err) => this.onError(err)}
                    />
                </div>

            </div>
        )
    }
}

PaypalForm.defaultProps = {
    action: 'buyplan',
    data: {}
}

export default PaypalForm
