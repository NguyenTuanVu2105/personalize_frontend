import React, {useContext, useEffect, useState} from 'react'

import NewProductContext from '../../context/NewProductContext'
import NewProductDesignContext from './context/NewProductDesignContext'
import {getAProduct, logErrorProduct} from '../../../../services/api/products'
import AppContext from '../../../../AppContext'
import './ProductDesignContainer.scss'
import DesignContainer from './components/DesignContainer'
import {DndProvider} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import PreviewArea from "./components/non-artwork-view/PreviewArea"
import {getMockupInfo} from "../../helper/getMockupInfo"
import _ from "lodash"

const MAX_RELOAD = 3

const ProductDesignContainer = function () {
    const {
        product,
        setProduct,
        updateAttributes,
        isProductValid,
        isEcommerceVariant,
        fetchCost,
        modeData,
        reloadVariants
    } = useContext(NewProductContext)
    const {defaultData, abstractProduct} = modeData // Duplicate data
    const {ecommerceVariant} = modeData // ecommerce variant data
    const {setLoading} = useContext(AppContext)

    const useArtwork = product.abstract && product.abstract.sides.length > 0

    // console.log("product")
    // console.log(product)

    const [designState, _setDesignState] = useState({
        currentVariant: null,
        lastVariant: null,
        currentSideId: 0,
        currentProductIndex: 0,
        currentLayerIndex: -1,
    })

    const [frameScale, setFrameScale] = useState(1)

    const [viewState, setViewState] = useState()

    useEffect(() => {
        reselectLayerIndex()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [designState.currentSideId, designState.currentProductIndex])

    const reselectLayerIndex = () => {
        const curProduct = product.userProducts[designState.currentProductIndex]
        if (curProduct) {
            const curSideLayer = curProduct.sideLayers.find((s) => s.side.id === designState.currentSideId)
            let lastIndex = -1
            if (curSideLayer) {
                curSideLayer.layers.forEach((layer) => {
                    lastIndex = Math.max(layer.layerIndex, lastIndex)
                })
            }
            setDesignState({currentLayerIndex: lastIndex})
        }
    }

    const setDesignState = (newState) => {
        _setDesignState(oldState => ({...oldState, ...newState}))
    }

    const setCurrentColor = (color, isPreview = false) => {
        const variant = product.abstract.abstract_product_variants
            .find(variant => variant.attributes_value.some(value => value.id === color))
        setDesignState({...designState, currentVariant: variant, ...(isPreview ? {} : {lastVariant: variant})})
    }

    const resetCurrentColor = () => {
        _setDesignState(_designState => ({..._designState, currentVariant: _designState.lastVariant}))
    }

    const currentProductIsAbleToPreview = () => {
        const currentProduct = product.userProducts[designState.currentProductIndex]
        if (!currentProduct) return 'Please upload your artworks'
        return isProductValid(currentProduct)
    }

    const createNewProduct = (product, isAddBackground) => {
        const userProduct = {
            title: product.abstract.title,
            description: product.description,
            sideLayers: []
        }
        const sideLayers = []
        product.abstract.sides.forEach((side) => {
            const data = {}
            data.side = {...side}
            data.layers = []
            sideLayers.push(data)
        })
        userProduct.sideLayers = sideLayers

        if (product.abstract.sides.length === 0 || product.userProducts.length === 0) {
            product.userProducts = [userProduct]
        } else {
            isAddBackground = false
        }
        return isAddBackground
    }

    const [countReload, setCountReload] = useState(0)
    const [firstLoad, setFirstLoad] = useState(true)

    useEffect(() => {
        if (!firstLoad) {
            if (_.isEmpty(product.attributes)) {
                if (countReload < MAX_RELOAD) {
                    logErrorProduct(product.abstract_product_id, `Reloaded ${countReload} time(s)`).then()
                    reloadVariants(product)
                    setCountReload(countReload + 1)
                }
            }
        } else {
            setFirstLoad(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product.attributes])

    // console.log(product)
    useEffect(() => {
        (async () => {
            let isAddBackground = true
            if (!product.abstract) {
                setLoading(true)
                const res = (abstractProduct && {data: abstractProduct}) || await getAProduct(product.abstract_product_id)
                product.abstract = res.data

                isAddBackground = createNewProduct(product, isAddBackground)
                let dictAtt = []
                product.abstract.child_attributes.forEach(att => {
                    att.child_attributes_value_set.forEach(v => v.attribute_name = att.name)
                    dictAtt = dictAtt.concat(att.child_attributes_value_set)
                })
                product.abstract.abstract_product_variants.forEach(abAtt => {
                    abAtt.attributes_value = dictAtt.filter(att => abAtt.attributes_value.includes(att.id))
                })

                product.abstract.abstract_product_variants.forEach(variant => {
                    variant.attributeValues = variant.attributes_value.map(value => value.id)
                })

                if (defaultData) {
                    // product.description = defaultData.description
                    setProduct(product)
                    updateAttributes({...product.attributes}, product)
                } else if (isEcommerceVariant) {
                    product.attributes = {}
                    const variantAttribute = ecommerceVariant.attributes
                    let attrData = {}
                    product.abstract.child_attributes.forEach((attribute) => {
                        const valueSet = attribute.child_attributes_value_set
                        const defaultValue = variantAttribute[attribute.name]
                        // console.log({valueSet, defaultValue})
                        const defaultAttribute = valueSet.find(x => x.label === defaultValue)
                        // console.log(defaultAttribute)
                        if (defaultAttribute) {
                            attrData[attribute.name] = [defaultAttribute.id]
                        } else {
                            attrData[attribute.name] = [valueSet[0].id]
                        }
                    })
                    setProduct(product)
                    updateAttributes(attrData, product)
                } else {
                    product.description = product.abstract.meta.description
                    // Set Default Attribute
                    let attrData = {}
                    product.abstract.child_attributes.forEach((attribute) => {
                        if (attribute.name === 'Color') {
                            attrData[attribute.name] = [attribute.child_attributes_value_set[0].id]
                        } else {
                            attribute.child_attributes_value_set.sort((attr1, attr2) => (attr1.sort_index - attr2.sort_index))
                            attrData[attribute.name] = attribute.child_attributes_value_set.map((a) => a.id)
                        }
                    })
                    product.attributes = attrData
                    setProduct(product)
                    updateAttributes(attrData, product)
                }
                setLoading(false)

            } else {
                isAddBackground = createNewProduct(product, isAddBackground)
                setProduct(product)
                updateAttributes({...product.attributes}, product)
            }

            // reloadVariants(product)

            const colorAttribute = product.abstract.child_attributes.find(x => x.name.includes('Color'))
            let colorValue = null
            if (colorAttribute) {
                if (isEcommerceVariant) {
                    const defaultColor = ecommerceVariant.attributes["Color"]
                    if (defaultColor) {
                        const defaultAttribute = colorAttribute.child_attributes_value_set.find(x => x.label === defaultColor)
                        colorValue = defaultAttribute ? defaultAttribute.value : colorAttribute.child_attributes_value_set[0].value
                    } else {
                        colorValue = colorAttribute.child_attributes_value_set[0].value
                    }
                } else {
                    colorValue = colorAttribute.child_attributes_value_set[0].value
                }

            }
            if (defaultData) {
                colorValue = (colorValue && colorAttribute.child_attributes_value_set.find(color => color.id === product.attributes['Color'][0]).value) || colorValue
            }
            const currentVariant = product.abstract.abstract_product_variants.find(variant => {
                return variant.attributes_value.some(x => x.value === colorValue)
            }) || product.abstract.abstract_product_variants[0]
            const useArtwork = product.abstract && product.abstract.sides.length > 0
            useArtwork && setDesignState({
                currentSideId: product.abstract.sides[0].id,
                currentVariant: currentVariant,
                lastVariant: currentVariant
            })
            if (isAddBackground) {
                const productMockupInfo = getMockupInfo(product.abstract, currentVariant)
                const userProduct = product.userProducts[0]
                let defaultColor = productMockupInfo.preview_meta.default_material_color
                defaultColor = defaultColor ? defaultColor.toUpperCase() : defaultColor

                product.abstract.sides.forEach((side) => {
                    const sideLayer = userProduct.sideLayers.find((item) => item.side.id === side.id)
                    if (sideLayer) {
                        sideLayer.backgroundColor = defaultColor
                    }
                })

                // product.defaultBackgroundColor = defaultColor
                setProduct({userProducts: [userProduct], defaultBackgroundColor: defaultColor})
            }
        })().then(() => {
            product.abstract && reloadVariants(product)
        })
        fetchCost(product.abstract_product_id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (<div>
            <NewProductDesignContext.Provider
                value={{
                    designState,
                    setDesignState,
                    setCurrentColor,
                    resetCurrentColor,
                    currentProductIsAbleToPreview,
                    reselectLayerIndex,
                    setViewState,
                    viewState,
                    frameScale,
                    setFrameScale
                }}>
                {product.abstract && (
                    <DndProvider backend={HTML5Backend}>
                        <div className="step-container full-height d-flex">
                            <div
                                className="flex-row full-height no-gutters row row-same-height"
                            >
                                <div id="DesignContainer"
                                     className={`col-12 design-wrapper design-wapper-${product.abstract.sides.length} no-padding full-height col-same-height`}
                                     style={{backgroundColor: "#fafafa"}}>
                                    <div className="full-height w-100">
                                        {
                                            useArtwork ? <DesignContainer/> : <PreviewArea abstract={product.abstract}/>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DndProvider>)}
            </NewProductDesignContext.Provider>
        </div>
    )
}

export default ProductDesignContainer
