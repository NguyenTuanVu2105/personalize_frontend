import React, {useCallback, useContext, useEffect, useState} from 'react'
import {Table} from 'antd'
import {getShopsList} from '../../../services/api/shops'
import {Link, withRouter} from 'react-router-dom'
import Paths from '../../../routes/Paths'
import shopify from '../../../assets/images/shopify.svg'
import woocommerce from '../../../assets/images/woocommerce.png'
import {formatDatetime, formatShortDate} from '../../../services/util/datetime'
import {getShopIfyAuthUrl} from '../../shop-setting/helpers/getShopIfyAuthUrl'
import {Button, Card, ChoiceList, Filters, Stack, Tooltip} from '@shopify/polaris'
import {STATUS_OPTIONS, STATUSES_OBJECT} from '../constants'

import './ShopTable.scss'
import 'currency-flags/dist/currency-flags.min.css'
import ShopStatusTag from './ShopStatusTag'
import ShopManagerContext from './ShopManagerContext'
import TableStatus from "../../shared/TableStatus"
import {Calendar} from "react-date-range"
import {DATE_RANGE} from "../../orders/constants"
import {formatTimeSelect} from "../../../shared/formatTime"
import moment from 'moment-timezone'
import UserPageContext from "../../userpage/context/UserPageContext"

const defaultRowNumber = "10"

