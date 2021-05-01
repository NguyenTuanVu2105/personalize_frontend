import {numberFormatCurrency} from "../app/shared/FormatNumber"
import React from "react"

const VALUE_ALL = -1

export const displayCostSimple = (number) => {
    if (parseFloat(number) === 0) {
        return "Free"
    } else {
        return "From " + numberFormatCurrency(number)
    }
}

const displayCost = (number) => {
    if (parseFloat(number) === 0) {
        return "Free"
    } else {
        return numberFormatCurrency(number)
    }
}

export const displayCostMinMax = (cost) => {
    if (cost) {
        const min = parseFloat(cost.min)
        const max = parseFloat(cost.max)
        if (min && max) {
            if (min === max) {
                return displayCost(min)
            } else {
                return `From ${numberFormatCurrency(min)} to ${numberFormatCurrency(max)}`
            }
        } else {
            return "Free"
        }

    } else {
        return "Free"
    }
}


export const renderCost = (cost, key) => {
    if (cost) {
        const min = parseFloat(cost[key].min)
        const max = parseFloat(cost[key].max)
        if (min === max) {
            return displayCostSimple(min)
        } else {
            if (min === 0) {
                return `<${displayCostSimple(max)}`
            } else {
                return `${displayCostSimple(min)}~${displayCostSimple(max)}`
            }
        }
    } else {
        return "Free"
    }
}


export const contentShippingCost = (cost, zone) => {
    if (cost.detail) {
        if (cost.detail.length > 0) {
            const min = parseFloat(cost.shipping.min)
            const max = parseFloat(cost.shipping.max)
            if ((min === max) && (min === 0)) {
                return (
                    <b>Free ship</b>
                )
            } else {
                if (zone && zone.info.id !== VALUE_ALL) {
                    const filter = cost.detail.filter(cost => cost.zone.id === zone.info.id)
                    return (
                        filter.map(detail => {
                            return (
                                <div key={detail.id} className={"p-3"}>
                                    <b style={{color: 'darkorange'}}>{detail.rate.description}:</b>
                                    <b>
                                        &nbsp;&nbsp;{displayCostSimple(detail.shipping_cost_base)}
                                    </b>
                                    {/*<p>*/}
                                    {/*    <b>Additional cost:</b>&nbsp;{displayCost(detail.shipping_cost_additional)}*/}
                                    {/*</p>*/}
                                </div>
                            )
                        })
                    )
                } else {
                    return (
                        (cost.detail.map(detail => {
                                return (
                                    <div key={detail.id} className={"p-3"}>
                                        <b style={{color: 'darkorange'}}>{detail.zone.description + " " + detail.rate.description}:</b>
                                        <b>
                                            &nbsp;&nbsp;{displayCostSimple(detail.shipping_cost_base)}
                                        </b>
                                        {/*<p>*/}
                                        {/*    <b>Additional cost:</b>&nbsp;{displayCost(detail.shipping_cost_additional)}*/}
                                        {/*</p>*/}
                                    </div>
                                )
                            })
                        )
                    )
                }
            }
        } else {
            return (
                <b>Free ship</b>
            )
        }
    } else {
        return (
            <b>Free ship</b>
        )
    }
}

export const contentBaseCost = (cost) => {
    if (cost.detail) {
        if (cost.detail.length > 0) {
            if (cost.detail[0].production_cost_base === 0) {
                return (
                    <b>{displayCostSimple(0)}</b>
                )
            } else {
                return (
                    <b>{displayCostSimple(cost.detail[0].production_cost_base)}</b>
                )
            }
        } else {
            return (
                <b>{displayCostSimple(0)}</b>
            )
        }
    } else {
        return (
            <b>{displayCostSimple(0)}</b>
        )
    }
}
