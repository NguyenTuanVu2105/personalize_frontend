import React, {useEffect, useState} from 'react'
import Pricing from '../../../pricing/Pricing'
import _ from 'lodash'
import {Modal} from '@shopify/polaris'
import {roundPrice} from '../../../pricing/helper/priceCalculate'
import {getDetailCost} from "../../../../services/api/products"
import {getShippingCostDetail, setCostDetail} from "../../../../shared/setCostDetail"

const PricingModal = (props) => {
    const {productInfo, visible, closeModal, submitModal, defaultCurrency} = props

    const shopData = productInfo.shop_user_product_set.map(item => item.shop)
    // const preview = (<img alt='preview' style={{width: '100%'}} src={productInfo.preview_image_url}/>)
    const [priceInit, setPriceInit] = useState(false)
    const [loading, setLoading] = useState(true)
    const [shippingCosts, setShippingCosts] = useState([])

    const [product, setProduct] = useState({
        variants: [],
        abstract: {
            child_attributes: productInfo.child_attributes_data
        },
        attributes: {}
    })

    const init = async () => {
        setLoading(true)
        setPriceInit(false)
        let variants = productInfo.user_product_variant_set.map(item => {
            const attributes = item.abstract_variant.attributes_value.map(it => it.id)
            return {
                abstract: item.abstract_variant,
                price: {},
                id: item.id,
                additionalCost: item.additionalCost,
                shipping: item.shipping,
                sku: item.sku,
                attributes_value: attributes
            }
        })

        let attributes = {}

        productInfo.user_product_variant_set.forEach((item) => {
            item.abstract_variant.attributes_value.forEach((it) => {
                attributes[it.attribute_name] = []
            })
        })

        const getNotEmptySide = () => {
            const sideLayers = productInfo.abstract_product.combine_fusion === true ?
                productInfo.side_artworks.filter(i => !i.send_to_fulfill) :
                productInfo.side_artworks
            const notEmptySides = sideLayers.filter(i => i.fused_artwork && i.fused_artwork.layers.length > 0)
            return notEmptySides.length
        }
        const sideHasArtwork = getNotEmptySide()

        const extraArtworkCost = productInfo.abstract_product.meta.pricing_meta.extra_artwork * (Math.max(sideHasArtwork, 1) - 1)

        const currencies = {}
        productInfo.shop_user_product_set.forEach(shop_user_product => {
            const shop = shop_user_product.shop
            currencies[shop.currency] = {
                name: shop.currency,
                exchangeRate: shop.currency_exchange_rate,
                precision: shop.currency_precision
            }
        })

        const detailCosts = (await getDetailCost(productInfo.abstract_product.id)).data

        if (detailCosts) {
            const shippingCosts = detailCosts.costs
            const shippingZones = detailCosts.shipping_zones
            const shippingRates = detailCosts.shipping_rates
            const result = getShippingCostDetail(shippingCosts, shippingZones, shippingRates)
            setShippingCosts(result)
        }

        if (_.isEmpty(currencies)){
            currencies[defaultCurrency.name] = defaultCurrency
        }

        // console.log("currencies", currencies)

        productInfo.user_product_variant_set.forEach((item, index) => {
            // console.log("item")
            // console.log(item)
            item.abstract_variant.attributes_value.forEach((attr) => {
                variants[index][attr.attribute] = attr.id
            })

            const detailCost = detailCosts.costs.find(cost => cost.sku === item.abstract_variant.sku)
            const shippingInfo = {
                shipping_zones: detailCosts.shipping_zones,
                shipping_rates: detailCosts.shipping_rates
            }
            setCostDetail(variants[index], shippingInfo, detailCost)

            const variant_cost = variants[index].cost
            item.prices.forEach(it => {
                if (!currencies[it.currency]) return

                const originBaseCost = parseFloat(variant_cost.detail[0].production_cost_base)

                const baseCostUSD = originBaseCost + extraArtworkCost

                const baseCost = roundPrice(baseCostUSD * currencies[it.currency].exchangeRate, currencies[it.currency].precision)

                variants[index].price[it.currency] = {
                    value: parseFloat(it.value),
                    inputValue: parseFloat(it.value),
                    baseCost: baseCost,
                    baseCostUSD: baseCostUSD,
                    originBaseCost: originBaseCost,
                    extraArtworkCost: extraArtworkCost
                }
            })

            variants[index]['additionalCost'] = parseFloat(detailCost.additional_cost)
            if (item.mockup_per_side.length > 0) variants[index]['mockup'] =
                <img style={{width: '100%'}} alt='mockup' src={item.mockup_per_side[0].mockup_url}/>
            item.abstract_variant.attributes_value.forEach((item) => {
                attributes[item.attribute_name].push(item.id)
            })
            variants[index]['orderIndex'] = index
        })

        _.map(attributes, (att, key) => {
            attributes[key] = _.uniq(att)
        })
        setProduct({
            variants: variants,
            abstract: {
                child_attributes: productInfo.child_attributes_data
            },
            attributes: attributes
        })
        setPriceInit(true)
        setLoading(false)
    }

    useEffect(()=>{
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    // console.log(product)


    return <Modal
        large={true}
        open={visible}
        onClose={closeModal}
        loading={loading}
        title="Edit Pricing Product"
        primaryAction={{
            content: "Save",
            onAction: submitModal(product),
        }}
        sectioned
    >
        {
            priceInit && (
                <Pricing shopData={shopData}
                         title={productInfo.title}
                         preview={false}
                         shippingDetail={shippingCosts}
                         context={{
                             product: product, setProduct: setProduct, defaultCurrency: defaultCurrency
                         }}
                         isEdit={true}
                         advance={true}
                         padding={false}/>
            )
        }
    </Modal>
}

export default PricingModal
