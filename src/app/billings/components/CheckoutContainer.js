import React, {useEffect, useState} from 'react'
import {formatPrice} from '../../../services/util/string'
import {InvoiceStatus} from './InvoiceStatus'
import {listCard} from '../../../services/api/listCard'
import PaymentMethodIcon from './PaymentMethodIcon'
import {formatVerboseDatetime} from '../../../services/util/datetime'
import {Card} from '@shopify/polaris'
import {notification} from 'antd'

const PaymentInfoItem = ({label, value, textBold = false}) => {
    return <div style={textBold ? {fontWeight: '500'} : null}>
        <div className={'flex-horizontal'} style={{margin: '.5em 0'}}>
            <div>
                <div style={{color: '#454F5B'}}>{label}:</div>
            </div>
            <div>{value}</div>
        </div>
    </div>
}

export default ({status, totalCost, paidTime, payment_method}) => {
    const [, _setCards] = useState([])

    useEffect(() => {
        getCards()
    }, [])

    const getCards = async () => {
        const {success, data} = await listCard()
        if (success && data.success) {
            let cards = data.data
            _setCards(cards)
        } else {
            notification.error({
                message: 'An error occurs. Please refresh and try again'
            })
        }
    }
    return (
        <Card.Section title={'Payment'}>
            <div className={'m-t-15'} >
                <PaymentInfoItem label={'Total cost'} value={`${formatPrice(parseFloat(totalCost))} USD`}
                                 textBold={true}/>
                {status === InvoiceStatus.PAID ?
                    (
                        <div>
                            <PaymentInfoItem label={'Paid at'}
                                             value={formatVerboseDatetime(paidTime)}/>
                            <PaymentInfoItem label={'Paid by'}
                                             value={
                                                 payment_method ?
                                                 <div style={{height: 30, display: 'flex', justifyContent: 'start', alignItems: "center"}}>
                                                     <PaymentMethodIcon brand={payment_method.type}/>
                                                     {payment_method.email ?
                                                         <span>{payment_method.email}</span> :
                                                         <span>{payment_method.last4
                                                             ? `**** **** **** ${payment_method.last4}`
                                                             :
                                                             payment_method.email || payment_method.label}</span>
                                                     }
                                                 </div> : null}/>
                        </div>
                    ) : null
                }
            </div>
        </Card.Section>
    )
}
