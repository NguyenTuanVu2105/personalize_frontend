import React from 'react'
import HistoryPiece from './HistoryPiece'

function PriceHistory({ item }) {
    // console.log(item);
    const produceTotalPrice = (amount, currency) => {
        switch (currency) {
            case 'VND':
                return `${parseInt(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${currency}`
            default:
                return `${amount} ${currency}`
        }
    }

    return (
        <>
            <HistoryPiece title="Total base cost" description={`${item.new_obj.total_base_cost} USD`} />
            <HistoryPiece title="Total cost"
                description={item.new_obj.total_cost !== null ? `${item.new_obj.total_cost} USD` : 'N/A'} />
            <HistoryPiece title="Total price" description={produceTotalPrice(item.new_obj.total_price, item.new_obj.currency)} />
        </>
    )
}

export default PriceHistory