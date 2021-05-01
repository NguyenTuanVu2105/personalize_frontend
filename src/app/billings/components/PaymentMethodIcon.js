import visa from '../../../assets/images/visa.svg'
import mastercard from '../../../assets/images/mastercard.svg'
import americanexpress from '../../../assets/images/americanexpress.svg'
import chinaunionpay from '../../../assets/images/chinaunionpay.svg'
import discover from '../../../assets/images/discover.svg'
import dinersclub from '../../../assets/images/dinersclub.svg'
import jcb from '../../../assets/images/jcb.svg'
import paypal from '../../../assets/images/paypal.svg'
import payoneer from '../../../assets/images/payoneer.png'
import paypal_sm from '../../../assets/images/paypal_sm.svg'
import React from 'react'

const standardName = (name) => {
    return name.toLowerCase().replace(' ', '')
}

export default ({brand}) => {
    const standardBrand = standardName(brand)
    let icon
    switch (standardBrand) {
        case 'visa':
            icon = visa
            break
        case 'mastercard':
            icon = mastercard
            break
        case 'americanexpress':
            icon = americanexpress
            break
        case 'chinaunionpay':
            icon = chinaunionpay
            break
        case 'discover':
            icon = discover
            break
        case 'dinersclub':
            icon = dinersclub
            break
        case 'jcb':
            icon = jcb
            break
        case 'paypal':
            icon = paypal
            break
        case 'payoneer':
            icon = payoneer
            break
        case 'pay_pal_account':
            icon = paypal_sm
            break
        default:
            icon = visa
    }
    return (
        <img src={icon} width="auto" height="100%" alt={standardBrand} className={'m-r-10'}/>
    )
}
