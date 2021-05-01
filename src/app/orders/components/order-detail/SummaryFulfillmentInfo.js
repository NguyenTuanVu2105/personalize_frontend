import {numberFormatCurrency} from '../../../shared/FormatNumber'
import React from 'react'

const SummaryFulfillmentInfo = (props) => {
    const {pack} = props
    return (
        <div>
            <div className="row justify-content-end">
                <div className="col-md-2">
                    <h6>Production cost:</h6>
                </div>
                <div className="col-md-2 flex-end">
                    <b>{pack.production_cost > 0 ? numberFormatCurrency(parseFloat(pack.production_cost), pack.currency) : "N/A"}</b>
                </div>
            </div>
            <div className="row justify-content-end">
                <div className="col-md-2">
                    <h6>Shipping cost:</h6>
                </div>
                <div className="col-md-2 flex-end">
                    {pack.shipping_cost ?
                        <b>{Math.round(pack.shipping_cost * 100) === 0 ? 'Free' : numberFormatCurrency(parseFloat(pack.shipping_cost), pack.currency)}</b>
                        : 'N/A'}
                </div>
            </div>
            {parseFloat(pack.discount) !== 0 &&
            <div className="row justify-content-end">
                <div className="col-md-2">
                    <h6>Discount:</h6>
                </div>
                <div className="col-md-2 flex-end" style={{color: 'orange'}}>
                    <b>- {numberFormatCurrency(parseFloat(pack.discount), pack.currency)}</b>
                </div>
            </div>}
            <div className="row justify-content-end">
                <div className="col-md-2">
                    <h6>Total:</h6>
                </div>
                <div className="col-md-2 flex-end">

                    <div>
                        {pack.total_cost ?
                            <b>{numberFormatCurrency(parseFloat(pack.total_cost), pack.currency)}</b> : 'N/A'}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default SummaryFulfillmentInfo
