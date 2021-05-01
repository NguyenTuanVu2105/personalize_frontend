import React from 'react'
import PropTypes from 'prop-types'
import {Modal} from 'antd'
import visa from '../../../../assets/images/visa.svg'
import mastercard from '../../../../assets/images/mastercard.svg'

class PayPalButton extends React.Component {
    static propTypes = {
        amount: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
        ]),
        currency: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
        ]),
        shippingPreference: PropTypes.string,
        onSuccess: PropTypes.func,
        catchError: PropTypes.func,
        onError: PropTypes.func,
        createOrder: PropTypes.func,
        createSubscription: PropTypes.func,
        onApprove: PropTypes.func,
        style: PropTypes.object,
        options: PropTypes.shape({
            clientId: PropTypes.string,
            merchantId: PropTypes.string,
            currency: PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string,
            ]),
            intent: PropTypes.string,
            commit: PropTypes.oneOfType([
                PropTypes.bool,
                PropTypes.string
            ]),
            vault: PropTypes.oneOfType([
                PropTypes.bool,
                PropTypes.string
            ]),
            component: PropTypes.string,
            disableFunding: PropTypes.string,
            disableCard: PropTypes.string,
            integrationDate: PropTypes.string,
            locale: PropTypes.string,
            buyerCountry: PropTypes.string,
            debug: PropTypes.oneOfType([
                PropTypes.bool,
                PropTypes.string
            ])
        }),
        onButtonReady: PropTypes.func,
    }

    static defaultProps = {
        style: {},
        options: {
            clientId: 'sb',
            currency: 'USD'
        },
        shippingPreference: 'GET_FROM_FILE',
    }

    constructor(props) {
        super(props)

        this.state = {
            isSdkReady: false,
            order_id: null
        }
    }

    componentDidMount() {
        if (
            typeof window !== 'undefined' &&
            window !== undefined &&
            window.paypal === undefined
        ) {
            this.addPaypalSdk()
        } else if (
            typeof window !== 'undefined' &&
            window !== undefined &&
            window.paypal !== undefined &&
            this.props.onButtonReady
        ) {
            this.props.onButtonReady()
        }
    }

    initializePaypal() {
        const {isSdkReady} = this.state
        const that = this

        if (
            !isSdkReady &&
            (typeof window === 'undefined' || window.paypal === undefined)
        ) {
            return null
        }

        if (window.paypal.HostedFields.isEligible()) {
            window.paypal.HostedFields.render({
                createOrder: function () {
                    that.props.setLoading(true)
                    return that.state.order_id
                },
                styles: {
                    'input': {
                        'font-size': '14px',
                        'color': '#3a3a3a'
                    },
                    ':focus': {
                        'color': 'black'
                    }
                },
                fields: {
                    number: {
                        selector: '#commerce-paypal-card-number',
                        placeholder: 'card number'
                    },
                    cvv: {
                        selector: '#commerce-paypal-cvv',
                        placeholder: 'card security number'
                    },
                    expirationDate: {
                        selector: '#commerce-paypal-expiration-date',
                        placeholder: 'MM/YYYY'
                    }
                }
            }).then(function (hf) {
                document.querySelector('#paypal-card-form').addEventListener('submit', async function (e) {
                    e.preventDefault()
                    that.props.setLoading(true)
                    let response = await that.props.getVaultOrderId()
                    if (!response.success) {
                        that.props.setLoading(false)
                        Modal.error({
                            title: 'Failed to create Vault Order',
                            content: (
                                <div>
                                    <p>{response.message}</p>
                                </div>
                            ),
                            onOk() {
                            },
                        })
                    } else {
                        that.setState({order_id: response.order_id})
                        hf.submit({
                            vault: true,
                        }).then(function ({orderId}) {
                            that.props.setLoading(false)
                            Modal.confirm({
                                title: 'Vault your credit/debit card?',
                                content: 'By click “Agree and Continue” button below, you authorize vaulting to your Visa, MasterCard card.  You will be charged the amount indicated total costs of your orders fulfilled by PrintHolo.  To verify and vault your credit/debit card, PrintHolo will make a small charge (at most 1$) after you authorize.',
                                onOk() {
                                    that.props.setLoading(true)
                                    that.props.triggerCaptureOrder(orderId).then(() => {
                                        that.props.onSuccess()
                                        that.props.setLoading(false)
                                    })
                                },
                                okText: 'Agree and Continue',
                                onCancel() {
                                    console.log('Cancel')
                                },
                            })

                        }).catch(errors => {
                            const error = errors.details[0]
                            Modal.error({
                                title: 'ERROR',
                                content: (
                                    <div>
                                        <p>{`${error.issue}: ${error.description}`}</p>
                                    </div>
                                ),
                                onOk() {
                                },
                            })
                            that.props.setLoading(false)
                        })
                    }
                })
            }).catch((err) => {

            })
        }
    }

    render() {
        this.initializePaypal()


        return (
            <div className="App-payment">
                <form ref={c => (this.form = c)} id={'paypal-card-form'}>
                    <label htmlFor='commerce-paypal-card-number'>Card Number &nbsp;
                        <img alt="" src={visa} height={25} className={'m-r-10'}/>
                        <img alt="" src={mastercard} height={25} className={'m-r-10'}/>
                    </label>
                    <div id='commerce-paypal-card-number' className='card_field'></div>
                    <div>
                        <label htmlFor='commerce-paypal-expiration-date'>Expiration Date</label>
                        <div id='commerce-paypal-expiration-date' className='card_field'></div>
                    </div>
                    <div>
                        <label htmlFor='commerce-paypal-cvv'>CVV</label>
                        <div id='commerce-paypal-cvv' className='card_field'></div>
                    </div>
                    <div className="form-actions">
                        <button className="btn">Add Debit or Credit Card</button>
                    </div>
                </form>
            </div>
        )
    }

    addPaypalSdk() {
        const {options, onButtonReady, clientToken} = this.props
        const queryParams = ['components=buttons,hosted-fields']

        // replacing camelCase with dashes
        Object.keys(options).forEach(k => {
            const name = k.split(/(?=[A-Z])/).join('-').toLowerCase()
            queryParams.push(`${name}=${options[k]}`)
        })

        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = `https://www.paypal.com/sdk/js?${queryParams.join('&')}`
        script.setAttribute('data-client-token', clientToken)
        script.setAttribute('data-enable-3ds', '')
        script.async = true
        script.onload = () => {
            this.setState({isSdkReady: true})

            if (onButtonReady) {
                onButtonReady()
            }
        }
        script.onerror = () => {
            throw new Error('Paypal SDK could not be loaded.')
        }

        document.body.appendChild(script)
    }
}

export {PayPalButton}
