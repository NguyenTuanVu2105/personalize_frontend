import React from 'react'
import CardVisualizer from '../CardVisualizer'

const DetailCardContent = ({card}) => {

    const standardName = (name) => {
        return name.toLowerCase().replace(' ', '')
    }

    return (
        <div className="row">
            {card.map((item, index) => (
                    <div key={index} className="col-lg-3 p-3">
                        <CardVisualizer bank="ffh"
                                        model="personnalite"
                                        type="black"
                                        brand={standardName(item.type)}
                                        number={`**** **** **** ${item.last4}`}
                                        cvv="202"
                                        holderName={item.card_name.toUpperCase()}
                                        expiration={`${item.exp_month}/${item.exp_year}`}
                                        flipped={false}/>
                    </div>
                )
            )}
        </div>

    )
}


export default DetailCardContent
