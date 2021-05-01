import React, {useEffect, useState} from 'react'
import {Card, Select as PolarisSelect, Modal} from '@shopify/polaris'
import {Checkbox, Switch, Table} from 'antd'
import CurrencyFormat from 'react-currency-format'
import {changePrecision, convertCurrency, roundPrice} from './helper/priceCalculate'
import {getAttributeColumn} from './columns/AttributeColumn'
import _ from 'lodash'
import "./Pricing.scss"
import ProductPreview from "./ProductPreview"
import {displayCostSimple} from "../../shared/costDisplay"
import ShippingCostTable from "./ShippingCostTable"
import SingleProfitEstimation from "./components/SingleProfitEstimation"
import PolarisStyleInput from "../shared/PolarisStyleInput"
import {numberFormatCurrency} from "../shared/FormatNumber"
import BigNumber from "bignumber.js"
import MultiProfitEstimation from "./components/MultiProfitEstimation"

const Pricing = (props) => {
    const {context, shopData, advance, padding, preview, shippingDetail, isEdit = false} = props
    const {product, defaultCurrency} = context

    const _attr = []
    if (product.attributes) {
        Object.keys(product.attributes).forEach(key => {
            _attr.push(...product.attributes[key])
        })
    }

    let price = product.variants[0].price

    let bcm = parseFloat(product.variants[0].abstract.base_cost)
    product.variants.forEach(variant => {
        if (bcm > parseFloat(variant.abstract.base_cost)) {
            price = variant.price
            bcm = parseFloat(variant.abstract.base_cost)
        }
    })

    let currencies = shopData.length > 0 ? _.map(shopData, (store) => ({
        name: store.currency,
        exchangeRate: store.currency_exchange_rate,
        precision: store.currency_precision
    })) : [defaultCurrency]

    currencies = _.uniqBy(isEdit ? [...currencies] : [...currencies, defaultCurrency], 'name')

    let pprice = {}
    currencies.forEach((cur) => {
        pprice[cur.name] = {
            value: price[cur.name].value,
            inputValue: price[cur.name].inputValue,
            baseCost: price[cur.name].baseCost,
            baseCostUSD: price[cur.name].baseCostUSD
        }
    })

    const [_price, _setPrice] = useState(pprice)
    const [visibleModal, setVisibleModal] = useState(false)

    const [currency, setCurrency] = useState({
        currentCurrency: currencies[0],
        currencies: currencies
    })

    const [filters, setFilter] = useState([])

    const [batchUpdateInfo, setBatchUpdateInfo] = useState({
        updateType: 'change',
        value: 0,
        unit: '$'
    })

    const [rowInput, setRowInput] = useState(0)

    const [advanceProfit, setAdvanceProfit] = useState({})


    useEffect(() => {
        getAdvanceProfit()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currency, product])

    const getAdvanceProfit = () => {
        let result = {}
        if (currency.currentCurrency) {
            const precision = changePrecision(currency.currentCurrency.precision)

            product.variants.forEach((vari) => {

                let minShippingCostUSD = 99999999
                let maxShippingCostUSD = 0
                vari.shipping.forEach(cost => {
                    if (parseFloat(cost.shipping_cost_base) > maxShippingCostUSD) {
                        maxShippingCostUSD = parseFloat(cost.shipping_cost_base)
                    }
                    if (parseFloat(cost.shipping_cost_base) < minShippingCostUSD) {
                        minShippingCostUSD = parseFloat(cost.shipping_cost_base)
                    }
                })

                const minShippingCost = convertCurrency(minShippingCostUSD, 1, currency.currentCurrency.exchangeRate, precision)
                const maxShippingCost = convertCurrency(maxShippingCostUSD, 1, currency.currentCurrency.exchangeRate, precision)

                const productionProfit = parseFloat(vari.price[currency.currentCurrency.name].inputValue) -
                    parseFloat(vari.price[currency.currentCurrency.name].baseCost)
                const minProfit = productionProfit - parseFloat(maxShippingCost)
                const maxProfit = productionProfit - parseFloat(minShippingCost)
                const origin = {...result}
                origin.min = origin.min ? (origin.min > minProfit ? minProfit : origin.min) : minProfit
                origin.max = origin.max ? (origin.max < maxProfit ? maxProfit : origin.max) : maxProfit
                result = {
                    min: roundPrice(origin.min, precision),
                    max: roundPrice(origin.max, precision)
                }

            })
        }
        setAdvanceProfit(result)
    }

    let _profit = currency.currentCurrency ?
        roundPrice(parseFloat(_price[currency.currentCurrency.name].inputValue) -
            parseFloat(_price[currency.currentCurrency.name].baseCost.ALL),
            changePrecision(currency.currentCurrency.precision)) : 0

    let minProfit = roundPrice(parseFloat(product.variants[0].price[currency.currentCurrency.name].inputValue) -
        parseFloat(product.variants[0].price[currency.currentCurrency.name].baseCost), changePrecision(currency.currentCurrency.precision))

    let maxProfit = minProfit

    product.variants.forEach((vari) => {
        let _pfit = roundPrice(parseFloat(vari.price[currency.currentCurrency.name].inputValue) -
            parseFloat(vari.price[currency.currentCurrency.name].baseCost), changePrecision(currency.currentCurrency.precision))
        if (minProfit > _pfit) minProfit = _pfit
        if (minProfit > _pfit) minProfit = _pfit
        if (maxProfit < _pfit) maxProfit = _pfit
    })

    let _advance = advance
    if (_advance) {
        product.variants.forEach(vari => {
            _advance = advance && (roundPrice(vari.price[currency.currentCurrency.name].value - vari.price[currency.currentCurrency.name].baseCost, changePrecision(currency.currentCurrency.precision)) === _profit)
        })
    } else _advance = true

    const [disabledPriceInput, setDisabledPriceInput] = useState(!_advance)
    const [isAdvanced, setIsAdvanced] = useState(!_advance)

    const handleChangeCurrency = (value) => {
        const chosenCurrency = currency.currencies.find(c => c.name === value)
        setCurrency({...currency, currentCurrency: chosenCurrency})
    }

    const setDefaultBatchInfo = (profit) => {
        const batchInfo = {
            updateType: profit > 0 ? 'increase' : 'decrease',
            value: Math.abs(profit),
            unit: '$'
        }
        setBatchUpdateInfo(batchInfo)
    }

    // useEffect(() => {
    //     if (currency.currentCurrency) {
    //         setDefaultBatchInfo(_profit)
    //     }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [currency])

    const setInputValue = (value) => {
        const inputPrice = JSON.parse(JSON.stringify(_price))
        inputPrice[currency.currentCurrency.name].inputValue = value
        inputPrice[currency.currentCurrency.name].value = roundPrice(value, changePrecision(currency.currentCurrency.precision))
        _setPrice(inputPrice)
    }

    const onChangeAllVariants = (values) => {
        const {floatValue, value} = values
        const diff = floatValue - _price[currency.currentCurrency.name].baseCost
        product.variants.forEach((variant) => {
            const price = variant.price[currency.currentCurrency.name]
            price.inputValue = roundPrice(price.baseCost + diff, changePrecision(currency.currentCurrency.precision))
            price.value = roundPrice(price.baseCost + diff, changePrecision(currency.currentCurrency.precision))
        })
        setDefaultBatchInfo(roundPrice(diff, changePrecision(currency.currentCurrency.precision)))
        context.setProduct(product)
        setInputValue(value)
    }

    const handleToggleAdvance = () => {
        if (!isAdvanced) {
            handleAdvance()
        } else {
            setVisibleModal(true)
        }
    }

    const handleAdvance = () => {
        if (disabledPriceInput) {
            let input = price[currency.currentCurrency.name].basePrice
            product.variants.forEach(variant => {
                const price = variant.price[currency.currentCurrency.name]
                price.advancePrice = price.value
                price.value = price.basePrice
                price.inputValue = price.basePrice
            })
            setInputValue(input)
        } else {
            product.variants.forEach(variant => {
                const price = variant.price[currency.currentCurrency.name]
                price.basePrice = price.value
                price.value = price.advancePrice
                price.inputValue = price.advancePrice
            })
        }

        context.setProduct(product)
        setDisabledPriceInput(!disabledPriceInput)
        setIsAdvanced(!isAdvanced)
        getAdvanceProfit()
    }

    const handleConfirmChangeAdvance = () => {
        handleAdvance()
        setVisibleModal(false)
    }

    const changeBatch = () => {
        let value = Number.parseFloat(batchUpdateInfo.value)
        value = isNaN(value) ? 0 : value
        let hasFilter = Object.values(filters).some(filterValue => filterValue && filterValue.length > 0)
        // console.log(filters, hasFilter)
        product.variants.forEach(variant => {
            if (hasFilter) {
                if (!Object.keys(filters).every(attrName =>
                    variant.abstract.attributes_value.some(
                        attrValue => filters[attrName].length === 0 || (attrValue.attribute_name === attrName && filters[attrName].includes(attrValue.value)))))
                    return
            }
            const baseCost = new BigNumber(variant.price[currency.currentCurrency.name].baseCost)
            const diff = new BigNumber(roundPrice(batchUpdateInfo.unit === '%' ? (baseCost * value / 100) : value, changePrecision(currency.currentCurrency.precision)))
            let price = new BigNumber(baseCost)
            switch (batchUpdateInfo.updateType) {
                case 'change':
                    price = diff
                    break
                case 'increase':
                    price = baseCost.plus(diff)
                    break
                case 'decrease':
                    price = baseCost.minus(diff)
                    break
                default:
                    return
            }
            variant.price[currency.currentCurrency.name].inputValue = price.toNumber()
            variant.price[currency.currentCurrency.name].value = roundPrice(price.toNumber(), changePrecision(currency.currentCurrency.precision))
        })
        const _value = _price[currency.currentCurrency.name].value
        setInputValue(_value)
        context.setProduct(product)
    }

    const onChangeVariantPrice = (record) => {
        return (values) => {
            const {floatValue, value} = values
            record.price[currency.currentCurrency.name].inputValue = value
            record.price[currency.currentCurrency.name].value = roundPrice(floatValue, changePrecision(currency.currentCurrency.precision))
            product.variants.forEach(vari => {
                if (vari.orderIndex === record.orderIndex) {
                    vari.price[currency.currentCurrency.name].inputValue = value
                    vari.price[currency.currentCurrency.name].value = roundPrice(floatValue, changePrecision(currency.currentCurrency.precision))
                }
            })
            batchUpdateInfo.value = 0
            setBatchUpdateInfo(batchUpdateInfo)
            context.setProduct(product)
            setRowInput(rowInput + 1)
            getAdvanceProfit()
        }
    }

    //table
    // const renderVariants = {
    //     title: 'Variant',
    //     dataIndex: 'mockup',
    //     key: 'mockup',
    //     width: 110
    // }

    const changeBatchInfo = (field, value) => {
        batchUpdateInfo[field] = value
        setBatchUpdateInfo(batchUpdateInfo)
        changeBatch()
    }

    const onChangeBatchUpdateInput = (field) => {
        return (values) => {
            const {value} = values
            changeBatchInfo(field, value)
            getAdvanceProfit()
        }
    }

    const changeTypeOptions = [
        {label: 'Change to ', value: 'change'},
        {label: 'Increase by', value: 'increase'},
        {label: 'Decrease by', value: 'decrease'},
    ]

    const handleChangeTypeOptionChange = (value, field) => changeBatchInfo(field, value)

    const handleUnitOptionChange = (value, field) => changeBatchInfo(field, value)

    const renderPriceCell = {
        title: () => {
            return (
                <div className="price-header step-edit-column-price">
                    <div className="flex-center">Price</div>
                    <div className="form flex-center">
                        <PolarisSelect labelHidden
                                       options={changeTypeOptions}
                                       onChange={(newValue) => handleChangeTypeOptionChange(newValue, 'updateType')}
                                       value={batchUpdateInfo.updateType}/>
                        <CurrencyFormat
                            thousandSeparator={true}
                            value={
                                batchUpdateInfo.value > 0 ? batchUpdateInfo.value : ''
                            }
                            style={{width: 100}}
                            onValueChange={onChangeBatchUpdateInput('value')}
                            customInput={PolarisStyleInput}
                            allowNegative={false}
                        />
                        <PolarisSelect labelHidden
                                       options={[
                                           {label: currency.currentCurrency.name, value: '$'},
                                           {label: 'Percent', value: '%'},
                                       ]}
                                       onChange={(newValue) => handleUnitOptionChange(newValue, 'unit')}
                                       value={batchUpdateInfo.unit}/>
                    </div>
                </div>
            )
        },
        dataIndex: 'price',
        key: 'price_cell',
        render: (text, record) => {
            let price = record.price[currency.currentCurrency.name]
            return (
                <div className="row">
                    <div className="col-7">
                        <CurrencyFormat
                            thousandSeparator={true}
                            value={
                                price.inputValue
                            }
                            onValueChange={onChangeVariantPrice(record)}
                            // customInput={Input}
                            customInput={PolarisStyleInput}
                            allowNegative={false}
                        />
                    </div>
                </div>
            )
        }
    }

    const renderProfit = {
        title: 'Estimated profit',
        dataIndex: 'price',
        key: 'profit',
        align: 'right',
        render: (text, record) => {
            const precision = changePrecision(currency.currentCurrency.precision)
            const price = text[currency.currentCurrency.name]
            const productionProfit = parseFloat(price.value) - parseFloat(price.baseCost)

            let minShippingCostUSD = 99999999
            let maxShippingCostUSD = 0
            record.shipping.forEach(cost => {
                if (parseFloat(cost.shipping_cost_base) > maxShippingCostUSD) {
                    maxShippingCostUSD = parseFloat(cost.shipping_cost_base)
                }
                if (parseFloat(cost.shipping_cost_base) < minShippingCostUSD) {
                    minShippingCostUSD = parseFloat(cost.shipping_cost_base)
                }
            })

            const minShippingCost = convertCurrency(minShippingCostUSD, 1, currency.currentCurrency.exchangeRate, precision)
            const maxShippingCost = convertCurrency(maxShippingCostUSD, 1, currency.currentCurrency.exchangeRate, precision)
            const minProfit = productionProfit - parseFloat(maxShippingCost)
            const maxProfit = productionProfit - parseFloat(minShippingCost)
            const profit = {
                min: roundPrice(minProfit, precision),
                max: roundPrice(maxProfit, precision)
            }

            const _shippingDetail = []

            record.shipping.forEach((item) => {
                const data = {...item}
                data.shipping_cost_base = {
                    min: data.shipping_cost_base,
                    max: data.shipping_cost_base
                }

                data.shipping_cost_additional = {
                    min: data.shipping_cost_additional,
                    max: data.shipping_cost_additional
                }
                _shippingDetail.push({...data})
            })

            const contentData = {
                shippingDetail: _shippingDetail,
                productionProfit: productionProfit,
            }

            return <SingleProfitEstimation profit={profit} currency={currency} contentData={contentData} isTableCell/>
        }
    }

    const renderShippingCost = {
        title: "Shipping cost",
        dataIndex: 'shipping',
        key: 'shipping',
        align: 'right',
        render: (text, record) => {
            const currentCurrency = currency.currentCurrency
            let minShippingCostUSD = 99999999
            let maxShippingCostUSD = 0
            record.shipping.forEach(cost => {
                if (parseFloat(cost.shipping_cost_base) > maxShippingCostUSD) {
                    maxShippingCostUSD = parseFloat(cost.shipping_cost_base)
                }
                if (parseFloat(cost.shipping_cost_base) < minShippingCostUSD) {
                    minShippingCostUSD = parseFloat(cost.shipping_cost_base)
                }
            })
            const minShippingCost = convertCurrency(minShippingCostUSD, 1, currentCurrency.exchangeRate, currentCurrency.precision)
            const maxShippingCost = convertCurrency(maxShippingCostUSD, 1, currentCurrency.exchangeRate, currentCurrency.precision)
            return (
                <div className={"shipping-cost-range"}>
                    <div>
                        From <b>{numberFormatCurrency(minShippingCost, currentCurrency.name, currentCurrency.precision)}</b>
                    </div>
                    <div>
                        to <b>{numberFormatCurrency(maxShippingCost, currentCurrency.name, currentCurrency.precision)}</b>
                    </div>
                </div>
            )
        }
    }

    let baseCost = {
        title: (
            // <Popover content={"Hover each cell to view production cost detail"}>
            <div className="no-gutters">
                Cost per item&nbsp;
                {/*<Icon type="info-circle" style={{fontSize: '1em', color: "deepskyblue"}}/>&nbsp;*/}
            </div>
            // </Popover>
        ),
        dataIndex: 'base_cost',
        render: (text, record) => {
            let display = "Free"
            if (record.cost) {
                const cost = record.cost.detail[0]
                display = displayCostSimple(parseFloat(cost.production_cost_base) + parseFloat(Math.max(0, Object.values(price)[0].extraArtworkCost)))
            }
            return (
                // <Popover content={contentBaseCost(record.cost)} placement={"leftTop"}>
                <b>
                    {display}
                </b>
                // </Popover>
            )
        }
    }


    // const contentBaseCost = (record) => {
    //     return (
    //         <div>
    //             <p>
    //                 <b>Base cost:</b>&nbsp;{displayCost(record.price[currency.currentCurrency.name].baseCostUSD[currentZone])}
    //             </p>
    //         </div>
    //     )
    // }


    const attributeOptions = product.abstract.child_attributes.map(attribute => {
        return {
            value: attribute.id,
            label: attribute.name
        }
    })

    const [chosenAttributes, setChosenAttributes] = useState(attributeOptions.map(option => option.value))
    const [variants, setVariants] = useState(_attr.length > 0
        ? product.variants.filter(variant => variant.abstract.attributes_value.every(attribute => _attr.includes(attribute.id)))
        : product.variants
    )

    const reOrder = (variants, array) => {
        let result = []
        if (array.length > 0) {
            if (array.length === attributeOptions.length) {
                result.push(...variants)
            } else {
                const tmpArray = [...array]
                const tmpResult = _.groupBy(variants, array[0])
                if (array.length === 1) {
                    for (const key in tmpResult) {
                        result.push(...tmpResult[key])
                    }
                } else {
                    tmpArray.splice(0, 1)
                    for (const key in tmpResult) {
                        result.push(...reOrder(tmpResult[key], [...tmpArray]))
                    }
                }
            }
        } else {
            result.push(...variants)
        }
        return result
    }

    const changeChosenAttributes = (indexes) => {
        if (indexes.length === 0) return

        const attName = attributeOptions.filter(att => !indexes.includes(att.value)).map(att => att.label)

        let _listAtt = []
        // let _variants = []

        product.variants.forEach((vari) => {
            let other = []
            vari.abstract.attributes_value.forEach(attr => {
                if (!attName.includes(attr.attribute_name)) other.push(attr.id)
            })
            let others = other.sort((att1, att2) => att1 - att2).toString()
            let _id = _listAtt.indexOf(others)
            if (_id >= 0) {
                vari.orderIndex = _id
            } else {
                _listAtt.push(others)
                vari.orderIndex = _listAtt.length - 1
            }
        })
        if (indexes.length < chosenAttributes.length) {
            let _prices = []
            let max = -1
            product.variants.forEach((vari) => {
                if (vari.orderIndex > max) {
                    max = vari.orderIndex
                    _prices.push(vari.price)
                } else {
                    if (_prices[vari.orderIndex][currency.currentCurrency.name].value < vari.price[currency.currentCurrency.name].value)
                        _prices[vari.orderIndex] = vari.price
                }
            })
            max = -1
            product.variants.forEach((vari) => {
                price = _prices[vari.orderIndex][currency.currentCurrency.name].inputValue
                vari.price[currency.currentCurrency.name].inputValue = price
                vari.price[currency.currentCurrency.name].value = roundPrice(price, changePrecision(currency.currentCurrency.precision))
                if (vari.orderIndex > max) {
                    max = vari.orderIndex
                    // _variants.push(vari)
                }
            })
            context.setProduct(product)
        } else {
            let max = -1
            product.variants.forEach((vari) => {
                if (vari.orderIndex > max) {
                    max = vari.orderIndex
                    // _variants.push(vari)
                }
            })
        }

        const defaultVariants = _attr.length > 0
            ? product.variants.filter(variant => variant.abstract.attributes_value.every(attribute => _attr.includes(attribute.id)))
            : product.variants

        if (indexes.length === attributeOptions.length) {
            setVariants(defaultVariants)
        } else {
            setVariants(reOrder(defaultVariants, indexes))
        }
        // console.log(_listAtt)
        // setVariants(_variants)
        setChosenAttributes(indexes)
    }

    const [attributesColumns, setAttributesColumns] = useState(product.abstract.child_attributes.map((attribute) => getAttributeColumn(product, attribute, filters)))

    useEffect(() => {
        const result = []
        const chosen = product.abstract.child_attributes.filter(attr => chosenAttributes.includes(attr.id))
        const nonChosen = product.abstract.child_attributes.filter(attr => !chosenAttributes.includes(attr.id))
        result.push(...chosen, ...nonChosen)
        setAttributesColumns(result.map((attribute) => getAttributeColumn(product, attribute, filters)))
    }, [chosenAttributes, product.abstract.child_attributes, filters, product])

    const variantAndPriceTitle = (
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div className="flex-center">
                <h3 className='Polaris-Heading' style={{fontSize: "1.4rem"}}>Advance pricing by variants</h3>
            </div>

            {
                attributeOptions.length > 1 && (
                    <div className='step-chosen-att flex-center'>
                        Set by: &nbsp;
                        <Checkbox.Group
                            onChange={changeChosenAttributes}
                            options={attributeOptions}
                            value={chosenAttributes}
                        />
                    </div>
                )
            }
        </div>
    )

    const renderAdvanceProfitEstimate = () => {
        return <SingleProfitEstimation
            profit={advanceProfit}
            currency={currency}
            isPopoverDisplay={false}
        />
    }

    const previewContent = () => {
        let attributes = []
        product.abstract.child_attributes.forEach(attribute => {
            attributes.push({
                id: attribute.id,
                name: attribute.name,
                value_set: _attr.length > 0 ? attribute.child_attributes_value_set.filter(value => _attr.includes(value.id)) : attribute.child_attributes_value_set
            })
        })
        if (product.abstract.sides.length > 0) {
            return product.userProducts.map((item, index) => <ProductPreview key={index} attributes={attributes}
                                                                             userProduct={item}/>)
        } else {
            let artworks = []
            product.abstract.mockup_infos.forEach(mockupInfo => {
                mockupInfo.meta.mockup_infos.forEach(mockup => {
                    artworks.push({data: mockup.image_url})
                })
            })
            return <ProductPreview attributes={attributes}
                                   userProduct={{title: product.userProducts[0].title, preview: artworks}}/>
        }
    }

    // const baseCostSimple = () => {
    //     const curCurrency = currency.currentCurrency
    //     if (curCurrency.name === DEFAULT_CURRENCY.currency) {
    //         return <b className="mb-8">{displayCost(Object.values(price)[0].originBaseCost)}</b>
    //     } else {
    //         const priceUSD = price[curCurrency.name].baseCostUSD
    //         const baseCost = price[curCurrency.name].baseCost
    //         return (
    //             <Popover
    //                 content={
    //                     <div><b>1
    //                         USD</b> ≈
    //                         <CurrencyFormat
    //                             value={currency.currentCurrency.exchangeRate}
    //                             displayType={'text'}
    //                             thousandSeparator={true}
    //                             renderText={value => <b> {value}</b>}
    //                             allowNegative={false}
    //                         />
    //                         <b> {currency.currentCurrency.name}</b>
    //                     </div>
    //                 }
    //                 placement={"rightTop"}
    //                 trigger={["hover", "click"]}
    //             >
    //                 <b className="mb-2" style={{width: 200}}>
    //                     {displayCost(priceUSD)}&nbsp;(~{numberFormatCurrency(baseCost, curCurrency.name, curCurrency.precision)})
    //                     &nbsp;
    //                     <Icon type="info-circle" style={{fontSize: '1em', color: "deepskyblue"}}/>
    //                 </b>
    //             </Popover>
    //         )
    //     }
    // }

    return (
        <div className={(padding != null ? `p-${padding}` : `p1em pt-0`).concat(" full-height pricing-container")}>
            <div className="row mt-4 row-same-height">
                <div className="col-lg-12 col-same-height">
                    <Card title={(
                        <div className="flex-space-between">
                            <div className="flex-horizontal">
                                <h2 className="Polaris-Heading">Product pricing</h2>
                            </div>
                            {
                                !isEdit && (
                                    <div className="ml-50 flex-horizontal step-change-advance">
                                        <label className="mr-2">Advance pricing</label>
                                        <Switch className="mb-2" checked={isAdvanced} onChange={handleToggleAdvance}/>
                                    </div>
                                )
                            }
                            <span id="hiddenField" style={{position: "absolute", zIndex: -2}}/>
                        </div>
                    )}
                          className="product-info">
                        <Card.Section>
                            {
                                currency.currentCurrency && (
                                    <div className="row flex-baseline">
                                        <div className="col-12">
                                            <div className="flex-start mb-15">
                                                <label className="lb-100">
                                                    Currency
                                                </label>
                                                <PolarisSelect labelHidden
                                                               options={currency.currencies.map(c => ({
                                                                   label: c.name,
                                                                   value: c.name
                                                               }))}
                                                               onChange={handleChangeCurrency}
                                                               value={currency.currentCurrency.name}
                                                />
                                                {
                                                    currencies.length > 1 &&
                                                    <p className="ml-2">(Price changes apply to the selected currency
                                                        only)</p>
                                                }
                                            </div>
                                            {!isAdvanced && (
                                                <div className="flex-start mb-15">
                                                    <label className="lb-100">Set price
                                                        ({currency.currentCurrency.name})</label>
                                                    <CurrencyFormat
                                                        className='step-edit-profit'
                                                        thousandSeparator={true}
                                                        style={{
                                                            width: '150px',
                                                            marginBottom: '8px',
                                                            fontSize: '1.4rem'
                                                        }}
                                                        value={
                                                            disabledPriceInput ? '' : _price[currency.currentCurrency.name].inputValue
                                                        }
                                                        onValueChange={onChangeAllVariants}
                                                        inputDisabled={disabledPriceInput}
                                                        customInput={PolarisStyleInput}
                                                        allowNegative={false}
                                                    />
                                                    {/*<div className="ml-50 flex-center step-change-advance">*/}
                                                    {/*    <label>Advance&nbsp;</label>*/}
                                                    {/*    <Switch className="mb-2" checked={_onChange} onChange={handleAdvance}/>*/}
                                                    {/*</div>*/}
                                                </div>
                                            )}
                                            {
                                                Object.values(price)[0].extraArtworkCost > 0 &&
                                                <div className="flex-start mb-15">
                                                    <label className="lb-100">Extra artwork</label>
                                                    <b className="mb-8">{displayCostSimple(Object.values(price)[0].extraArtworkCost)}</b>
                                                </div>
                                            }
                                            <div className="flex-start">
                                                <label className="lb-100 mb-0" style={{alignSelf: "flex-start"}}>
                                                    Estimate profit
                                                </label>
                                                {isAdvanced
                                                    ? renderAdvanceProfitEstimate()
                                                    : <MultiProfitEstimation
                                                        inputValue={_price[currency.currentCurrency.name].inputValue}
                                                        currency={currency}
                                                        variants={variants}
                                                        shippingDetail={shippingDetail}
                                                    />
                                                }
                                                {/*{_onChange ? (minProfit === maxProfit ?*/}
                                                {/*        renderProfitEstimate(minProfit) :*/}
                                                {/*        (<div className='row ml-1'>*/}
                                                {/*            {renderProfitEstimate(minProfit)} &nbsp; ~ &nbsp; {renderProfitEstimate(maxProfit)}*/}
                                                {/*        </div>)*/}
                                                {/*    ) :*/}
                                                {/*    renderProfitEstimate(_profit)*/}
                                                {/*}*/}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </Card.Section>
                        {
                            currency.currentCurrency && isAdvanced &&
                            <Card.Section title={variantAndPriceTitle}>
                                <div className={'shopifilize-table mt-2'}>
                                    <Table
                                        rowKey={(record) => record.abstract.id}
                                        dataSource={variants}
                                        scroll={{x: true, y: false}}
                                        columns={[...attributesColumns, baseCost, renderPriceCell, renderShippingCost, renderProfit]}
                                        onChange={(pagination, filters) => setFilter(filters)}
                                    />
                                </div>
                            </Card.Section>
                        }
                    </Card>
                </div>
            </div>
            {
                shippingDetail &&
                <ShippingCostTable shippingDetail={shippingDetail} variants={context.product.variants}
                                   child_attributes={context.product.abstract.child_attributes}/>
            }
            {
                preview === true && (
                    <div className={'mt-4 shopifilize-card'}>
                        <Card title={"Product preview"}>
                            {previewContent()}
                        </Card>
                    </div>
                )
            }

            <Modal
                open={visibleModal}
                title={"Confirm"}
                onClose={() => setVisibleModal(false)}
                sectioned={true}
                primaryAction={{
                    destructive: true,
                    content: "Confirm",
                    onAction: handleConfirmChangeAdvance
                }}

                secondaryActions={[
                    {
                        content: "Cancel",
                        onAction: () => {
                            setVisibleModal(false)
                        }
                    }
                ]}
            >
                The change below will not be apply
            </Modal>

        </div>
    )
}

export default Pricing
