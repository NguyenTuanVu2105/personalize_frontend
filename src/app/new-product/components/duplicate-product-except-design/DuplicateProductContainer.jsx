import React, {useContext, useEffect, useState} from 'react'
// import Paths from '../../../../routes/Paths'
// import DocTitle from '../../../shared/DocTitle'
// import UserPageContext from '../../../userpage/context/UserPageContext'
import AppContext from '../../../../AppContext'
import {getAUserProductWithAbstract} from '../../../../services/api/seller'
import NewProductContainer from '../NewProductContainer'
import {DUPLICATE} from "../../constants/newproductMode"
import DuplicateInfoView from "../design/components/duplicate-view/DuplicateInfoView"
import {DUPLICATE_STEP_TITLE} from "../../constants/stepTitle"

const DuplicateProductContainer = (props) => {
    const {productId} = props.match.params
    const {setLoading} = useContext(AppContext)

    const [state, setState] = useState(null)


    useEffect(() => {
        _fetchProductInfo(productId).then()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const parseVariantsAndAttributes = (variantSet) => {
        let variantPrices = []
        let attributes = {}

        let attributeSet = {}
        variantSet[0].abstract_variant.attributes_value.forEach(attribute => {
            attributeSet[attribute.attribute_name] = []
        })
        variantSet.forEach(variant => {
            variant.abstract_variant.attributes_value.forEach(attribute => {
                if (!attributeSet[attribute.attribute_name].find(attr => attr.id === attribute.id)) {
                    attributeSet[attribute.attribute_name].push({id: attribute.id, sort_index: attribute.sort_index})
                }
            })

            let prices = {}
            variant.prices.forEach(priceItem => {
                prices[priceItem.currency] = {
                    value: priceItem.value,
                    baseCost: priceItem.base_cost
                }
            })
            variantPrices.push({
                id: variant.abstract_variant.id,
                prices
            })

            // variant.prices.forEach(price => {
            //     variantPrices.push({
            //         currency: price.currency,
            //         price: price.value,
            //         abstract_variant: variant.abstract_variant.id,

            //     })
            // })
        })
        Object.keys(attributeSet).forEach(key => {
            attributes[key] = attributeSet[key]
                .sort((attr1, attr2) => (attr1.sort_index - attr2.sort_index))
                .map(attr => attr.id)
        })

        return {variantPrices, attributes}
    }

    const _fetchProductInfo = async () => {
        setLoading(true)

        // console.log(getLocalStorage(COOKIE_KEY.REFRESH_TOKEN))
        const productsRes = await getAUserProductWithAbstract(productId)
        const {success: productSuccess, data: productsData} = productsRes
        const {user_product: userProduct, abstract_product: abstractProduct} = productsData

        if (!productSuccess)
            return

        let {variantPrices, attributes} = parseVariantsAndAttributes(userProduct.user_product_variant_set)
        setState({
            product: {
                abstract_product_id: userProduct.abstract_product.id,
                step: 0,
                userProducts: [],
                description: userProduct.description,
                attributes,
                shops: userProduct.shop_user_product_set.map(item => item.shop.id),
                // variants,
            },
            variantPrices,
            abstractProduct,
        })

        // setLoading(false)
    }

    // console.log("state.product")
    // console.log(state ? state.product: "1")

    return (
        state ? <NewProductContainer
                modeData={{
                    mode: DUPLICATE,
                    defaultData: state.product,
                    defaultPrices: state.variantPrices,
                    productId: productId,
                    abstractProduct: state.abstractProduct,
                    infoView: <DuplicateInfoView/>,
                    stepTitle: DUPLICATE_STEP_TITLE
                }}
            />
            : <></>
    )
}

export default DuplicateProductContainer
