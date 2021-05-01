import React, {useContext, useState} from 'react'
import './styles.css'
import {CardCvcElement, CardExpiryElement, CardNumberElement, injectStripe} from 'react-stripe-elements'
import {stripeCard} from '../../../../services/api/stripeCard'
import NewPaymentMethodContext from './../../context/NewPaymentMethodContext'
import visa from '../../../../assets/images/visa.svg'
import mastercard from '../../../../assets/images/mastercard.svg'
import americanexpress from '../../../../assets/images/americanexpress.svg'
import chinaunionpay from '../../../../assets/images/chinaunionpay.svg'
import discover from '../../../../assets/images/discover.svg'
import dinersclub from '../../../../assets/images/dinersclub.svg'
import jcb from '../../../../assets/images/jcb.svg'
import {Banner, Button} from "@shopify/polaris"

let _cardNumberElement
let _cardCvcElement
let _cardExpiryElement

const AddCardForm = (props) => {
    const context = useContext(NewPaymentMethodContext)
    const [_cardName, _setCardName] = useState('')
    const [_banner, _setBanner] = useState({
        display: false,
        content: "",
        status: "critical"
    })
    const [_form, _setForm] = useState({
        status: 'pre-submit',
        btnDisable: false
    })

    const submit = async (ev) => {
        ev.preventDefault()

        _setBanner({display: false, content: 'Please correct your card infomation'})
        _setForm({..._form, btnDisable: true})

        const currentUrl = window.location.href
        const url = new URL(currentUrl)
        const from = url.searchParams.get('from')

        let {token} = await props.stripe.createToken({name: 'Name'})
        _setForm({status: 'submitting'})
        if (token) {
            const {success, data} = await stripeCard({token: token.id, type: token.card.brand, name: _cardName})
            if (success && data.success) {
                _setForm({status: 'pre-submit', btnDisable: false})
                _setCardName('')
                _cardNumberElement.clear()
                _cardCvcElement.clear()
                _cardExpiryElement.clear()
                _setBanner({
                    display: true,
                    content: 'Your card is added successfully. Now you can purchase without fill card info',
                    status: 'success'
                })
                // console.log("Purchase Complete!")
                if (from) {
                    window.location.href = `/u/billings/invoices/${from}`
                }
                context.updateNewMethodAddingStatus()
            } else {
                _setForm({status: 'error'})

                if (data.message.includes('duplicate')) {
                    _setBanner({display: true, content: 'Duplicate type of card', status: 'critical'})
                } else _setBanner({
                    display: true,
                    content: 'Add card failed. Please check your infomation and retry.',
                    status: 'critical'
                })
                // setTimeout(() => {
                //     _setForm({status: 'pre-submit', btnDisable: false})
                // }, 1000)
            }
        } else {
            _setBanner({display: true, content: 'Please correct your card infomation', status: 'critical'})
            _setForm({status: 'pre-submit', btnDisable: false})
        }
    }

    const handleCardNameChange = (name) => {
        _setCardName(name)
    }

    // const addAnotherCard = () => {
    //     _setForm({status: 'pre-submit', btnDisable: false})
    //     _setCardName('')
    // }

    const onDismissBanner = () => {
        _setBanner({
            display: false,
            content: "",
            status: "critical"
        })
    }

    return (
        <div className="checkout col py-3 px-3">
            <form action="">
                <div className="row">
                    <div className="col-12">
                        {
                            _banner.display && (
                                <div className="mb-4">
                                    <Banner status={_banner.status} onDismiss={onDismissBanner}>
                                        <p>
                                            {_banner.content}
                                        </p>
                                    </Banner>
                                </div>
                            )
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 mb-4">
                        <div className={'flex-horizontal'}>
                            <div className={'flex-horizontal'}>
                                <h6 className="px-0">Card Number *</h6>
                            </div>
                            <div className={'flex-horizontal'}>
                                <img alt="" src={visa} width={30} className={'m-r-10'}/>
                                <img alt="" src={mastercard} width={30} className={'m-r-10'}/>
                                <img alt="" src={americanexpress} width={30} className={'m-r-10'}/>
                                <img alt="" src={jcb} width={30} className={'m-r-10'}/>
                                <img alt="" src={dinersclub} width={30} className={'m-r-10'}/>
                                <img alt="" src={discover} width={30} className={'m-r-10'}/>
                                <img alt="" src={chinaunionpay} width={30} className={'m-r-10'}/>
                            </div>
                        </div>
                        <CardNumberElement onReady={(element) => {
                            element.focus()
                            _cardNumberElement = element
                        }}/>
                    </div>
                    <div className="col-6 mb-4">
                        <div className={'flex-horizontal'}>
                            <div className={'flex-horizontal'}>
                                <h6 className="px-0">CVC *</h6>
                            </div>
                        </div>
                        <CardCvcElement onReady={(element) => _cardCvcElement = element}/>
                    </div>
                    <div className="col-6">
                        <div className={'flex-horizontal'}>
                            <div className={'flex-horizontal'}>
                                <h6 className="px-0">Expiration *</h6>
                            </div>
                        </div>
                        <CardExpiryElement onReady={(element) => _cardExpiryElement = element}/>
                    </div>
                    <div className="col-12 mb-4">
                        <div className={'flex-horizontal'}>
                            <div className={'flex-horizontal'}>
                                <h6 className="px-0">Your Card Name</h6>
                            </div>
                        </div>
                        <div>
                            <input type={'text'} className="card-name-input form-control" placeholder={'Your Card Name'}
                                   value={_cardName} onChange={e => handleCardNameChange(e.target.value)}/>
                        </div>
                    </div>
                    {/*<CardElement onReady={(el) => el.focus()} />*/}

                </div>
            </form>
            <div className={'mt3'}>
                <Button primary onClick={submit} disabled={_form.btnDisable}
                        loading={_form.status === 'submitting'}>Submit</Button>
            </div>
        </div>
    )
    //     : _form.status === 'submitting' ? (
    //     <Result
    //         status="success"
    //         title="Checking card info..."
    //         subTitle=""
    //         icon={<Icon type="loading"/>}
    //     />
    // ) : _form.status === 'success' ? (
    //     <Result
    //         status="success"
    //         title="Create customer successfully"
    //         subTitle="Now you can purchase without fill card info"
    //         icon={<Icon type="check-circle"/>}
    //         extra={
    //             <button onClick={addAnotherCard} className="btn btn-primary" disabled={_form.btnDisable}>Add New
    //                 Card</button>
    //         }
    //     />
    // ) : (
    //     <Result
    //         status="error"
    //         title="Create customer failed"
    //         subTitle="Please retry"
    //     />
    // )
}


export default injectStripe(AddCardForm)
