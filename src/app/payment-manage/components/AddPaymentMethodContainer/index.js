import React, {useCallback, useState} from 'react'
import {Heading, Tabs} from '@shopify/polaris'
import 'react-credit-cards/es/styles-compiled.css'
import PaypalVaultForm from '../PaypalVaultedCardForm'
import visa from '../../../../assets/images/visa.svg'
import mastercard from '../../../../assets/images/mastercard.svg'
import Tooltip from 'antd/es/tooltip'
import PaymentMethodIcon from '../../../billings/components/PaymentMethodIcon'
import PaypalForm from '../PaypalForm'


// const {TabPane} = Tabs

const AddPaymentMethodContainer = (props) => {
    const [selected, setSelected] = useState(0)

    const {col} = props

    const handleTabChange = useCallback(
        (selectedTabIndex) => setSelected(selectedTabIndex),
        [],
    )

    const tabs = [
        {
            id: 'paypal-vault-card-form',
            content: (<Tooltip title={'Pay with Debit/Credit Card'}>
                <img alt="visa" src={visa} height={30} className={'m-r-10'}/>
                <img alt="master" src={mastercard} height={30} className={'m-r-10'}/>
            </Tooltip>),
            panelID: 'paypal-vaulted-card',
            component: <PaypalVaultForm/>
        },
        {
            id: 'paypal-account',
            content: (<Tooltip title={'Pay with PayPal'}>
                <div style={{height: '30px'}}>
                    <PaymentMethodIcon brand="paypal"/>
                </div>
            </Tooltip>),
            panelID: 'paypal-account',
            component: <PaypalForm/>
        },
        // {
        //     id: 'payoneer',
        //     content: <Tooltip title={'Pay with Payoneer'}>
        //         <div style={{height: '30px'}}>
        //             <PaymentMethodIcon brand="payoneer"/>
        //         </div>
        //
        //     </Tooltip>,
        //     panelID: 'payoneer',
        //     component: <PayoneerForm {...props}/>
        // }
    ]

    return (
        <div className={`col-lg-${col}`} style={{minHeight: '505px'}}>
            <div className={'flex-horizontal'}>
                <div className={'flex-horizontal my-2'}>
                    <Heading element="h1">Add new payment method</Heading>
                </div>
            </div>
            <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
                <div className={'mt-3 step-add-payment-method'}>
                    {tabs[selected].component}
                </div>
            </Tabs>
        </div>
    )
}

export default AddPaymentMethodContainer
