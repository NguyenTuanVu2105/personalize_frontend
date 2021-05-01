import React, {useCallback, useContext, useEffect, useState} from 'react'
import {notification, Table} from 'antd'
import {getInvoiceList, rechargeFailedInvoices} from '../../../services/api/invoices'
import Paths from '../../../routes/Paths'
import UserPageContext from '../../userpage/context/UserPageContext'
import DocTitle from '../../shared/DocTitle'
import InvoiceStatus from './InvoiceStatus'
import PaymentMethodIcon from '../../billings/components/PaymentMethodIcon'
import {formatDatetime, formatShortDate} from '../../../services/util/datetime'
import {Link, withRouter} from 'react-router-dom'
import {Button, Card, ChoiceList, DisplayText, Filters, Modal, Stack, TextContainer} from '@shopify/polaris'
import {AUTO_REFRESH_INVOICES_TABLE} from '../../../configs/autoRefresh'
import TableStatus from "../../shared/TableStatus"
import {Calendar} from "react-date-range"
import {DATE_RANGE} from "../../orders/constants"
import {formatTimeSelect} from "../../../shared/formatTime"
import moment from 'moment-timezone'

const ALL_QUERY_INDEX = '3'
const CANCELLED_QUERY_INDEX = '4'
const FAILED_QUERY_INDEX = '2'
const SERVER_CANCELLED_QUERY_INDEX = '-1'
const SERVER_ALL_QUERY_INDEX = '-2'
const defaultRowNumber = '10'
const paymentstatusObj = {
    [ALL_QUERY_INDEX]: 'All',
    '0': 'Unpaid',
    '1': 'Paid',
    [CANCELLED_QUERY_INDEX]: 'Canceled',
    [FAILED_QUERY_INDEX]: 'Failed',
}


