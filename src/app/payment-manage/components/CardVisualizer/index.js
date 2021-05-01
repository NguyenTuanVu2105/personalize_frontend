import React from 'react'
import PaymentCard from '../../payment-card'

const CardVisualizer = ({bank = 'ffh', type, brand, number, cvv, holderName, expiration, flipped = true}) => {
    return (
        <PaymentCard
            bank={bank}
            model="personnalite"
            type={type}
            brand={brand}
            number={number}
            cvv={cvv}
            holderName={holderName}
            expiration={expiration}
            flipped={flipped}
        />
    )
}

export default CardVisualizer