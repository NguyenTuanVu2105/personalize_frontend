import React, {useCallback, useEffect, useState} from 'react'
import {Button, Caption, ChoiceList, Filters, Icon, Modal, Stack} from "@shopify/polaris"
import {Checkbox, Empty, notification, Pagination, Spin} from "antd"
import {getBriefUserProduct, getUserProductVariants} from "../../../../services/api/newOrder"
import {formatShortDate} from "../../../../services/util/datetime"
import {DATE_RANGE} from "../../../orders/constants"
import {formatTimeSelect} from "../../../../shared/formatTime"
import {Calendar} from "react-date-range"
import moment from "moment-timezone"
import TableStatus from "../../../shared/TableStatus"
import UserProductItem from "./UserProductItem"
import {VIEW_MODE} from "../../constants"
import _ from "lodash"
import {numberFormatCurrency} from "../../../shared/FormatNumber"
import {ChevronLeftMinor} from "@shopify/polaris-icons"
import './UserProductSection.scss'
import BigNumber from "bignumber.js"
import {USER_PRODUCT_STATUS} from "../../../products/contants/UserProductStatus"

const defaultRowNumber = "10"


const UserProductSection = (props) => {
    const {selectedVariants, selectedVariantIds, appendSelectedVariants, removeVariant, notChangeVariantIds} = props
    const [tableProducts, setTableProducts] = useState([])
    const [_loading, _setLoading] = useState(true)
    const [_totalProducts, _setTotalProducts] = useState(20)
    const [_page, _setPage] = useState(1)

    const [dateRangeChoice, setDateRangeChoice] = useState(null)
    const [dateRange, setDateRange] = useState(null)
    const [selectedStartDate, setSelectedStartDate] = useState(null)
    const [selectedEndDate, setSelectedEndDate] = useState(null)
    const CUSTOM_TIME_QUERY = '7'

    const [rowNumber, setRowNumber] = useState(defaultRowNumber)
    const [queryValue, setQueryValue] = useState(null)

    const [viewMode, setViewMode] = useState(VIEW_MODE.USER_PRODUCT)
    const [chosenProduct, setChosenProduct] = useState(null)
    const [_variantLoading, _setVariantLoading] = useState(true)
    const [variants, setVariants] = useState([])
    const [tmpChangedVariantIds, setTmpChangedVariantIds] = useState([])

    useEffect(() => {
        _fetchProducts(1, defaultRowNumber, null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const _fetchProducts = async (page, limit, query, since, until, isActive = USER_PRODUCT_STATUS.ACTIVE) => {
        _setLoading(true)
        const productsRes = await getBriefUserProduct(query, page || _page, limit || rowNumber, since, until, isActive)

        const {success: productSuccess, data: productsData} = productsRes

        if (!productSuccess) {
            notification.error({
                message: "Error",
                description: "An error occurred, please try again or contact our support team"
            })
        }

        _setTotalProducts(productsData.count)

        const {results: productResult} = productsData
        if (!productResult) return
        setTableProducts(productResult)
        _setLoading(false)
    }

    const disambiguateLabel = (key, value) => {
        switch (key) {
            case 'dateRange':
                if (value.range) {
                    return `${value.range}`
                } else {
                    return `${DATE_RANGE[value.choice]}`
                }
            default:
                return value
        }
    }

    const isEmpty = (value) => {
        if (Array.isArray(value)) {
            return value.length === 0
        } else {
            return value === '' || value == null
        }
    }

    const appliedFilters = []

    const _onPageChange = (page) => {
        setTableProducts([])
        _setPage(page)
        _fetchProducts(page, rowNumber, queryValue, selectedStartDate, selectedEndDate)
    }

    const handleFiltersQueryChange = (value) => {
        setQueryValue(value)
        _fetchProducts(1, rowNumber, value, selectedStartDate, selectedEndDate)
    }

    const handleRowNumberChange = (value) => {
        setRowNumber(value[0])
        _fetchProducts(1, value[0], queryValue, selectedStartDate, selectedEndDate)
    }

    const handleQueryValueRemove = () => {
        setQueryValue(null)
        _fetchProducts(1, rowNumber, null, selectedStartDate, selectedEndDate)
    }

    const handleDateRangeChoiceChange = (value) => {
        // // alert(value)
        setDateRangeChoice(value[0])
        setDateRange(null)
        _setPage(1)
        let {since, until} = formatTimeSelect(value[0])
        setSelectedStartDate(since)
        setSelectedEndDate(until)
        return _fetchProducts(1, rowNumber, queryValue, since, until)
    }
    const renderCustomDateRange = () => {
        return dateRangeChoice === CUSTOM_TIME_QUERY ? (
            <div className={'mt-2'}>
                <div>
                    <div className={'mb-3'}>Start Date</div>
                    <Calendar
                        date={selectedStartDate ? new Date(selectedStartDate) : null}
                        onChange={handleStartDateSelect}
                        color={'#5C6AC4'}
                    />
                </div>
                <div>
                    <div className={'my-3'}>End Date</div>
                    <Calendar
                        date={selectedEndDate ? new Date(selectedEndDate) : null}
                        onChange={handleEndDateSelect}
                        color={'#5C6AC4'}
                    />
                </div>
            </div>
        ) : null
    }

    const handleStartDateSelect = (date) => {
        setSelectedStartDate(moment(date.toISOString()).startOf("day").toISOString())
        if (selectedEndDate) {
            setDateRange(`${formatShortDate(date)} - ${formatShortDate(new Date(selectedEndDate))}`)
            _setPage(1)
            return _fetchProducts(1, rowNumber, queryValue, date.toISOString(), selectedEndDate)
        }
    }

    const handleEndDateSelect = (date) => {
        const endTime = moment(date.toISOString()).endOf("day").toISOString()
        setSelectedEndDate(endTime)
        if (selectedStartDate) {
            setDateRange(`${formatShortDate(new Date(selectedStartDate))} - ${formatShortDate(date)}`)
            _setPage(1)
            return _fetchProducts(1, rowNumber, queryValue, selectedStartDate, endTime)
        }
    }

    const handleDateRangeRemove = () => {
        setDateRange(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        setDateRangeChoice(null)
        _setPage(1)
        _fetchProducts(1, rowNumber, queryValue, null, null)
    }

    const handleFiltersClearAll = useCallback(() => {
        setQueryValue(null)
        setRowNumber(defaultRowNumber)
        setDateRange(null)
        setDateRangeChoice(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        _setPage(1)
        _fetchProducts(1, defaultRowNumber, null, null, null)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!isEmpty(dateRangeChoice)) {
        const key = 'dateRange'
        if (dateRangeChoice !== CUSTOM_TIME_QUERY && dateRangeChoice !== null) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, {choice: dateRangeChoice, range: null}),
                onRemove: handleDateRangeRemove,
            })
        } else if (dateRangeChoice === CUSTOM_TIME_QUERY) {
            if (!isEmpty(dateRange)) {
                appliedFilters.push({
                    key,
                    label: disambiguateLabel(key, {choice: dateRangeChoice, range: dateRange}),
                    onRemove: handleDateRangeRemove,
                })
            } else {
                appliedFilters.push({
                    key,
                    label: disambiguateLabel(key, {choice: dateRangeChoice, range: null}),
                    onRemove: handleDateRangeRemove,
                })
            }
        }
    }

    const filters = [
        {
            key: 'dateRange',
            label: 'Date',
            filter: (
                <div>
                    <ChoiceList
                        title="Date"
                        titleHidden
                        choices={[
                            {label: 'Today', value: '1'},
                            {label: 'Yesterday', value: '2'},
                            {label: 'Last 7 days', value: '3'},
                            {label: 'Last 30 days', value: '4'},
                            {label: 'Last 90 days', value: '5'},
                            {label: 'Last 12 months', value: '6'},
                            {label: 'Custom', value: '7'},
                        ]}
                        selected={dateRangeChoice || []}
                        onChange={handleDateRangeChoiceChange}
                        // allowMultiple
                    />
                    <div>
                        {
                            renderCustomDateRange()
                        }
                    </div>
                </div>
            ),
            // shortcut: true,
        },
        {
            key: 'rowNumber',
            label: 'Items per page',
            filter: (
                <ChoiceList
                    title="Items per page"
                    titleHidden
                    choices={[
                        // {label: '5', value: '08'},
                        {label: '10', value: '10'},
                        {label: '20', value: '20'},
                        {label: '30', value: '30'},
                        {label: '50', value: '50'},
                    ]}
                    selected={rowNumber || defaultRowNumber}
                    onChange={handleRowNumberChange}
                    // allowMultiple
                />
            ),
            shortcut: true,
        }
    ]
    const onClickProduct = (product_id, product_preview, product_name) => {
        setViewMode(VIEW_MODE.USER_VARIANT)
        setChosenProduct({product_id, product_preview, product_name})
        fetchVariants(product_id)
        setTmpChangedVariantIds([])
        // console.log(product_id)
    }

    const fetchVariants = async (productId) => {
        _setVariantLoading(true)
        const {success: variantSuccess, data: variantsData} = await getUserProductVariants(productId)
        if (!variantSuccess) {
            notification.error({
                message: "Error",
                description: "An error occurred, please try again or contact our support team"
            })
        }
        const {data: variants} = variantsData
        const variantData = variants.map(variant => {
            const {user_variant, user_product, title, preview, abstract_variant_data, extra_cost} = variant
            return {
                user_variant, title, preview, user_product,
                costPerItem: getCostPerItem(abstract_variant_data.shipping_costs, extra_cost),
                additionalCost: getAdditionalCost(abstract_variant_data.shipping_costs, extra_cost),
                quantity: 1,
                attributeValues: abstract_variant_data.attributes_value,
                priceDict: abstract_variant_data.shipping_costs,
                extra_cost: extra_cost,
            }
        })
        setVariants(variantData)
        _setVariantLoading(false)
        document.getElementsByClassName("Polaris-Modal__Body")[0].scrollTo(0, 0)
    }

    const retrieveMinValueByKey = (array, key) => {
        const minElement = _.minBy(array, (item) => BigNumber(item[key]).toNumber())
        return minElement ? minElement[key] : null
    }

    const getCostPerItem = (priceArray, extra_cost) => {
        return parseFloat(retrieveMinValueByKey(priceArray, "production_cost_base")) + parseFloat(extra_cost)
    }

    const getAdditionalCost = (priceArray, extra_cost) => {
        return parseFloat(retrieveMinValueByKey(priceArray, "production_cost_additional")) + parseFloat(extra_cost)
    }

    const onSelectVariants = (changedVariantIds) => {
        const variantIds = variants.map(v => v.user_variant.toString())
        const sectionSelectedVariantIds = _.intersection(selectedVariantIds, variantIds)
        const sectionChangeVariantIds = _.intersection(changedVariantIds, variantIds)
        const idsToAdd = _.difference(changedVariantIds, tmpChangedVariantIds)
        const idsToRemove = _.difference(sectionSelectedVariantIds, sectionChangeVariantIds)
        const changedVariants = idsToAdd.map(id => {
            return variants.find(variant => variant.user_variant.toString() === id)
        })
        idsToRemove.map(id => removeVariant(id))
        appendSelectedVariants(changedVariants, changedVariantIds)
        setTmpChangedVariantIds(changedVariantIds)
    }

    const isFromOrderDetail = !!notChangeVariantIds

    const renderVariantItem = (variant, index) => {
        const variantTitle = variant.attributeValues.map(attribute_value => attribute_value.label).join(" / ")
        const disabled = notChangeVariantIds && notChangeVariantIds.includes(variant.user_variant.toString())
        return (
            <div key={index} className={"user-variant-item flex-start"}>
                <Checkbox
                    value={variant.user_variant.toString()}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <div className={'ml-2'}>
                        <Stack alignment={"center"}>
                            <Stack.Item>
                                <img src={variant.preview} width={60} alt={`${variant.title}'s preview`}
                                     className={'img-thumbnail'}/>
                            </Stack.Item>
                            <Stack.Item fill>
                                <div className="variant-title">
                                    <strong>{isFromOrderDetail && disabled ? variantTitle + " (existed item)" : variantTitle}</strong>
                                </div>
                                <Caption>{variant.title}</Caption>
                            </Stack.Item>
                            <Stack.Item>
                                <div className={"first-item-cost-row"}>
                                    <b>{numberFormatCurrency(variant.costPerItem)}</b>
                                </div>
                                {
                                    variant.additionalCost !== variant.costPerItem && (
                                        <Caption>
                                            {
                                                `(${numberFormatCurrency(variant.additionalCost)} for seconds item onwards)`
                                            }
                                        </Caption>
                                    )
                                }
                            </Stack.Item>
                        </Stack>
                    </div>
                </Checkbox>
            </div>
        )
    }

    return (
        <div>
            {viewMode === VIEW_MODE.USER_PRODUCT && (
                <Modal.Section>
                    <Stack>
                        <Stack.Item fill>
                            <Filters
                                queryPlaceholder={'Product Title, Description'}
                                queryValue={queryValue}
                                filters={filters}
                                appliedFilters={appliedFilters}
                                onQueryChange={handleFiltersQueryChange}
                                onQueryClear={handleQueryValueRemove}
                                onClearAll={handleFiltersClearAll}
                            />
                        </Stack.Item>
                        <Stack.Item>
                            <TableStatus loading={_loading} amount={_totalProducts} objectName={"product"}
                                         verboseObjectName={"products"}/>
                        </Stack.Item>
                    </Stack>
                    <div className="">
                        <Spin spinning={_loading}>
                            <div style={{minHeight: 460}}>
                                <div className="row mx-0">
                                    {
                                        tableProducts.length > 0 && tableProducts.map((product, index) => {
                                            const selectedVariantAmount = selectedVariants.filter(v => v.user_product === product.id).length
                                            const columnAmount = 1
                                            const columnSize = 12 / columnAmount
                                            const className = `col-lg-${columnSize} px-0`
                                            return (
                                                <div key={index} className={className}>
                                                    <UserProductItem
                                                        product_id={product.id}
                                                        product_preview={product.preview_image_url}
                                                        product_name={product.title}
                                                        selectedVariantAmount={selectedVariantAmount}
                                                        onClick={onClickProduct}/>
                                                </div>
                                            )
                                        })
                                    }
                                    {
                                        !_loading && tableProducts.length === 0 && (
                                            <div className={"col-12 mt-5 flex-center"}>
                                                <Empty description={"No product available"}/>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </Spin>
                        {
                            _totalProducts > parseInt(rowNumber) &&
                            <Pagination style={{textAlign: 'right', margin: '1rem 0.5rem 0 0'}}
                                        onChange={_onPageChange}
                                        current={_page}
                                        total={_totalProducts}
                                        pageSize={parseInt(rowNumber)}
                                        showQuickJumper={true}
                            />
                        }
                    </div>
                </Modal.Section>
            )}
            {viewMode === VIEW_MODE.USER_VARIANT && (
                <div className={'user-variant-section'}>
                    <Modal.Section>
                        <div className="row flex-center top-row">
                            <div className="col-1 pr-0">
                                <Button onClick={() => setViewMode(VIEW_MODE.USER_PRODUCT)} plain
                                        icon={<Icon source={ChevronLeftMinor}/>}>Back</Button>
                            </div>
                            <div className="col-11 pl-0">
                                <div className="row mx-0 flex-end">
                        <span>
                            <img src={chosenProduct.product_preview} alt={`${chosenProduct.product_name}'s preview`}
                                 className={"img-thumbnail"} width={30}/>
                        </span>
                                    <span className={"ml-4"}>
                            <strong>{chosenProduct.product_name}</strong>
                        </span>
                                </div>
                            </div>
                        </div>
                        <Spin spinning={_variantLoading}>
                            <div
                                style={{minHeight: 510}}
                            >
                                <Checkbox.Group value={selectedVariantIds} onChange={onSelectVariants}
                                                style={{width: '100%'}}>
                                    {
                                        variants.map((variant, index) => renderVariantItem(variant, index))
                                    }
                                </Checkbox.Group>

                            </div>
                        </Spin>
                    </Modal.Section>
                </div>
            )}
        </div>

    )
}


export default UserProductSection