const Invoices = (props) => {
    const [invoices, setInvoices] = useState([])
    const [invoiceCount, setInvoiceCount] = useState(20)
    const [_isLoading, _setIsLoading] = useState(true)
    const [_page, _setPage] = useState(1)
    // const [_userSettings, _setUserSettings] = useState({})

    const [paymentStatus, setPaymentStatus] = useState(ALL_QUERY_INDEX)
    const [rowNumber, setRowNumber] = useState(defaultRowNumber)
    const [queryValue, setQueryValue] = useState(null)

    const [dateRangeChoice, setDateRangeChoice] = useState(null)
    const [dateRange, setDateRange] = useState(null)
    const [selectedStartDate, setSelectedStartDate] = useState(null)
    const [selectedEndDate, setSelectedEndDate] = useState(null)

    const [rechargeConfirmModalDisplay, setRechargeConfirmModalDisplay] = useState(false)

    const CUSTOM_TIME_QUERY = '7'

    const {setNameMap} = props

    const {scrollTable} = useContext(UserPageContext)

    useEffect(() => {
        _updateNameMap()
        _fetchInvoiceList(1, defaultRowNumber, queryValue)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (AUTO_REFRESH_INVOICES_TABLE) {
            let tableRefresh = setInterval(_fetchInvoiceList, 10000)
            return () => {
                clearInterval(tableRefresh)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_page, queryValue, rowNumber])

    const _fetchInvoiceList = async (page, limit, query, paymentStatus, since = null, until = null) => {
        _setIsLoading(true)
        const paymentStatusQuery = paymentStatus === ALL_QUERY_INDEX ? SERVER_ALL_QUERY_INDEX : paymentStatus === CANCELLED_QUERY_INDEX ? SERVER_CANCELLED_QUERY_INDEX : paymentStatus
        const invoiceResp = await getInvoiceList(query, page || _page, limit || rowNumber, paymentStatusQuery, since, until)
        const {
            count,
            results: invoiceResult,
            // user_settings
        } = invoiceResp.data
        const _invoices = invoiceResult.map(invoice => {
            return {
                key: invoice.id,
                ...invoice
            }
        })
        setInvoiceCount(count)
        setInvoices(_invoices)
        // _setUserSettings(user_settings)
        _setIsLoading(false)
    }

    const _rechargeFailedInvoices = async () => {
        const resp = await rechargeFailedInvoices()
        if (resp.data && resp.data.success) {
            notification.success({
                message: 'Retrying to charge failed billings'
            })
            await _fetchInvoiceList(_page, rowNumber, queryValue, paymentStatus)
        } else {
            notification.error({
                message: 'Error occurred while retrying to charge failed billings ',
            })
        }
    }

    const _updateNameMap = () => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.InvoiceList]: 'Billings'
        })
    }

    const columns = [
        {
            title: 'Billing ID',
            dataIndex: 'id',
            key: 'id',
            className: 'cell-width-fit-content',
            render: (id) => {
                return <Link to={Paths.InvoiceDetail(id)}>#{id}</Link>
            }
        },
        {
            title: 'Created time',
            dataIndex: 'create_time',
            key: 'create_time',
            align: 'left',
            render: (datetime) => {
                return formatDatetime(datetime)
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'left',
            render: (status) => {
                return <InvoiceStatus status={status}/>
            }
        },
        {
            title: 'Payment method',
            dataIndex: 'payment_method',
            key: 'payment_method',
            align: 'left',
            width: '30%',
            render: (item) => {
                if (item) {
                    let payment_method_type = item.type
                    let message = item.last4
                        ? `**** **** **** ${item.last4}`
                        :
                        item.email || item.label
                    return (
                        <div className="flex-middle" style={{height: '30px'}}>
                            <span style={{height: 30, display: 'flex', justifyContent: 'start'}}>
                                <PaymentMethodIcon brand={payment_method_type}/>
                            </span>
                            <span style={{fontWeight: 'bold'}}>{message}</span>
                        </div>
                    )
                }
            }
        },
        {
            title: 'Total cost',
            dataIndex: 'total_cost',
            key: 'total_cost',
            className: 'align-right-cell',
            render: (text, {currency}) => {
                return <span>{text} {currency}</span>
            }
        },
    ]

    // const rowSelection = {
    //     onChange: (selectedRowKeys, selectedRows) => {
    //         console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
    //     },
    //     getCheckboxProps: record => ({
    //         id: record.id,
    //     }),
    // }

    const _onPageChange = (newPage) => {
        _setPage(newPage)
        _fetchInvoiceList(newPage, rowNumber, queryValue, paymentStatus, selectedStartDate, selectedEndDate)
    }

    const renderAddPaymentMethodWithHistory = () => {
        const paymentPath = Paths.PaymentManager
        const PaymentButton = withRouter(({history}) => (
            <Button primary onClick={() => {
                history.push(paymentPath)
            }}>Manage payment methods</Button>
        ))

        return <PaymentButton/>
    }
    const handlePaymentStatusChange = (value) => {
        setPaymentStatus(value[0])
        _fetchInvoiceList(1, rowNumber, queryValue, value[0], selectedStartDate, selectedEndDate)
    }

    const handleFiltersQueryChange = (value) => {
        setQueryValue(value)
        _fetchInvoiceList(1, rowNumber, value, paymentStatus, selectedStartDate, selectedEndDate)
    }

    const handleRowNumberChange = (value) => {
        setRowNumber(value[0])
        _setPage(1)
        _fetchInvoiceList(1, value[0], queryValue, paymentStatus, selectedStartDate, selectedEndDate)
    }

    const handlePaymentStatusRemove = () => {
        setPaymentStatus(null)
        _fetchInvoiceList(1, rowNumber, queryValue, ALL_QUERY_INDEX, selectedStartDate, selectedEndDate)
    }

    const handleQueryValueRemove = () => {
        setQueryValue(null)
        _fetchInvoiceList(1, rowNumber, null, paymentStatus, selectedStartDate, selectedEndDate)
    }

    const handleDateRangeChoiceChange = (value) => {
        // // alert(value)
        setDateRangeChoice(value[0])
        setDateRange(null)
        _setPage(1)
        let {since, until} = formatTimeSelect(value[0])
        setSelectedStartDate(since)
        setSelectedEndDate(until)
        return _fetchInvoiceList(1, rowNumber, queryValue, paymentStatus, since, until)
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
            return _fetchInvoiceList(1, rowNumber, queryValue, paymentStatus, date.toISOString(), selectedEndDate)
        }
    }

    const handleEndDateSelect = (date) => {
        const endTime = moment(date.toISOString()).endOf("day").toISOString()
        setSelectedEndDate(endTime)
        if (selectedStartDate) {
            setDateRange(`${formatShortDate(new Date(selectedStartDate))} - ${formatShortDate(date)}`)
            _setPage(1)
            return _fetchInvoiceList(1, rowNumber, queryValue, paymentStatus, selectedStartDate, endTime)
        }
    }

    const handleDateRangeRemove = () => {
        setDateRange(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        setDateRangeChoice(null)
        _setPage(1)
        _fetchInvoiceList(1, rowNumber, queryValue, paymentStatus, null, null)
    }


    const handleFiltersClearAll = useCallback(() => {
        setPaymentStatus(null)
        setQueryValue(null)
        setRowNumber(defaultRowNumber)
        setDateRange(null)
        setDateRangeChoice(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        _setPage(1)
        _fetchInvoiceList(1, defaultRowNumber, null, ALL_QUERY_INDEX, null, null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const disambiguateLabel = (key, value) => {
        switch (key) {
            case 'dateRange':
                if (value.range) {
                    return `${value.range}`
                } else {
                    return `${DATE_RANGE[value.choice]}`
                }
            case 'paymentStatus':
                return `Payment status: ${paymentstatusObj[value]}`
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
                            {label: 'Custom', value: "7"},
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
            key: 'paymentStatus',
            label: 'Payment status',
            filter: (
                <ChoiceList
                    title="Payment status"
                    titleHidden
                    choices={[
                        {label: 'All', value: ALL_QUERY_INDEX},
                        {label: 'Unpaid', value: '0'},
                        {label: 'Paid', value: '1'},
                        {label: 'Canceled', value: CANCELLED_QUERY_INDEX},
                        {label: 'Failed', value: FAILED_QUERY_INDEX},
                    ]}
                    selected={paymentStatus || ALL_QUERY_INDEX}
                    onChange={handlePaymentStatusChange}
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
                        {label: '5', value: '05'},
                        {label: '10', value: '10'},
                        {label: '20', value: '20'},
                        {label: '30', value: '30'},
                        {label: '50', value: '50'},
                    ]}
                    selected={rowNumber || '10'}
                    onChange={handleRowNumberChange}
                    // allowMultiple
                />
            ),
            // shortcut: true,
        }
    ]

    const toggleRechargeConfirmModal = () => setRechargeConfirmModalDisplay(!rechargeConfirmModalDisplay)

    return (
        <div>
            <DocTitle title={_isLoading ? 'Loading...' : 'Billings'}/>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <TextContainer spacing="tight">
                    <DisplayText element="h3" size="large">Billings</DisplayText>
                    <p>
                        All your store's billings are listed below
                    </p>
                </TextContainer>
                <div className={'btn-heading'}>
                    {/*{_userSettings.is_charge_halted && <div className={"m-r-20"}>*/}
                    {/*    <Button destructive onClick={toggleRechargeConfirmModal}>*/}
                    {/*        <Icon type="reload" spin={_isLoading}/>&nbsp; Recharge failed billings*/}
                    {/*    </Button>*/}
                    {/*</div>}*/}
                    {
                        renderAddPaymentMethodWithHistory()
                    }
                </div>
            </div>
            <div className="page-main-content">
                <Card className="shopifilize-card">
                    <Card.Section>
                        <Stack>
                            <Stack.Item fill>
                                <Filters
                                    queryPlaceholder={'Billing ID, Related order ID'}
                                    queryValue={queryValue}
                                    filters={filters}
                                    appliedFilters={appliedFilters}
                                    onQueryChange={handleFiltersQueryChange}
                                    onQueryClear={handleQueryValueRemove}
                                    onClearAll={handleFiltersClearAll}
                                />
                            </Stack.Item>
                            <Stack.Item>
                                <TableStatus loading={_isLoading} amount={invoiceCount} objectName={"invoice"}
                                             verboseObjectName={"invoices"}/>
                            </Stack.Item>
                        </Stack>
                    </Card.Section>
                    <div className={'shopifilize-table'}>
                        <Table
                            dataSource={invoices}
                            loading={_isLoading}
                            columns={columns}
                            {...scrollTable}
                            pagination={{
                                onChange: _onPageChange,
                                total: invoiceCount,
                                pageSize: parseInt(rowNumber),
                                current: _page,
                                showQuickJumper: true,
                                showSizeChanger: false
                            }}
                        />
                    </div>
                </Card>
            </div>
            <Modal
                open={rechargeConfirmModalDisplay}
                onClose={toggleRechargeConfirmModal}
                title={`Recharge all failed billings`}
                primaryAction={{
                    content: 'Yes, I confirm',
                    onAction: () => {
                        _rechargeFailedInvoices()
                        toggleRechargeConfirmModal()
                    },
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: toggleRechargeConfirmModal,
                    },
                ]}
            >
                <Modal.Section>
                    <TextContainer>
                        <p>
                            Are you sure to recharge all failed billings?
                        </p>
                    </TextContainer>
                </Modal.Section>
            </Modal>
        </div>
    )
}

export default (props) => <UserPageContext.Consumer>
    {(context) => {
        return (<Invoices {...{...props, ...context}} />)
    }}
</UserPageContext.Consumer>
