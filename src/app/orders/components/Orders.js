import React, {useCallback, useContext, useEffect, useState} from 'react'
import {Table} from 'antd'
import {getOrders} from '../../../services/api/orders'
import Paths from '../../../routes/Paths'
import UserPageContext from '../../userpage/context/UserPageContext'
import DocTitle from '../../shared/DocTitle'
import FulfillStatusTag from './share/FulfillStatusTag'
import './Orders.scss'
import {Link} from 'react-router-dom'
import OrderDocumentsList from './orders/OrderDocumentsList'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons'
import {formatDatetime, formatShortDate} from '../../../services/util/datetime'
import FinancialStatusTag from './share/FinancialStatusTag'
import {numberFormatCurrency} from '../../shared/FormatNumber'
import {
    Card,
    ChoiceList,
    DisplayText,
    Filters,
    Link as PolarisLink,
    Stack,
    TextContainer,
    Tooltip
} from '@shopify/polaris'
import {AUTO_REFRESH_ORDERS_TABLE} from '../../../configs/autoRefresh'
import OrderTrackingInfo from './orders/OrderTrackingInfo'
import OrderMailSupport from './orders/OrderMailSupport'
import {TableSortButton} from '../../shared/TableSortButton'
import {ALL_QUERY_INDEX, DATE_RANGE, DISPLAY_TYPE, FULFILLMENT_STATUS, PAYMENT_STATUS, SORT_OPTIONS} from '../constants'
import {Calendar} from 'react-date-range'

import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import {isInFrame} from '../../../services/util/windowUtil'
import TableStatus from "../../shared/TableStatus"
import CreateTicketModal from "../../tickets/components/CreateTicketModal"
import ViewTicketsModal from "./orders/ViewTicketsModal"
import moment from 'moment-timezone'
import {formatTimeSelect} from "../../../shared/formatTime"
import {getSessionStorage, SESSION_KEY} from "../../../services/storage/sessionStorage"
import AppContext from "../../../AppContext"
import {getShopDefault} from "../../../services/api/shops";
import RechargeButton from "./share/RechargeButton"


