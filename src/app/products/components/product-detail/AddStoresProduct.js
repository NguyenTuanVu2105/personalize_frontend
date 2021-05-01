import React, {useCallback, useContext, useEffect, useState} from 'react'
import {Caption, ChoiceList, Filters, Link, Modal, Stack, Tabs, TextField, Tooltip} from "@shopify/polaris"
import {Table} from 'antd'
import {getShopsList} from "../../../../services/api/shops"
import shopify from "../../../../assets/images/shopify.svg"
import woocommerce from "../../../../assets/images/woocommerce.png"
import ShopStatusTag from "../../../shop/components/ShopStatusTag"
import UserPageContext from "../../../userpage/context/UserPageContext"
import {formatShortDate} from "../../../../services/util/datetime"
import {formatTimeSelect} from "../../../../shared/formatTime"
import {Calendar} from "react-date-range"
import moment from "moment-timezone"
import {DATE_RANGE} from "../../../orders/constants"
import TableStatus from "../../../shared/TableStatus"
import {getShopIfyAuthUrl} from "../../../shop-setting/helpers/getShopIfyAuthUrl"
import {isInFrame} from "../../../../services/util/windowUtil"

const defaultRowNumber = "10"

const AddStoresProduct = (props) => {
    const {visible, onClose, userProductId, saveShops} = props
    const [selectedShops, setSelectedShops] = useState([])
    const [stores, setStores] = useState([])
    const [tableLoading, setTableLoading] = useState(false)
    const [ecommerceOptions, setEcommerceOptions] = useState(null)
    const [currencyOptions, setCurrencyOptions] = useState(null)
    const [ecommerce, setEcommerce] = useState(null)
    const [currency, setCurrency] = useState(null)
    const [queryValue, setQueryValue] = useState(null)

    const [page, setPage] = useState(1)
    const [totalShop, setTotalShop] = useState(0)
    const [rowNumber, setRowNumber] = useState(defaultRowNumber)
    const {scrollTable} = useContext(UserPageContext)
    const [dateRangeChoice, setDateRangeChoice] = useState(null)
    const [dateRange, setDateRange] = useState(null)
    const [selectedStartDate, setSelectedStartDate] = useState(null)
    const [selectedEndDate, setSelectedEndDate] = useState(null)
    const CUSTOM_TIME_QUERY = '7'
    const [selectedTab, setSelectedTab] = useState(0);
    const [storeUrl, setStoreUrl] = useState('')
    const [storeUrlError, setStoreUrlError] = useState('')
    const [installStoreWindow, setInstallStoreWindow] = useState(null)

    const handleTabChange = (selectedTabIndex) => setSelectedTab(selectedTabIndex)


    useEffect(() => {
        _fetchShops(page, rowNumber, queryValue, ecommerce, currency, selectedStartDate, selectedEndDate)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const _fetchShops = async (page, limit, searchQuery, ecommerce, currency, since, until, sortBy = null) => {
        setTableLoading(true)
        const storesRes = await getShopsList(page, limit, searchQuery, ecommerce, currency, 1, since, until, userProductId, sortBy)
        if (storesRes.success && storesRes.data) {
            setStores(storesRes.data.results)
            setTotalShop(storesRes.data.count)
            const options = storesRes.data.options
            const ecommerces = options.ecommerces.map((ecommerce) => {
                return {
                    label: ecommerce.name,
                    value: ecommerce.name
                }
            })
            const currencies = options.currencies.map((currency) => {
                return {
                    label: currency.currency,
                    value: currency.currency
                }
            })
            setEcommerceOptions(ecommerces)
            setCurrencyOptions(currencies)
            setTableLoading(false)

        }
    }

    const onPageChange = (page) => {
        setStores([])
        setPage(page)
        _fetchShops(page, rowNumber, queryValue, ecommerce, currency, selectedStartDate, selectedEndDate)
    }

    const handleEcommerceChange = (value) => {
        setEcommerce(value[0])
        _fetchShops(1, rowNumber, queryValue, value[0], currency, selectedStartDate, selectedEndDate)
    }
    const handleCurrencyChange = (value) => {
        setCurrency(value[0])
        _fetchShops(1, rowNumber, queryValue, ecommerce, value[0], selectedStartDate, selectedEndDate)
    }

    const handleQueryValueChange = (value) => {
        setQueryValue(value === '' ? null : value)
        _fetchShops(1, rowNumber, value, ecommerce, currency, selectedStartDate, selectedEndDate)
    }

    const handleRowNumberChange = (value) => {
        setRowNumber(value[0])
        _fetchShops(1, value[0], queryValue, ecommerce, currency, selectedStartDate, selectedEndDate)
    }

    const handleEcommerceRemove = () => {
        setEcommerce(null)
        _fetchShops(1, rowNumber, queryValue, null, currency, selectedStartDate, selectedEndDate)
    }
    const handleCurrencyRemove = () => {
        setCurrency(null)
        _fetchShops(1, rowNumber, queryValue, ecommerce, null, selectedStartDate, selectedEndDate)
    }
    const handleQueryValueRemove = () => {
        setQueryValue(null)
        _fetchShops(1, rowNumber, null, ecommerce, currency, selectedStartDate, selectedEndDate)
    }

    const handleFiltersClearAll = useCallback(() => {
        setEcommerce(null)
        setCurrency(null)
        setQueryValue(null)
        setRowNumber(defaultRowNumber)
        setDateRangeChoice(null)
        setDateRange(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        _fetchShops()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleDateRangeChoiceChange = (value) => {
        setDateRangeChoice(value[0])
        setDateRange(null)
        setPage(1)
        let {since, until} = formatTimeSelect(value[0])
        setSelectedStartDate(since)
        setSelectedEndDate(until)
        return _fetchShops(1, rowNumber, queryValue, ecommerce, currency, since, until)
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
            setPage(1)
            return _fetchShops(1, rowNumber, queryValue, ecommerce, currency, date.toISOString(), selectedEndDate)
        }
    }

    const handleEndDateSelect = (date) => {
        const endTime = moment(date.toISOString()).endOf("day").toISOString()
        setSelectedEndDate(endTime)
        if (selectedStartDate) {
            setDateRange(`${formatShortDate(new Date(selectedStartDate))} - ${formatShortDate(date)}`)
            setPage(1)
            return _fetchShops(1, rowNumber, queryValue, ecommerce, currency, selectedStartDate, endTime)
        }
    }

    const handleDateRangeRemove = () => {
        setDateRangeChoice(null)
        setDateRange(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        setPage(1)
        _fetchShops(1, rowNumber, queryValue, ecommerce, currency, null, null)
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
            key: 'ecommerce',
            label: 'Flatform',
            filter: (
                <ChoiceList
                    title="Flatform"
                    titleHidden
                    choices={ecommerceOptions}
                    selected={ecommerce || []}
                    onChange={handleEcommerceChange}
                    // allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: 'currency',
            label: 'Currency',
            filter: (
                <ChoiceList
                    title="Curreny"
                    titleHidden
                    choices={currencyOptions}
                    selected={currency || []}
                    onChange={handleCurrencyChange}
                    // allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: 'rowNumber',
            label: 'Items per page',
            filter: (
                <ChoiceList
                    title="Items per page"
                    titleHidden
                    choices={[
                        {label: "5", value: "5"},
                        {label: "10", value: "10"}
                    ]}
                    selected={rowNumber || defaultRowNumber}
                    onChange={handleRowNumberChange}
                    // allowMultiple
                />
            ),
            // shortcut: true,
        }

    ]

    const isEmpty = (value) => {
        if (Array.isArray(value)) {
            return value.length === 0
        } else {
            return value === '' || value == null
        }
    }

    const disambiguateLabel = (key, value) => {
        switch (key) {
            case 'dateRange':
                if (value.range) {
                    return `${value.range}`
                } else {
                    return `${DATE_RANGE[value.choice]}`
                }
            case 'ecommerce':
                return `Flatform: ${value}`
            case 'currency':
                return `Currency: ${value}`
            default:
                return value
        }
    }


    const appliedFilters = []

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

    if (!isEmpty(ecommerce)) {
        const key = 'ecommerce'
        if (ecommerce !== null) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, ecommerce),
                onRemove: handleEcommerceRemove,
            })
        }
    }


    if (!isEmpty(currency)) {
        const key = 'currency'
        if (currency !== null) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, currency),
                onRemove: handleCurrencyRemove,
            })
        }
    }

    const _columns = [
        {
            title: 'Flatform',
            dataIndex: 'ecommerce',
            key: 'ecommerce',
            align: 'center',
            render: (text, record) => {
                const ecommerce = record.ecommerce.name
                return (
                    <div>
                        <img src={ecommerce.toLowerCase() === 'shopify' ? shopify : woocommerce}
                             alt={ecommerce} width={30}/>
                    </div>
                )
            },
        },
        {
            title: 'Store',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => {
                return (<div>
                    <Link url={record.url.includes('http://') ? record.url : `http://${record.url}`}
                          external>{text}</Link>
                    <Caption>{record.url}</Caption>
                </div>)
            }
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            align: 'center',
            render: (currency, record) => (
                <Tooltip content={currency}>
                    <span className="flex-middle flex-center">
                        {currency} &nbsp;<span className={`currency-flag currency-flag-${currency.toLowerCase()}`}/>
                    </span>

                </Tooltip>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status, record) => {
                return (<ShopStatusTag status={status}/>)
            },
        }
    ]

    const rowSelection = {
        selectedShops,
        onChange: (keys) => {
            setSelectedShops(keys)
        },
    }

    const onCancel = () => {
        setSelectedShops([])
        onClose()
    }

    const onOK = () => {
        onClose()
        saveShops(userProductId, selectedShops)
    }

    const existedStoresComponent = () => {
        return (
            <div>
                <div>
                    <Stack>
                        <Stack.Item fill>
                            <div>
                                <Filters
                                    queryPlaceholder={'Store ID, Store name, ...'}
                                    queryValue={queryValue}
                                    filters={filters}
                                    appliedFilters={appliedFilters}
                                    onQueryChange={handleQueryValueChange}
                                    onQueryClear={handleQueryValueRemove}
                                    onClearAll={handleFiltersClearAll}
                                />
                            </div>
                        </Stack.Item>
                        <Stack.Item>
                            <TableStatus loading={tableLoading} amount={totalShop} objectName={"store"}
                                         verboseObjectName={"stores"}/>
                        </Stack.Item>
                    </Stack>
                </div>
                <div className="shops-table-page shopifilize-table mt-4">
                    <Table
                        dataSource={stores}
                        columns={_columns}
                        loading={tableLoading}
                        rowKey="id"
                        {...scrollTable}
                        rowSelection={rowSelection}
                        pagination={{
                            onChange: onPageChange,
                            total: totalShop,
                            pageSize: parseInt(rowNumber),
                            current: page,
                            showQuickJumper: true,
                            showSizeChanger: false
                        }}
                    />
                </div>
            </div>
        )
    }

    useEffect(() => {
        if (installStoreWindow) {
            const checkWindowInterval = setInterval(() => {
                if (installStoreWindow.closed) {
                    setInstallStoreWindow(null)
                    setSelectedTab(0)
                    _fetchShops(page, rowNumber, queryValue, ecommerce, currency, selectedStartDate, selectedEndDate, '-create_time')
                }
            }, 200)
            return () => {
                clearInterval(checkWindowInterval)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [installStoreWindow])

    const onChangeStoreTextfield = (value) => {
        setStoreUrl(value)
        setStoreUrlError('')
    }

    const onClearButtonClick = () => {
        setStoreUrl('')
        setStoreUrlError('')
    }

    const onSubmit = (e) => {
        e.stopPropagation()
        const checkDomain = /^.*([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?\/?$/
        const checkPass = checkDomain.test(storeUrl)
        if (checkPass) {
            const url = getShopIfyAuthUrl(storeUrl)
            const strWindowFeatures = 'toolbar=no, menubar=no, width=1280, height=700, top=100, left=100'
            const newWindow = window.open('', '_blank', strWindowFeatures)
            newWindow.document.write('Loading page...')
            newWindow.location.href = url
            setInstallStoreWindow(newWindow)

            // eslint-disable-next-line no-restricted-globals
            // location.href = url
        } else setStoreUrlError("Incorrect store address. Valid store address ends with .myshopify.com, .com or another domain extension.")

    }

    const handleKeyPress = (event) => {
        const enterKeyPressed = event.keyCode === 13
        if (enterKeyPressed) {
            event.preventDefault()
            return onSubmit(event)
        }
    }

    const newStoresComponent = () => {
        return (
            <div onKeyDown={handleKeyPress}>
                <TextField
                    label="Store address"
                    autoFocus
                    clearButton
                    onClearButtonClick={onClearButtonClick}
                    value={storeUrl}
                    onChange={onChangeStoreTextfield}
                    placeholder="example.myshopify.com"
                    error={storeUrlError}
                    helpText={'Store address can include "http://", "https://" or not'}
                />
            </div>
        )
    }


    const tabs = [
        {
            id: 'existed-stores',
            content: 'Current stores',
            panelID: 'existed-stores',
            component: existedStoresComponent

        },
        {
            id: 'new-store',
            content: 'New store',
            panelID: 'new-store',
            component: newStoresComponent
        }
    ]


    const primaryAction = selectedTab === 0 ? {
        content: 'Sync',
        onAction: onOK,
        disabled: selectedShops.length === 0
    } : {
        content: 'Add',
        onAction: onSubmit,
    }

    return (
        <Modal
            open={visible}
            onClose={onCancel}
            title='Sync this product to stores'
            large
            primaryAction={primaryAction}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: onCancel,
                },
            ]}
        >
            {
                isInFrame() && (
                    <Modal.Section>
                        {tabs[0].component()}
                    </Modal.Section>
                )
            }
            {
                !isInFrame() && (
                    <div className={''}>
                        <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                            <Modal.Section>
                                {tabs[selectedTab].component()}
                            </Modal.Section>
                        </Tabs>
                    </div>
                )
            }
        </Modal>)

}

export default AddStoresProduct