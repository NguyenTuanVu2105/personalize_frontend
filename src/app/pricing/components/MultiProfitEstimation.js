import React, {useEffect, useState} from "react"
import {numberFormatCurrency} from "../../shared/FormatNumber"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faArrowDown, faArrowUp} from "@fortawesome/free-solid-svg-icons"
import {changePrecision, convertCurrency, roundPrice} from "../helper/priceCalculate"
import {ShippingZoneConfig} from "../../new-product/constants/shippingZoneConfig"
import {Popover} from "antd"

const MultiProfitEstimation = ({currency, variants, shippingDetail, inputValue}) => {
    const [profit, setProfit] = useState({})

    useEffect(() => {
        let profit = {}

        const precision = changePrecision(currency.currentCurrency.precision)

        variants.forEach((variant) => {
            const price = variant.price[currency.currentCurrency.name]
            const productionProfit = parseFloat(price.value) - parseFloat(price.baseCost)
            let minShippingCostUSD = 99999999
            let maxShippingCostUSD = 0
            variant.shipping.forEach(cost => {
                if (parseFloat(cost.shipping_cost_base) > maxShippingCostUSD) {
                    maxShippingCostUSD = parseFloat(cost.shipping_cost_base)
                }
                if (parseFloat(cost.shipping_cost_base) < minShippingCostUSD) {
                    minShippingCostUSD = parseFloat(cost.shipping_cost_base)
                }
            })
            const minShippingCost = convertCurrency(minShippingCostUSD, 1, currency.currentCurrency.exchangeRate, precision)
            const maxShippingCost = convertCurrency(maxShippingCostUSD, 1, currency.currentCurrency.exchangeRate, precision)
            const minProfit = roundPrice(productionProfit - parseFloat(maxShippingCost), precision)
            const maxProfit = roundPrice(productionProfit - parseFloat(minShippingCost), precision)
            profit.min = profit.min ? Math.min(profit.min, minProfit) : minProfit
            profit.max = profit.max ? Math.max(profit.max, maxProfit) : maxProfit

        })
        setProfit(profit)
    }, [currency, variants, inputValue])

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
                    shippingDetail.map((item, index) => {
                        const precision = changePrecision(currency.currentCurrency.precision)
                        const exchangeRate = currency.currentCurrency.exchangeRate
                        let zoneProfit

                        let profit = {}

                        variants.forEach((variant) => {
                            const price = variant.price[currency.currentCurrency.name]
                            const productionProfit = parseFloat(price.value) - parseFloat(price.baseCost)
                            const shipping = variant.shipping.find(cost => cost.zone.id === item.zone.id && cost.rate.id === item.rate.id)
                            const minShippingCost = convertCurrency(shipping.shipping_cost_base, 1, exchangeRate, precision)
                            const maxShippingCost = convertCurrency(shipping.shipping_cost_base, 1, exchangeRate, precision)
                            const minProfit = roundPrice(productionProfit - parseFloat(maxShippingCost), currency.currentCurrency.precision)
                            const maxProfit = roundPrice(productionProfit - parseFloat(minShippingCost), currency.currentCurrency.precision)
                            profit.min = profit.min ? Math.min(profit.min, minProfit) : minProfit
                            profit.max = profit.max ? Math.max(profit.max, maxProfit) : maxProfit
                        })

                        if (profit.min !== item.max) {
                            // const zoneProfit = item.shipping_cost_base.min
                            zoneProfit = (
                                <div>
                                    <span className={"pr-3"}>
                                        {renderProfitEstimate(profit.min)}
                                    </span>
                                    -
                                    <span className={"pl-3"}>
                                        {renderProfitEstimate(profit.max)}
                                    </span>
                                </div>
                            )
                        } else {
                            zoneProfit = (
                                <span>
                                    {renderProfitEstimate((profit.min))}
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

    const profitRangeContent = (
        <div className={"flex-end"} style={{cursor: "help"}}>
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

    return (
        <Popover content={renderContent()}
                 title={(
                     <div className={"p-2 font-weight-bold"}>
                         Estimate profit by zone and rate
                     </div>
                 )}
                 placement={"bottomRight"}>
            {profitRangeContent}
        </Popover>
    )
}

export default MultiProfitEstimation