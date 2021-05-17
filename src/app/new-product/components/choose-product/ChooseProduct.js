import React, {useContext, useEffect, useState} from 'react'
import CategoryListSideBar from './CategoryListSidebar'
import ProductList from './ProductList'
import './ChooseProduct.scss'
import NewProductContext from '../../context/NewProductContext'
import {
    getCategories,
    getProductsByCategory,
    getProductsByCategoryWithLocalstorage,
    getProductsBySearchKey,
    getProductsRecentlyUsed
} from '../../../../services/api/products'
import {Autocomplete, Icon} from '@shopify/polaris'
import {SearchMinor} from '@shopify/polaris-icons'
import {getLocalStorage, LOCALSTORAGE_KEY, setLocalStorage} from "../../../../services/storage/localStorage"
import Zenscroll from "zenscroll"
import HomeButton from "../common/HomeButton"
import {calculateShippingTimeRange} from "../../helper/prepareAbstractProductData"
import {isInFrame} from "../../../../services/util/windowUtil"
import _ from "lodash"

const createArrayWithNEmptyObject = (n = 10) => {
    let sample = []
    for (let i = 0; i < n; i++)
        sample.push({})
    return sample
}
const sampleProducts = createArrayWithNEmptyObject()

// const RECOMMENDATION_CATEGORY = {
//     id: 0,
//     title: 'Recommendation',
//     force_active: false,
//     sort_index: 0
// }

const ChooseProduct = (props) => {
    const {disibleChangeStep, setNewProduct} = props
    const [categoryId, setCategoryId] = useState(getLocalStorage(LOCALSTORAGE_KEY.SELECTED_CATEGORY, "0"))
    const [categories, setCategories] = useState(null)
    const [allProducts, setAllProducts] = useState({})
    const [queryValue, setQueryValue] = useState(null)

    const context = useContext(NewProductContext)
    const [products, setProducts] = useState(sampleProducts)


    const getProductInCategory = async (id) => {
        const res = await getProductsByCategory(id)
        let productAllInfo = res.data.child_abstract_products
        productAllInfo = await calculateShippingTimeRange(productAllInfo)
        setProducts(productAllInfo)
        setAllProducts({
            ...allProducts,
            [id]: res.data.child_abstract_products
        })
    }

    const init = async () => {
        const selected_category = getLocalStorage(LOCALSTORAGE_KEY.SELECTED_CATEGORY, "-1")
        let _categories
        const categoriesRes = await getCategories()
        _categories = categoriesRes.data.results
        // _categories.unshift(RECOMMENDATION_CATEGORY)
        _categories = _.orderBy(_categories, ['force_active', 'sort_index'], ['desc', 'asc'])
        if (selected_category !== "-1" && selected_category !== "0") {
            const productsRes = await getProductsByCategoryWithLocalstorage(selected_category)
            const products = await calculateShippingTimeRange(productsRes.data.child_abstract_products)
            setAllProducts({'0': products})
            if (products.length > 0) {
                setCategoryId('' + productsRes.data.id)
                setLocalStorage(LOCALSTORAGE_KEY.SELECTED_CATEGORY, '' + productsRes.data.id)
                // setCategoryId(getLocalStorage(LOCALSTORAGE_KEY.SELECTED_CATEGORY, "0"))
                setProducts(products)
            }
        } else if (selected_category === "0") {
            const recentProductsRes = await getProductsRecentlyUsed()
            const products = await calculateShippingTimeRange(recentProductsRes.data.data.child_abstract_products)
            setAllProducts({'0': products})
            if (products.length > 0) {
                setCategoryId("0")
                setProducts(products)
            }
        } else {
            await onClickCategory(_categories[0].id)
        }
        setCategories(_categories)

    }

    useEffect(() => {
        init().then()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onClickProduct = async (id) => {
        setNewProduct(id)
    }

    const onClickCategory = async (id) => {
        setCategoryId(id)
        setLocalStorage(LOCALSTORAGE_KEY.SELECTED_CATEGORY, id)
        if (allProducts[id] != null) {
            setProducts(allProducts[id])
            // return
        }
        setProducts(sampleProducts)
        if (Number.parseInt(id) !== 0) {
            await getProductInCategory(id)
        } else {
            const res = await getProductsRecentlyUsed()
            const products = await calculateShippingTimeRange(res.data.data.child_abstract_products)
            setProducts(products)
        }

    }

    const getProductSearch = async (value) => {
        if (allProducts[value]) setProducts(await calculateShippingTimeRange(allProducts[value]))
        else {
            const res = await getProductsBySearchKey(value)
            allProducts[value] = await calculateShippingTimeRange(res.data.results)
            setAllProducts(allProducts)
            setProducts(res.data.results)
        }

    }

    const updateText = (value) => {
        setQueryValue(value)
        const element = document.getElementById("topList")
        if (element) {
            const container = document.getElementById("listProduct")
            const myScroller = Zenscroll.createScroller(container)
            myScroller.center(element, 0)
        }
        if (value !== '') {
            getProductSearch(value)
        } else {
            onClickCategory(categoryId)
        }
    }

    const textField = (
        <Autocomplete.TextField
            onChange={updateText}
            value={queryValue}
            prefix={<Icon source={SearchMinor} color="inkLighter"/>}
            placeholder="Search"
        />
    )


    return (
        <div className="row step-container no-gutters">
            <div className="col-9 full-height no-gutters product-list-by-category-container" style={{display: "flex"}}>
                {isInFrame() && (
                    <div id='searchNav' className="row p1em no-gutters" style={{
                        // boxShadow: '6px 5px 5px 1px #ccc',
                        backgroundColor: "#ffffff",
                    }}>
                        <div className='col-12'>
                            {/*<div className='ph1em'>*/}
                            <Autocomplete options={[]} textField={textField}/>
                            {/*</div>*/}
                        </div>
                    </div>
                )}
                {!isInFrame() && (
                    <div id='searchNav' className="row p1em no-gutters" style={{
                        // boxShadow: '6px 5px 5px 1px #ccc',
                        backgroundColor: "#ffffff",
                    }}>
                        {
                            !disibleChangeStep &&  <div className='col-6'>
                                <HomeButton/>
                            </div>
                        }
                        <div className='col-6'>
                            <div className='ph1em' style={{paddingRight: "0.75rem"}}>
                                <Autocomplete options={[]} textField={textField}/>
                            </div>
                        </div>
                    </div>
                )}
                <ProductList products={products} onClickProduct={onClickProduct}/>
            </div>
            <div className="col-3 full-height-border-left no-gutters category-list-sidebar-container">
                <CategoryListSideBar categories={categories} selectedCategoryId={categoryId}
                                     onClick={onClickCategory}/>
            </div>
        </div>
    )
}


export default ChooseProduct