const ShopTable = function ({updateTableFlag, history}) {
    const [shop, setShop] = useState(null)
    const [tableLoading, setTableLoading] = useState(false)
    const [ecommerceOptions, setEcommerceOptions] = useState(null)
    const [currencyOptions, setCurrencyOptions] = useState(null)
    const [ecommerce, setEcommerce] = useState(null)
    const [currency, setCurrency] = useState(null)
    const [status, setStatus] = useState(null)
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
    const {setStateContext} = useContext(ShopManagerContext)

    //UNINTALL APP
    // const {setLoading} = useContext(AppContext)

    useEffect(() => {
        _fetchShops(page, rowNumber, queryValue, ecommerce, currency, status, selectedStartDate, selectedEndDate)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateTableFlag])

    // useEffect(() => {
    //     let tableRefresh = setInterval(() => _fetchShops(queryValue, ecommerce, currency, status), 1000)
    //     return () => {
    //         clearInterval(tableRefresh)
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [])

    const _fetchShops = async (page, limit, searchQuery, ecommerce, currency, status, since, until) => {
        setTableLoading(true)
        const storesRes = await getShopsList(page, limit, searchQuery, ecommerce, currency, status, since, until)
        if (storesRes.success && storesRes.data) {
            setShop(storesRes.data.results)
            setStateContext(storesRes.data.results)

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
        setShop([])
        setPage(page)
        _fetchShops(page, rowNumber, queryValue, ecommerce, currency, status, selectedStartDate, selectedEndDate)
    }

    const _columns = [
        {
            title: 'Flatform',
            dataIndex: 'flatform',
            width: 120,
            align: 'center',
            key: 'flatform',
            render: (text, record) => (
                <div>
                    <img src={record.ecommerce.name.toLowerCase() === 'shopify' ? shopify : woocommerce}
                         alt={record.ecommerce} width={30}/>
                </div>
            ),
        },
        {
            title: 'Store',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <Link to={Paths.ListProductsByShop(record.id)}>{text}</Link>
                </div>
            ),
        },
        // {
        //     title: 'Shopify\'s Link ',
        //     dataIndex: 'link',
        //     key: 'link',
        //     render: (url, record) => (
        //         <div>
        //             <PolarisLink url={`https://${url}`} external>
        //                 Visit
        //             </PolarisLink>
        //         </div>
        //     )
        // },
        {
            title: 'Updated time',
            dataIndex: 'update_time',
            key: 'update_time',
            render: (datetime) => {
                return formatDatetime(datetime)
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
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => {
                return (<ShopStatusTag status={status}/>)
            }
        },
        {
            title: 'Options',
            dataIndex: 'url',
            key: 'url',
            align: "center",
            render: (url, record) => (
                <div
                    className={"flex-center align-items-start"}
                >
                    <a href={`https://${url}`} target="_blank" rel="noopener noreferrer"
                       className={'non-underline-hover'}>
                        <Button className="m5"
                            // icon={ExternalSmallMinor}
                        >Visit</Button>
                    </a>
                    {/*<PolarisLink url={`https://${url}`} external>*/}
                    {/*Visit*/}
                    {/*</PolarisLink>*/}
                    {/*{record.status !== 'inactive'*/}
                    {/*&& <Button destructive onClick={() => uninstall(record.id)}>Uninstall</Button>*/}
                    {/*}*/}
                    <div
                        className={"mx-3"}
                    >
                        <Button primary onClick={() => {
                            if (record.status === 'inactive') {
                                window.location.href = getShopIfyAuthUrl(record.url)
                            } else {
                                history.push(Paths.ShopSetting(record.id))
                            }
                        }}>
                            {record.status === 'inactive'
                                ? (<span>Reinstall</span>)
                                : (<span>&nbsp;Setting&nbsp;</span>)
                            }
                        </Button>
                    </div>
                </div>
            )
        }
    ]
    ///

    const handleEcommerceChange = (value) => {
        setEcommerce(value[0])
        _fetchShops(1, rowNumber, queryValue, value[0], currency, status, selectedStartDate, selectedEndDate)
    }
    const handleCurrencyChange = (value) => {
        setCurrency(value[0])
        _fetchShops(1, rowNumber, queryValue, ecommerce, value[0], status, selectedStartDate, selectedEndDate)
    }
    const handleStatusChange = (value) => {
        setStatus(value[0])
        _fetchShops(1, rowNumber, queryValue, ecommerce, currency, value[0], selectedStartDate, selectedEndDate)
    }
    const handleQueryValueChange = (value) => {
        setQueryValue(value === '' ? null : value)
        _fetchShops(1, rowNumber, value, ecommerce, currency, status, selectedStartDate, selectedEndDate)
    }

    const handleRowNumberChange = (value) => {
        setRowNumber(value[0])
        _fetchShops(1, value[0], queryValue, ecommerce, currency, status, selectedStartDate, selectedEndDate)
    }

    const handleEcommerceRemove = () => {
        setEcommerce(null)
        _fetchShops(1, rowNumber, queryValue, null, currency, status, selectedStartDate, selectedEndDate)
    }
    const handleCurrencyRemove = () => {
        setCurrency(null)
        _fetchShops(1, rowNumber, queryValue, ecommerce, null, status, selectedStartDate, selectedEndDate)
    }
    const handleStatusRemove = () => {
        setStatus(null)
        _fetchShops(1, rowNumber, queryValue, ecommerce, currency, null, selectedStartDate, selectedEndDate)
    }
    const handleQueryValueRemove = () => {
        setQueryValue(null)
        _fetchShops(1, rowNumber, null, ecommerce, currency, status, selectedStartDate, selectedEndDate)
    }

    const handleFiltersClearAll = useCallback(() => {
        setEcommerce(null)
        setCurrency(null)
        setStatus(null)
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
        // // alert(value)
        setDateRangeChoice(value[0])
        setDateRange(null)
        setPage(1)
        let {since, until} = formatTimeSelect(value[0])
        setSelectedStartDate(since)
        setSelectedEndDate(until)
        return _fetchShops(1, rowNumber, queryValue, ecommerce, currency, status, since, until)
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
            return _fetchShops(1, rowNumber, queryValue, ecommerce, currency, status, date.toISOString(), selectedEndDate)
        }
    }

    const handleEndDateSelect = (date) => {
        const endTime = moment(date.toISOString()).endOf("day").toISOString()
        setSelectedEndDate(endTime)
        if (selectedStartDate) {
            setDateRange(`${formatShortDate(new Date(selectedStartDate))} - ${formatShortDate(date)}`)
            setPage(1)
            return _fetchShops(1, rowNumber, queryValue, ecommerce, currency, status, selectedStartDate, endTime)
        }
    }

    const handleDateRangeRemove = () => {
        setDateRangeChoice(null)
        setDateRange(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        setPage(1)
        _fetchShops(1, rowNumber, queryValue, ecommerce, currency, status, null, null)
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
            key: 'status',
            label: 'Status',
            filter: (
                <ChoiceList
                    title="Status"
                    titleHidden
                    choices={STATUS_OPTIONS}
                    selected={status || []}
                    onChange={handleStatusChange}
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
            case 'status':
                return `${STATUSES_OBJECT[value]}`
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
    if (!isEmpty(status)) {
        const key = 'status'
        if (status !== null) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, status),
                onRemove: handleStatusRemove,
            })
        }
    }

    return (
        <Card className={'shopifilize-card'} bodyStyle={{paddingTop: 0}}>
            <Card.Section>
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
            </Card.Section>
            <div className="shops-table-page shopifilize-table">
                <Table
                    dataSource={shop}
                    columns={_columns}
                    loading={tableLoading}
                    rowKey="id"
                    {...scrollTable}
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
        </Card>
    )

}

export default withRouter(ShopTable)
