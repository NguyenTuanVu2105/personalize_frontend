import ChooseProduct from '../components/choose-product/ChooseProduct'
import ProductPricing from '../components/pricing/ProductPricing'
import React from 'react'
import ProductDesignContainer from "../components/design/ProductDesignContainer"

export const NORMAL_STEPS = [
    {
        index: 0,
        title: 'Products',
        content: <ChooseProduct/>,
    },
    {
        index: 1,
        title: 'Design',
        content: <ProductDesignContainer/>,
    },
    {
        index: 2,
        title: 'Pricing',
        content: <ProductPricing/>,
    }
]

export const SAMPLE_PRODUCT_CUSTOM_STEPS = [
    {
        index: 0,
        title: 'Design',
        content: <ProductDesignContainer/>,
    },
    {
        index: 1,
        title: 'Pricing',
        content: <ProductPricing/>,
    }
]

// export const DUPLICATE_STEPS = [
//     {
//         index: 0,
//         title: 'Variant & Design',
//         content: <ProductDesignContainer/>,
//     }
// ]
//
// export const ECOMMERCE_VARIANT_STEPS = [
//     {
//         index: 0,
//         title: 'Products',
//         content: <ChooseProduct/>,
//     },
//     {
//         index: 1,
//         title: 'Variant & Design',
//         content: <ProductDesignContainer/>,
//     },
//     {
//         index: 2,
//         title: 'Pricing',
//         content: <ProductPricing/>,
//     }
// ]
