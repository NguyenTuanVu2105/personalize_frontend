import React from 'react'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faArrowDown, faArrowUp} from "@fortawesome/free-solid-svg-icons"
import {numberFormatCurrency} from "../../shared/FormatNumber"
import "./ProfitEstimation.scss"
import {Popover} from 'antd'
import {ShippingZoneConfig} from "../../new-product/constants/shippingZoneConfig"
import {changePrecision, convertCurrency, roundPrice} from "../helper/priceCalculate"

const SingleProfitEstimation = ({
                                    profit, currency, isPopoverDisplay = true,
                                    contentData, isTableCell = false
                                }) => {
    const renderProfitEstimate = (_profit) => {
        const profit = roundPrice(_profit, currency.currentCurrency.precision)
        if (profit === 0) {
            return (
                <span className='zero-profit'>
                    <span>
                        {numberFormatCurrency(0, currency.currentCurrency.name, currency.currentCurrency.precision)}
                    </span>
                </span>
            )
        } else {
            if (profit > 0) {
                return (
                    <span className='positive-profit'>
                        <FontAwesomeIcon icon={faArrowUp} color="#027706" style={{fontSize: 12}}/>&nbsp;
                        <span>
                            {numberFormatCurrency(profit, currency.currentCurrency.name, currency.currentCurrency.precision)}
                        </span>
                    </span>
                )
            } else {
                return (
                    <span className='negative-profit'>
                        <FontAwesomeIcon icon={faArrowDown} color="#DE3618" style={{fontSize: 12}}/>&nbsp;
                        <span>
                            {numberFormatCurrency(Math.abs(profit), currency.currentCurrency.name, currency.currentCurrency.precision)}
                        </span>
                    </span>
                )
            }
        }
    }

    const renderContent = () => {
        return (
            <div>
                {
                    contentData.shippingDetail.map((item, index) => {
                        const precision = changePrecision(currency.currentCurrency.precision)
                        const exchangeRate = currency.currentCurrency.exchangeRate
                        let zoneProfit

                        if (item.shipping_cost_base.min !== item.shipping_cost_base.max) {
                            // const zoneProfit = item.shipping_cost_base.min
                            const minShippingCost = convertCurrency(item.shipping_cost_base.min, 1, exchangeRate, precision)
                            const maxShippingCost = convertCurrency(item.shipping_cost_base.max, 1, exchangeRate, precision)
                            const minProfit = contentData.productionProfit - parseFloat(maxShippingCost)
                            const maxProfit = contentData.productionProfit - parseFloat(minShippingCost)
                            zoneProfit = (
                                <div>
                                    <span className={"pr-3"}>
                                        {renderProfitEstimate(roundPrice(minProfit, currency.currentCurrency.precision))}
                                    </span>
                                    -
                                    <span className={"pl-3"}>
                                        {renderProfitEstimate(roundPrice(maxProfit, currency.currentCurrency.precision))}
                                    </span>
                                </div>
                            )
                        } else {
                            const shippingCost = convertCurrency(item.shipping_cost_base.min, 1, exchangeRate, precision)
                            const profit = contentData.productionProfit - parseFloat(shippingCost)
                            zoneProfit = (
                                <span>
                                    {renderProfitEstimate(roundPrice(profit, currency.currentCurrency.precision))}
                                </span>
                            )
                        }
                        return (
                            <div key={index} className={"flex-start mt-2"}>
                                <div className={"mr-5"}>
                                    <img src={ShippingZoneConfig[item.zone.name].icon}
                                         alt={ShippingZoneConfig[item.zone.name].tooltip}
                                         style={{
                                             width: 16,
                                             height: 16,
                                             marginBottom: 3
                                         }}
                                    />
                                    &nbsp;&nbsp;
                                    {ShippingZoneConfig[item.zone.name].title} - {item.rate.description}
                                </div>
                                <div className={"ml-auto"}>
                                    {zoneProfit}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    const profitRangeContent = isTableCell ? (
        <div className={"profit-range-cell"} style={{cursor: isPopoverDisplay ? "help" : "unset"}}>
            <div>
                From &nbsp;{renderProfitEstimate(profit.min)}
            </div>
            <div>
                to &nbsp;{renderProfitEstimate(profit.max)}
            </div>
        </div>
    ) : (
        <div className={"flex-end"} style={{cursor: isPopoverDisplay ? "help" : "unset"}}>
            <div>
                <span className={"pr-3"}>
                    {renderProfitEstimate(profit.min)}
                </span>
                -
                <span className={"pl-3"}>
                    {renderProfitEstimate(profit.max)}
                </span>
            </div>
        </div>
    )

    return isPopoverDisplay && contentData ? (
        <Popover content={renderContent()}
                 title={(
                     <div className={"p-2 font-weight-bold"}>
                         Estimate profit by zone and rate
                     </div>
                 )}
                 placement={"bottomRight"}>
            {profitRangeContent}
        </Popover>
    ) : (
        <div>
            {profitRangeContent}
        </div>
    )
}

export default SingleProfitEstimation