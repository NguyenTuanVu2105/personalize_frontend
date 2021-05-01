import React from 'react'
import {addNewPaymentMethod, getClientToken} from '../../../../services/api/braintreePayment'
import {notification, Spin} from 'antd'
import './styles.css'
import paypal from 'paypal-checkout'
import braintree from 'braintree-web'
import NewPaymentMethodContext from '../../context/NewPaymentMethodContext'
import {waitForElement} from '../../../../services/util/dom'

export default class BraintreeForm extends React.Component {
    static contextType = NewPaymentMethodContext

    state = {
        clientToken: null
    }

    async componentDidMount() {
        await this.updateClientToken()
        waitForElement('braintree-payment', () => {
            this.insertPaypalButton()
        })
    }

    insertPaypalButton() {
        let context = this.context
        braintree.client.create({
            authorization: this.state.clientToken
        }, function (createErr, clientInstance) {
            braintree.paypalCheckout.create({
                client: clientInstance
            }, function (createErr, paypalCheckoutInstance) {
                if (createErr) {
                    console.error('Error!', createErr)
                    return
                }

                paypal.Button.render({
                    env: 'sandbox', // or 'sandbox'
                    style: {
                        label: 'paypal',
                        size: 'medium'
                    },
                    payment: function () {
                        return paypalCheckoutInstance.createPayment({
                            flow: 'vault'
                        })
                    },
                    onAuthorize: function (data, actions) {
                        return paypalCheckoutInstance.tokenizePayment(data).then(function (payload) {
                            addNewPaymentMethod().then((res) => {
                                if (res.success) {
                                    notification.success({
                                        message: 'Authentication Success',
                                        description:
                                            'Your Braintree account has been integrated successfully',
                                    })
                                    context.updateNewMethodAddingStatus()
                                } else {
                                    notification.error({
                                        message: 'Cannot add payment',
                                        description: res.data.description || 'Please try again or contact administrator to get support',
                                    })
                                }
                            })
                        })
                    },
                    onCancel: function (data) {
                        console.log('Authorization cancelled', JSON.stringify(data, 0, 2))
                    },
                    onError: function (err) {
                        console.error('Authorization error', err)
                    }
                }, '#braintree-payment')
            })
        })
    }

    updateClientToken = async () => {
        const {success, data} = await getClientToken()
        if (success){
            const clientToken = data.client_token
            this.setState({
                clientToken
            })
        }

    }

    render() {
        if (!this.state.clientToken) {
            return (
                <div className="text-center m-t-15"><Spin size="large"/></div>
            )
        } else {
            return (
                <div id={'braintree-payment'}/>
            )
        }
    }
}
