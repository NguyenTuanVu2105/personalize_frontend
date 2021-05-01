import React, {useContext, useEffect, useState} from 'react'
import NewProductContext from '../../context/NewProductContext'
import './ProductPricing.scss'
import AppContext from '../../../../AppContext'
import _ from 'lodash'
import {roundPrice} from '../../../pricing/helper/priceCalculate'
import {getDefaultVariantPrice} from '../../../../services/api/seller'
import Pricing from '../../../pricing/Pricing'
import ChangeStepContainer from '../common/ChangeStepContainer'
import StoreSelector from './StoreSelector'
import UploadInfo from "../common/UploadInfo"
import {getAllActiveShops} from "../../../../services/api/shops"
import {setCostDetail} from "../../../../shared/setCostDetail"

const ProductPricing = () => {
    const context = useContext(NewProductContext)
    const {product, stores, setStores, uploadManager, defaultCurrency, costDetails, shippingCosts} = context
    const {setLoading} = useContext(AppContext)
    const [doneInitialPrice, setDoneInitPrice] = useState(false)
    const [, setUseArtwork] = useState(product.abstract && product.abstract.sides.length > 0)

    useEffect(() => {
        const useArtwork = product.abstract && product.abstract.sides.length > 0
        setUseArtwork(useArtwork)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const init = async (stores) => {
        setLoading(true)
        let currencies = stores.length > 0 ? stores.map((shop) => ({
            name: shop.currency,
            exchangeRate: shop.currency_exchange_rate,
            precision: shop.currency_precision
        })) : [defaultCurrency]
        currencies = [...currencies, defaultCurrency]
        currencies = _.uniqBy([...currencies, defaultCurrency], 'name')

        let _variants = (await getDefaultVariantPrice(product.abstract_product_id)).data
        // Increase base cost if number of artwork > 1
        const maxArtwork = product.userProducts.reduce((maxArtwork, userProduct) => {
            let sideHasArtwork = 0
            userProduct.sideLayers.forEach((s) => {
                if (s.layers.length > 0){
                    sideHasArtwork++
                }
            })
            return Math.max(maxArtwork, sideHasArtwork)
        }, 0)
        let extraArtworkCost = product.abstract.meta.pricing_meta.extra_artwork * (Math.max(maxArtwork, 1) - 1)

        //console.log("test", _variants)
        product.variants.forEach((variant) => {
            variant['price'] = {}
            variant.abstract.attributes_value.forEach((attr) => {
                variant[attr.attribute] = attr.id
            })

            const detailCost = costDetails.costs.find(cost => cost.id === variant.abstract.id)
            const shippingInfo = {
                shipping_zones: costDetails.shipping_zones,
                shipping_rates: costDetails.shipping_rates
            }
            setCostDetail(variant, shippingInfo, detailCost)
            const variant_cost = variant.cost
            variant.sku = detailCost.sku
            variant.shipping = variant_cost.detail.map((v) => {
                return {
                    ...v,
                    shipping_zone: v.zone.id,
                    shipping_rate: v.rate.id,
                }
            })
            variant.attributes_value = variant.abstract.attributeValues
            currencies.forEach(currency => {
                const originBaseCost = parseFloat(variant_cost.detail[0].production_cost_base)
                let maxShipping = variant_cost.detail[0].shipping_cost_base
                variant_cost.detail.forEach(cost => {
                    maxShipping = Math.max(maxShipping, cost.shipping_cost_base)
                })
                const baseCostUSD = originBaseCost + extraArtworkCost

                const baseCost = roundPrice(baseCostUSD * currency.exchangeRate, currency.precision)

                let defaultVariantPrice = _variants.find(_variant => _variant.abstract_variant === variant.abstract_variant && _variant.currency === currency.name)

                // (p + shipping + cost per item) * 40% = p
                let tempProfit = (maxShipping + baseCostUSD) * 0.4

                let inputValue = roundPrice(defaultVariantPrice ? defaultVariantPrice.price :
                    (maxShipping + baseCostUSD + tempProfit) * currency.exchangeRate, currency.precision)


                variant['price'][currency.name] = {
                    value: inputValue,
                    inputValue: inputValue,
                    baseCost: baseCost,
                    baseCostUSD: baseCostUSD,
                    originBaseCost: originBaseCost,
                    extraArtworkCost: extraArtworkCost,
                    basePrice: inputValue,
                    advancePrice: inputValue,
                }
            })
        })
        product.zones = costDetails.shipping_zones
        product.abstract['price'] = JSON.parse(JSON.stringify(product.variants[0].price))
        const baseCostUSD = parseFloat(product.variants[0].base_cost) + extraArtworkCost
        currencies.forEach(currency => {
            let inputValue = roundPrice((baseCostUSD + 17.99) * currency.exchangeRate, currency.precision)
            product.abstract.price[currency.name].inputValue = inputValue
            product.abstract.price[currency.name].value = inputValue
        })

        // product.variants.forEach((record, index) => {
        // const mockupInfoId = record.abstract.mockup_info
        // if (useArtwork) {
        //     const side = context.product.abstract.sides[0].type
        //     const mockupInfo = product.abstract.mockup_infos.find(info => info.id === mockupInfoId).preview[side]
        //     record['mockup'] = userProduct ? (
        //             <img src={userProduct.previews[0]} alt={userProduct.title} width="75"/>)
        //         : (<MockUpPreview color={getVariantColor(record.abstract)}
        //                           width="75"
        //                           artworkInfo={artwork}
        //                           unit="px"
        //                           mockupInfo={mockupInfo}
        //                           id={`price-preview-${index}`}/>
        //         )
        // }
        // })

        // product.shops = stores.map(shop => shop.id)
        // console.log(product)
        context.setProduct(product)
        setLoading(false)
        setDoneInitPrice(true)
    }

    useEffect(() => {
        refreshStoresAndPricing()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const {user} = useContext(AppContext)

    const refreshStoresAndPricing = async () => {
        setDoneInitPrice(false)
        setLoading(true)
        let shops

        /* get all shops */
        // if (isInFrame()) {
        //     shops = [getSessionStorage(SESSION_KEY.SHOP)]
        // } else {
        shops = (await getAllActiveShops()).data
        // }
        // console.log(shops)

        if (shops) {
            setStores(shops)
        }

        // find currentShop in list
        let shopDefault = null
        if (user.shop) {
            shopDefault = shops.find(shop => shop.url === user.shop.url)
        }


        // swap currentShop to start of list
        const idx = shops.indexOf(shopDefault)
        if (idx !== -1 && idx !== 0) {
            let tmp = shopDefault
            shops[idx] = shops[0]
            shops[0] = tmp
        }

        await init(shops)
        setLoading(false)
    }

    // console.log("product", product)

    return (
        doneInitialPrice && (
            <div className="step-container full-height d-flex">
                <div className="row no-gutters full-height flex-row">
                    <div className="col-9 full-height" style={{display: 'flex'}}>
                        <Pricing
                            isEdit={false}
                            shopData={stores}
                            context={context}
                            price={product.abstract.price}
                            advance={false}
                            preview={true}
                            shippingDetail={shippingCosts}
                        />
                    </div>
                    <div className="col-3 full-height-border-left">
                        <div className="ph1em">
                            <ChangeStepContainer/>
                        </div>
                        <StoreSelector refreshStoresAndPricing={refreshStoresAndPricing}/>
                    </div>
                    {
                        uploadManager.length > 0
                        && (<UploadInfo/>)
                    }
                </div>
            </div>
        )
    )
}

export default ProductPricing
