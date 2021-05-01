import React, {useEffect, useState} from "react"
import VariantsTable from "./VariantsTable"
import ShippingCostTable from "../../../pricing/ShippingCostTable"
import ShippingTimeTable from "./ShippingTimeTable"

const ProductProcessAndShipping = ({productMeta, statistic, productAttributes, abstractVariants, shippingCosts, costDetails}) => {

    const dataSources = productMeta.shipping_meta.shipping_zones.map((shipping_zone, index) => {
        if (statistic && statistic.production_time_default) {
            return {...shipping_zone, id: index, avg_progressing_range: statistic.production_time_default}
        } else {
            return {...shipping_zone, id: index}
        }
    })

    const [productVariants, setProductVariants] = useState([])

    useEffect(() => {
        const variants = [...abstractVariants]
        if (costDetails && costDetails.costs) {
            const detailCost = costDetails.costs
            if (detailCost.length > 0 && variants.length > 0) {
                variants.forEach(variant => {
                    const cost = detailCost.find((item) => item.id === variant.id)
                    if (cost) {
                        variant.cost = cost.shipping_costs[0].production_cost_base
                        variant.shipping = cost.shipping_costs
                    }
                })
            }
        }
        setProductVariants(variants)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [costDetails, abstractVariants])

    // console.log(productVariants)

    return (
        <div>
            <p>We will take about {productMeta.shipping_meta.processing_time} to create and print your products.
                Then they will be shipped to your buyers as soon as possible. The production and shipping time
                depends on the product type and buyer shipping area.
                In the table below you can see the production and shipping time that we estimate for each supported
                country/region.</p>
            <VariantsTable child_attributes={productAttributes} variants={productVariants}/>
            <ShippingCostTable shippingDetail={shippingCosts} child_attributes={productAttributes}
                               variants={productVariants}/>
            <ShippingTimeTable dataSources={dataSources}/>
        </div>
    )
}

export default ProductProcessAndShipping