const defaultRowNumber = '10'
const CUSTOM_TIME_QUERY = '7'
const SERVER_ALL_QUERY_INDEX = '-1'

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [_isLoading, _setIsLoading] = useState(true)
    const [_totalOrders, _setTotalOrders] = useState(2)
    const [_page, _setPage] = useState(1)

    const [dateRangeChoice, setDateRangeChoice] = useState(null)
    const [dateRange, setDateRange] = useState(null)
    const [fulfillmentStatus, setFulfillmentStatus] = useState(ALL_QUERY_INDEX)
    const [paymentStatus, setPaymentStatus] = useState(ALL_QUERY_INDEX)
    const [shopOptions, setShopOptions] = useState([])
    const [currentShopOption, setCurrentShopOption] = useState(ALL_QUERY_INDEX)
    const [rowNumber, setRowNumber] = useState(defaultRowNumber)
    const [queryValue, setQueryValue] = useState(null)

    const {setNameMap, setViewWidth, setDefaultViewWidth, scrollTable} = useContext(UserPageContext)
    const {setLoading} = useContext(AppContext)

    const [selectedStartDate, setSelectedStartDate] = useState(null)
    const [selectedEndDate, setSelectedEndDate] = useState(null)

    const [sortSelected, setSortSelected] = useState(null)

    const [shopDefault, setShopDefault] = useState(null)

    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    // const [userSettings, setUserSetting] = useState({})
    // const [visibleCreateModal, _setVisibleCreateModal] = useState(false)
    // const [visibleViewModal, _setVisibleViewModal] = useState(false)
    // const [selectedOrders, _setSelectedOrders] = useState([])
    // const [orderId, _setOrderId] = useState(null)

    const onSelectChange = selectedRowKeys => {
        setSelectedRowKeys(selectedRowKeys)
    }

    const rowSelection = {
        columnWidth: 40,
        selectedRowKeys,
        onChange: onSelectChange,
    }

    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.Orders]: 'Orders'
        })
        setViewWidth(100)
        _setPage(1)
        fetchDefaultShop().then((shopDefault) => {
            setShopDefault(shopDefault)
            fetchOrders(1, queryValue, rowNumber, fulfillmentStatus, paymentStatus, currentShopOption, selectedStartDate, selectedEndDate, sortSelected, shopDefault)
        })
        return () => {
            setDefaultViewWidth()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (AUTO_REFRESH_ORDERS_TABLE) {
            let tableRefresh = setInterval(fetchOrders, 10000)

            return () => {
                clearInterval(tableRefresh)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_page, queryValue, rowNumber, paymentStatus, fulfillmentStatus])

    const fetchDefaultShop = async () => {
        const {success, data} = await getShopDefault()
        if (success) {
            return data.id
        }
        return
    }
    const columns = [
        {
            title: (<div className="flex-center">{selectedRowKeys.length > 0 &&
            <OrderMailSupport order_ids={selectedRowKeys}/>}</div>),
            dataIndex: 'mail',
            key: 'mail',
            render: (content, record) => {
                return <OrderMailSupport order={record}/>
            },
            width: 40,
            align: 'center'
        },
        {
            title: 'ID',
            dataIndex: 'order',
            key: 'order',
            render: (text, record) => {
                const _color = record.tracking ? 'gray' : null
                return <div>
                    <Link to={Paths.OrderDetail(record.key)} style={{color: _color}}>#{record.key}</Link>
                    <p>{record.shop.url.replace(".myshopify.com", "")}</p>
                </div>

            }
        },
        {
            title: 'Number',
            dataIndex: 'order_number',
            key: 'order_number',
            render: (text, record) => {
                const _color = record.tracking ? 'gray' : null
                /* eslint-disable jsx-a11y/anchor-is-valid */
                return text ?
                    <Tooltip content={"View in store admin"}>
                        <PolarisLink url={`https://${record.shop.url}/admin/orders/${record.order_id}`}
                                     style={{color: _color}} external>#{text}</PolarisLink>
                    </Tooltip>
                    : <a>#printholo</a>

            }
        },
        {
            title: 'Created time',
            dataIndex: 'create_time',
            key: 'create_time',
            render: (datetime) => {
                return formatDatetime(datetime)
            }
        },
        {
            title: 'Customer',
            dataIndex: 'customer_info',
            key: 'customer_info',
            width: "20%",
            render: (customer) => {
                if (customer) {
                    return (
                        <div className={'my-1'}>
                            <div>{customer.first_name}&nbsp;{customer.last_name}</div>
                            <div>{customer.email}</div>
                            <div>{customer.phone}</div>
                        </div>
                    )
                } else {
                    return "N/A"
                }
            },

        },
        {
            title: 'Fulfillment',
            dataIndex: 'fulfill_status',
            key: 'fulfill_status',
            align: 'left',
            // width: 140,
            render: (text, record) => {
                return !record.tracking ? <FulfillStatusTag statusText={text}/> :
                    <FulfillStatusTag statusText={'fulfilled_complete'}/>
            }
        },
        {
            title: 'Payment',
            dataIndex: 'financial_status',
            key: 'financial_status',
            align: 'left',
            // width: 150,
            render: (text, record) => {
                return (
                    <div className={"flex-start"}>
                        <div>
                            <FinancialStatusTag statusText={text} fulfill_status={record.fulfill_status}/>
                        </div>
                        {
                            record.financial_status === "failed" && (
                                <div className={"ml-2"}>
                                    <RechargeButton displayType={DISPLAY_TYPE.LIST} orderId={record.key}
                                                    callback={fetchOrders}/>
                                </div>
                            )
                        }
                    </div>
                )
            }
        },
        {
            title: 'Total cost',
            dataIndex: 'total_cost',
            align: 'right',
            key: 'total_cost',
            render: (cost) => {
                return (
                    <div>
                        {cost ? numberFormatCurrency(cost) : 'N/A'}
                    </div>
                )
            }
        },
        {
            title: 'Tracking status',
            dataIndex: 'totalBaseCost',
            key: 'totalBaseCost',
            width: 150,
            render: (cost, record) => {
                return <OrderTrackingInfo orderMetadata={record.cached_metadata} tracking={record.tracking}/>
            }
        },
    ]

    const _onPageChange = (page) => {
        setOrders([])
        _setPage(page)
        fetchOrders(page, queryValue, rowNumber, fulfillmentStatus, paymentStatus, currentShopOption, selectedStartDate, selectedEndDate, sortSelected, shopDefault)
    }


    const orderDetailsList = (record, index, indent, expanded) => {
        if (expanded) {
            return <OrderDocumentsList orderId={record.key}/>
        }
    }

    const customExpandIcon = (e) => {
        return <div
            className="expand-row-icon"
            onClick={ev => e.onExpand(e.record, ev)}
            style={{cursor: 'pointer'}}>
            {e.expanded ? <FontAwesomeIcon icon={faChevronUp}/> : <FontAwesomeIcon icon={faChevronDown}/>}
        </div>
    }

    const handleDateRangeChoiceChange = (value) => {
        // // alert(value)
        setDateRangeChoice(value[0])
        setDateRange(null)
        _setPage(1)
        let {since, until} = formatTimeSelect(value[0])
        setSelectedEndDate(until)
        setSelectedStartDate(since)
        return fetchOrders(1, queryValue, rowNumber, fulfillmentStatus, paymentStatus, currentShopOption, since, until, sortSelected, shopDefault)
    }

    const handleFulfillmentStatusChange = (value) => {
        setFulfillmentStatus(value[0])
        _setPage(1)
        fetchOrders(1, queryValue, rowNumber, value[0], paymentStatus, currentShopOption, selectedStartDate, selectedEndDate, sortSelected, shopDefault)
    }

    const handlePaymentStatusChange = (value) => {
        setPaymentStatus(value[0])
        _setPage(1)
        fetchOrders(1, queryValue, rowNumber, fulfillmentStatus, value[0], currentShopOption, selectedStartDate, selectedEndDate, sortSelected, shopDefault)
    }

    const handleShopOptionChange = (value) => {
        setCurrentShopOption(value[0])
        _setPage(1)
        fetchOrders(1, queryValue, rowNumber, fulfillmentStatus, paymentStatus, value[0], selectedStartDate, selectedEndDate, sortSelected, shopDefault)
    }

    const handleFiltersQueryChange = (value) => {
        setQueryValue(value)
        _setPage(1)
        fetchOrders(1, value, rowNumber, fulfillmentStatus, paymentStatus, currentShopOption, selectedStartDate, selectedEndDate, sortSelected, shopDefault)
    }

    const handleRowNumberChange = (value) => {
        setRowNumber(value[0])
        _setPage(1)
        fetchOrders(1, queryValue, value[0], fulfillmentStatus, paymentStatus, currentShopOption, selectedStartDate, selectedEndDate, sortSelected, shopDefault)
    }

    const handleDateRangeRemove = () => {
        setDateRange(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        setDateRangeChoice(null)
        _setPage(1)
        fetchOrders(1, queryValue, rowNumber, fulfillmentStatus, paymentStatus, currentShopOption, null, null, sortSelected, shopDefault)
    }


    const handleFulfillmentStatusRemove = () => {
        setFulfillmentStatus(null)
        _setPage(1)
        fetchOrders(1, queryValue, rowNumber, ALL_QUERY_INDEX, paymentStatus, currentShopOption, selectedStartDate, selectedEndDate, sortSelected, shopDefault)

    }
    const handlePaymentStatusRemove = () => {
        setPaymentStatus(null)
        _setPage(1)
        fetchOrders(1, queryValue, rowNumber, fulfillmentStatus, ALL_QUERY_INDEX, currentShopOption, selectedStartDate, selectedEndDate, sortSelected, shopDefault)
    }

    const handleCurrentShopRemove = () => {
        setCurrentShopOption(null)
        _setPage(1)
        fetchOrders(1, queryValue, rowNumber, fulfillmentStatus, paymentStatus, ALL_QUERY_INDEX, selectedStartDate, selectedEndDate, sortSelected, shopDefault)
    }

    const handleQueryValueRemove = () => {
        setQueryValue(null)
        _setPage(1)
        fetchOrders(1, null, rowNumber, fulfillmentStatus, paymentStatus, currentShopOption, selectedStartDate, selectedEndDate, sortSelected, shopDefault)
    }

    const handleFiltersClearAll = useCallback(() => {
        setDateRange(null)
        setDateRangeChoice(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        setFulfillmentStatus(null)
        setPaymentStatus(null)
        setQueryValue(null)
        setCurrentShopOption(null)
        setRowNumber(defaultRowNumber)
        _setPage(1)
        fetchOrders(1, null, defaultRowNumber, ALL_QUERY_INDEX, ALL_QUERY_INDEX, ALL_QUERY_INDEX, null, null, null, shopDefault)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchOrders = async (page, query, limit, fulfillmentStatus, paymentStatus, shopOption, since, until, ordering = sortSelected, defaultShop = null) => {
        _setIsLoading(true)
        const sessionShop = getSessionStorage(SESSION_KEY.SHOP)
        const fulfillmentStatusQuery = fulfillmentStatus === ALL_QUERY_INDEX ? SERVER_ALL_QUERY_INDEX : fulfillmentStatus
        const paymentStatusQuery = paymentStatus === ALL_QUERY_INDEX ? SERVER_ALL_QUERY_INDEX : paymentStatus
        const shopOptionQuery = (sessionShop ? (defaultShop ? [sessionShop.id, defaultShop] : [sessionShop.id]) : (shopOption === ALL_QUERY_INDEX ? null : shopOption))
        const orderResp = await getOrders(query, page || _page, limit || rowNumber, fulfillmentStatusQuery, paymentStatusQuery, shopOptionQuery, since, until, ordering)
        const {data: orderData} = orderResp
        const {
            count: orderCount, results: orderResult, options,
            // user_settings: userSetting
        } = orderData


        let orderSample = options.shops.find((shops) => !shops.url)
        let shops = options.shops.filter((shops) => shops.url)
        if (orderSample) {
            shops.unshift(orderSample)
        }
        let result = shops.map(({id, url, name}) => ({
                label: url ? url : "Order sample",
                value: id.toString()
            })
        )

        setShopOptions(result)

        _setTotalOrders(orderCount)
        orderResult.forEach(order => {
            order.key = order.id
            order['tracking'] = (order.fulfill_status === 'fulfilled' && order.cached_metadata.packs.length > 0 &&
                order.cached_metadata.packs.every(item => item.tracking_status === 'delivered'))
        })
        setOrders(orderResult)
        // setUserSetting(userSetting)
        _setIsLoading(false)
        setLoading(false)
    }

    const handleStartDateSelect = (date) => {
        const startTime = moment(date.toISOString()).startOf("day").toISOString()
        setSelectedStartDate(startTime)
        if (selectedEndDate) {
            setDateRange(`${formatShortDate(date)} - ${formatShortDate(new Date(selectedEndDate))}`)
            _setPage(1)
            return fetchOrders(1, queryValue, rowNumber, fulfillmentStatus, paymentStatus, currentShopOption, startTime, selectedEndDate, sortSelected, shopDefault)
        }
    }

    const handleEndDateSelect = (date) => {
        const endTime = moment(date.toISOString()).endOf("day").toISOString()
        setSelectedEndDate(endTime)
        if (selectedStartDate) {
            setDateRange(`${formatShortDate(new Date(selectedStartDate))} - ${formatShortDate(date)}`)
            _setPage(1)
            return fetchOrders(1, queryValue, rowNumber, fulfillmentStatus, paymentStatus, currentShopOption, selectedStartDate, endTime, sortSelected, shopDefault)
        }
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

    const disambiguateLabel = (key, value) => {
        switch (key) {
            case 'dateRange':
                if (value.range) {
                    return `${value.range}`
                } else {
                    return `${DATE_RANGE[value.choice]}`
                }
            case 'fulfillmentStatus':
                return `Fulfillment Status: - ${FULFILLMENT_STATUS[value]}`
            case 'paymentStatus':
                return `Payment Status: ${PAYMENT_STATUS[value]}`
            case 'currentShopOption':
                let shopOption = shopOptions.find(e => e.value === value)
                return `Store / Type: ${shopOption.label}`
            // case 'rowNumber':
            //     return `Item per page: ${value}`
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

    if (!isEmpty(fulfillmentStatus)) {
        const key = 'fulfillmentStatus'
        if (fulfillmentStatus !== ALL_QUERY_INDEX) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, fulfillmentStatus),
                onRemove: handleFulfillmentStatusRemove,
            })
        }
    }

    if (!isEmpty(paymentStatus)) {
        const key = 'paymentStatus'
        if (paymentStatus !== ALL_QUERY_INDEX) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, paymentStatus),
                onRemove: handlePaymentStatusRemove,
            })
        }
    }

    if (!isEmpty(currentShopOption)) {
        const key = 'currentShopOption'
        if (currentShopOption !== ALL_QUERY_INDEX) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, currentShopOption),
                onRemove: handleCurrentShopRemove,
            })
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
            key: 'fulfillmentStatus',
            label: 'Fulfillment Status',
            filter: (
                <ChoiceList
                    title="Fulfillment Status"
                    titleHidden
                    choices={[
                        {label: 'All', value: ALL_QUERY_INDEX},
                        {label: 'Unfulfilled', value: '5'},
                        {label: 'Pending', value: '6'},
                        {label: 'Requested', value: '10'},
                        {label: 'Partially In Production', value: '4'},
                        {label: 'In Production', value: '3'},
                        {label: 'Partially Fulfilled', value: '2'},
                        {label: 'Fulfilled', value: '1'},
                        {label: 'Canceled Shipping', value: '8'},
                        {label: 'Canceled', value: '7'},
                        {label: 'Rejected', value: '9'},
                    ]}
                    selected={fulfillmentStatus ? [fulfillmentStatus] : [ALL_QUERY_INDEX]}
                    onChange={handleFulfillmentStatusChange}
                    // allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: 'paymentStatus',
            label: 'Payment Status',
            filter: (
                <ChoiceList
                    title="Payment Status"
                    titleHidden
                    choices={[
                        {label: 'All', value: ALL_QUERY_INDEX},
                        {label: 'Pending', value: '1'},
                        {label: 'Partially Paid', value: '2'},
                        {label: 'Paid', value: '3'},
                        {label: 'Canceled', value: '4'},
                        {label: 'Failed', value: '5'},
                    ]}
                    selected={paymentStatus ? [paymentStatus] : [ALL_QUERY_INDEX]}
                    onChange={handlePaymentStatusChange}
                    // allowMultiple
                />
            ),
            shortcut: true,
        },

    ]

    if (!isInFrame()) {
        filters.push({
            key: 'currentShopOption',
            label: 'Store / Type',
            filter: (
                <ChoiceList
                    title="Store"
                    titleHidden
                    choices={shopOptions}
                    selected={currentShopOption ? [currentShopOption] : [ALL_QUERY_INDEX]}
                    onChange={handleShopOptionChange}
                    // allowMultiple
                />
            ),
            shortcut: true,
        },)
    }
    filters.push({
        key: 'rowNumber',
        label: 'Items per page',
        filter: (
            <ChoiceList
                title="Items per page"
                titleHidden
                choices={[
                    {label: '5', value: '05'},
                    {label: '10', value: '10'},
                    {label: '20', value: '20'},
                    {label: '30', value: '30'},
                    {label: '50', value: '50'},
                ]}
                selected={rowNumber ? [rowNumber] : ['10']}
                onChange={handleRowNumberChange}
                // allowMultiple
            />
        ),
        // shortcut: true,
    })


    const onSortChange = useCallback((value, params) => {
        setSortSelected(value[0])
        fetchOrders(...params, value[0], shopDefault)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shopDefault])


    // function Context
    // const setVisibleCreateModal = (value) => {
    //     _setVisibleCreateModal(value)
    // }
    //
    // const setVisibleViewModal = (value) => {
    //     _setVisibleViewModal(value)
    // }
    //
    // const setSelectedOrders = (value) => {
    //     _setSelectedOrders(value)
    // }
    //
    // const setOrderId = (value) => {
    //     _setOrderId(value)
    // }

    //end function Context

    const handleOnCreateTicketSuccess = () => {
        fetchOrders(_page, queryValue, rowNumber, fulfillmentStatus, paymentStatus, currentShopOption, selectedStartDate, selectedEndDate, sortSelected, shopDefault)
    }

    return (
        <div>
            <DocTitle title={_isLoading ? 'Loading...' : 'Orders'}/>
            <div>
                <TextContainer spacing="tight">
                    <DisplayText element="h3" size="large">Orders</DisplayText>
                    <p>
                        All your store's orders are listed below
                    </p>
                </TextContainer>
            </div>


            {/*<ModalContext.Provider value={{*/}
            {/*    visibleCreateModal,*/}
            {/*    visibleViewModal,*/}
            {/*    selectedOrders,*/}
            {/*    orderId,*/}
            {/*    setVisibleCreateModal,*/}
            {/*    setVisibleViewModal,*/}
            {/*    setSelectedOrders,*/}
            {/*    setOrderId*/}
            {/*}}*/}
            {/*>*/}
            <div className="page-main-content">
                <Card className="shopifilize-card">
                    <Card.Section>
                        <Stack>
                            <Stack.Item fill>
                                <Filters
                                    queryPlaceholder={'Order ID, Customer Name, Email'}
                                    queryValue={queryValue}
                                    filters={filters}
                                    appliedFilters={appliedFilters}
                                    onQueryChange={handleFiltersQueryChange}
                                    onQueryClear={handleQueryValueRemove}
                                    onClearAll={handleFiltersClearAll}
                                />
                            </Stack.Item>
                            <Stack.Item>
                                <TableStatus loading={_isLoading} amount={_totalOrders} objectName={"order"}
                                             verboseObjectName={"orders"}/>
                            </Stack.Item>
                            <Stack.Item>
                                <TableSortButton default_choice={'-create_time'} choices={SORT_OPTIONS}
                                                 onChange={onSortChange}
                                                 params={[_page, queryValue, rowNumber, fulfillmentStatus, paymentStatus, currentShopOption, selectedStartDate, selectedEndDate]}/>
                            </Stack.Item>
                        </Stack>
                    </Card.Section>
                    <div className={'shopifilize-table'}>
                        <Table
                            className="orders-table"
                            dataSource={orders}
                            loading={_isLoading}
                            columns={columns}
                            {...scrollTable}
                            expandedRowRender={orderDetailsList}
                            expandIcon={customExpandIcon}
                            rowSelection={rowSelection}
                            pagination={{
                                onChange: _onPageChange,
                                total: _totalOrders,
                                pageSize: parseInt(rowNumber),
                                current: _page,
                                showQuickJumper: true,
                                showSizeChanger: false
                            }}
                        />
                    </div>
                </Card>
            </div>
            <CreateTicketModal handleSuccess={handleOnCreateTicketSuccess}/>
            <ViewTicketsModal/>
            {/*</ModalContext.Provider>*/}
        </div>
    )
}

export default Orders
