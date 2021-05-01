import React from 'react'
import './styles.css'
import {PayPalButton} from './react-paypal-button-v2'
import {getClientCredentials,} from '../../../../services/api/paypalPayment'
import {captureOrder, getVaultOrder} from '../../../../services/api/paypalVaultPayment'
import NewPaymentMethodContext from '../../context/NewPaymentMethodContext'
import {Modal, notification} from 'antd'
import {getReactEnv} from '../../../../services/env/getEnv'

const ERROR_DESCRIPTION = {
    'CHARGE_FAILED': 'Cannot process payment. Please check your credit card and your balance',
    'CHECK_FAILED': 'Something wrong when saving your card. Please try again',
    'ERROR': 'Something wrong. Please contact support'

}
const PAYPAL_ENV = getReactEnv('PAYPAL_ENV')

export default class PaypalVaultForm extends React.Component {
    static contextType = NewPaymentMethodContext


    state = {
        env: PAYPAL_ENV,
        clientId: null,
        clientToken: null,
        intent: 'capture',
        commit: true,
        vault: false,
        disableFunding: 'bancontact,credit',
        style: {
            size: 'large', // small | medium | large | responsive
            layout: 'vertical',
            color: 'gold', // gold | blue | silve | black
            shape: 'rect', // pill | rect
            label: 'pay',
            // height: 50,
        },
    }

    handleInputFocus = (e) => {
        this.setState({focus: e.target.name})
    }

    handleInputChange = (e) => {
        const {name, value} = e.target

        this.setState({[name]: value})
    }

    updateClientCredentials = async () => {
        let resp = await getClientCredentials()
        if (resp.success) {
            let {success, client_id: clientId, customer_token: clientToken} = resp.data
            if (success) {
                this.setState({clientId, clientToken})
                this.setPageLoading(false)
            }
        }
    }

    setPageLoading = (status) => {
        this.context.setLoading(status)
    }

    fetchVaultOrder = async () => {
        let resp = await getVaultOrder()
        if (resp.success) {
            let {success, order_id, message} = resp.data
            if (success) {
                return {
                    success: true,
                    order_id: order_id,
                }
            } else {
                return {
                    success: false,
                    message: message
                }
            }
        } else {
            return {
                success: false,
                message: "Failed to create Vault Order, please contact support for help"
            }
        }
    }

    captureVaultOrder = async (orderId) => {
        let resp = await captureOrder(orderId)
        if (resp.success) {
            let {success} = resp.data
            if (success) {
                notification.success({
                    message: 'Authentication Success',
                    description:
                        'Your credit card has been integrated successfully',
                })
            } else {
                Modal.error({
                    title: 'An error occurred',
                    content: (
                        <div>
                            <p>{ERROR_DESCRIPTION[resp.data.error]}</p>
                        </div>
                    ),
                    onOk() {
                    },
                })

            }
        }
    }

    componentDidMount() {
        this.updateClientCredentials()
    }

    handleSuccessResult = () => {
        let context = this.context
        context.updateNewMethodAddingStatus()
    }

    render() {
        let {clientId, clientToken} = this.state
        return (
            <div id="paypal-vaulted-card-form-container" className={'flex-center'}>
                {clientToken &&
                <div>
                    <div className="flex-center">
                        Your payment method will be authorized to&nbsp;<b> MERCHIZE PTE. LTD.</b>
                    </div>
                    <div className="flex-center">
                        <PayPalButton
                            options={{clientId}}
                            clientToken={clientToken}
                            getVaultOrderId={this.fetchVaultOrder}
                            triggerCaptureOrder={this.captureVaultOrder}
                            setLoading={this.setPageLoading}
                            onSuccess={this.handleSuccessResult}
                        />
                    </div>

                </div>
                }
            </div>
        )
    }
}
