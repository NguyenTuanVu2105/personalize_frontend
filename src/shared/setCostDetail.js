const setCostDetail = (variant, shippingInfo, detailCost) => {
    let costDetail = []
    detailCost.shipping_costs.forEach(shipping => {
        const shippingZone = shippingInfo.shipping_zones.find(zone => zone.id === shipping.shipping_zone)
        const shippingRate = shippingInfo.shipping_rates.find(rate => rate.id === shipping.shipping_rate)
        let detail = {
            id: shipping.id,
            zone: shippingZone,
            rate: shippingRate,
            shipping_cost_base: shipping.shipping_cost_base,
            shipping_cost_additional: shipping.shipping_cost_additional,
            production_cost_base: shipping.production_cost_base,
            production_cost_additional: shipping.production_cost_additional,
        }
        costDetail.push(detail)
    })

    const shipping = minAndMaxPrice(costDetail, "shipping")
    const production = minAndMaxPrice(costDetail, "production")
    variant['cost'] = {}

    variant.cost.detail = costDetail
    variant.cost.shipping = shipping
    variant.cost.production = production
}

const getShippingCostDetail = (shippingCosts, shippingZones, shippingRates) => {
    const result = []
    shippingCosts.forEach((variant) => {
        variant.shipping_costs.forEach((cost) => {
            const shippingZone = shippingZones.find(zone => zone.id === cost.shipping_zone)
            const shippingRate = shippingRates.find(rate => rate.id === cost.shipping_rate)
            const detail = result.find((item) => item.rate.id === shippingRate.id && item.zone.id === shippingZone.id)
            if (detail) {
                detail.shipping_cost_base = recalculateMinAndMax(detail.shipping_cost_base, cost.shipping_cost_base)
                detail.shipping_cost_additional = recalculateMinAndMax(detail.shipping_cost_additional, cost.shipping_cost_additional)
            } else {
                const item = {
                    zone: shippingZone,
                    rate: shippingRate,
                    shipping_cost_base: {
                        min: cost.shipping_cost_base,
                        max: cost.shipping_cost_base
                    },
                    shipping_cost_additional: {
                        min: cost.shipping_cost_additional,
                        max: cost.shipping_cost_additional
                    }
                }
                result.push(item)
            }
        })
    })

    return result
}

const recalculateMinAndMax = (origin, newValue) => {
    const result = {...origin}
    result.min = parseFloat(result.min) > parseFloat(newValue) ? newValue : result.min
    result.max = parseFloat(result.max) < parseFloat(newValue) ? newValue : result.max
    return result
}


const minAndMaxPrice = (items, key) => {
    let min = items[0][key + "_cost_base"]
    let max = items[0][key + "_cost_base"]
    if (items.length > 1) {
        items.forEach(item => {
            const cost = parseFloat(item[key + "_cost_base"])
            if (cost > max) {
                max = cost
            }
            if (cost < min) {
                min = cost
            }
        })
    }
    return {min, max}
}

export {setCostDetail, getShippingCostDetail}