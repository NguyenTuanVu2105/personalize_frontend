import React, {useContext, useEffect, useState} from "react"
import {Empty, Table} from "antd"
import {listSupportTicketByOrderId, listSupportTickets} from "../../../services/api/tickets"
import {Button, Card, ChoiceList, Filters, Stack} from "@shopify/polaris"
import TableStatus from "../../shared/TableStatus"
import createTicketImage from '../../../assets/images/create-ticket.png'
import {Calendar} from "react-date-range"
import {formatShortDate} from "../../../services/util/datetime"
import {DATE_RANGE} from "../../orders/constants"
import {formatTimeSelect} from "../../../shared/formatTime"
import moment from 'moment-timezone'
import UserPageContext from "../../userpage/context/UserPageContext"
import {TicketTableConfig} from "../constant/TicketTableConfig"

const mappingStatus = {
    2: "Open",
    3: "Pending",
    4: "Resolved",
    5: "Closed",
    "2,3": "Unresolved",
    "4,5": "Resolved",
}

const RESOLVED_STATUS = "resolved, closed"


const CUSTOM_TIME_QUERY = '7'
const defaultRowNumber = '10'
const defaultStatus = "0"
const defaultRead = "0"
const TicketsTable = (
    {
        order_id,
        totalTickets,
        setTotalTickets,
        openCreateModal,
        query,
        setQuery,
        config,
        action,
        fetchUnread
    }) => {

    const [columns, setColumns] = useState([])
    const [tickets, setTickets] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [dateRangeChoice, setDateRangeChoice] = useState(null)
    const [dateRange, setDateRange] = useState(null)
    const [selectedStartDate, setSelectedStartDate] = useState(null)
    const [selectedEndDate, setSelectedEndDate] = useState(null)
    const {scrollTable} = useContext(UserPageContext)

    useEffect(() => {
        fetchColumns()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const fetchData = async () => {
        if (fetchUnread) {
            fetchUnread()
        }
        let response
        if (order_id) {
            response = await listSupportTicketByOrderId(
                order_id,
                query.page,
                query.rowNumber,
                query.status === defaultStatus ? null : query.status,
                query.read === defaultRead ? null : query.read,
                query.q,
                query.since,
                query.until
            )
        } else {
            response = await listSupportTickets(
                query.page,
                query.rowNumber,
                query.status === defaultStatus ? null : query.status,
                query.read === defaultRead ? null : query.read,
                query.q,
                query.since,
                query.until
            )
        }
        const {success, message, data: ticketData} = response
        if (!success) {
            return console.log(message)
        }
        const {count, results: ticketResult} = ticketData

        ticketResult.forEach(ticket => {
            ticket.key = ticket.id
        })
        setTickets(ticketResult)
        setTotalTickets(count)
    }

    useEffect(() => {
        setIsLoading(true)
        fetchData().finally(() => {
            setIsLoading(false)
        })
        let notificationRefresh = setInterval(fetchData, 5 * 1000)

        return () => {
            clearInterval(notificationRefresh)
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query])


    const rowClick = (record) => {
        if (action) {
            action(record.id)
        }
    }


    const fetchColumns = async () => {
        let tmp = []

        config.column.forEach((column) => {
            tmp.push(column)
        })

        setColumns(tmp)
    }

    const handleStartDateSelect = (date) => {
        setSelectedStartDate(moment(date.toISOString()).startOf("day").toISOString())
        if (selectedEndDate) {
            setDateRange(`${formatShortDate(date)} - ${formatShortDate(new Date(selectedEndDate))}`)
            setQuery({
                ...query,
                ...{
                    since: moment(date.toISOString()).startOf("day").toISOString(),
                    until: selectedEndDate
                }
            })
        }

    }

    const handleEndDateSelect = (date) => {
        const endTime = moment(date.toISOString()).endOf("day").toISOString()
        setSelectedEndDate(endTime)
        if (selectedStartDate) {
            setDateRange(`${formatShortDate(new Date(selectedStartDate))} - ${formatShortDate(date)}`)
            setQuery({
                ...query,
                ...{
                    until: endTime,
                    since: selectedStartDate
                }
            })
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


    const handleDateRangeChoiceChange = (value) => {
        setDateRangeChoice(value[0])
        setDateRange(null)
        let tmp
        let {since, until} = formatTimeSelect(value[0])
        tmp = {page: 1, since: since, until: until}
        setQuery({...query, ...tmp})
    }

    const appliedFilters = []

    const isEmpty = (value) => {
        if (Array.isArray(value)) {
            return value.length === 0
        } else {
            return value === '' || value == null
        }
    }


    const handleRowNumberChange = (value) => {
        setQuery({
            ...query,
            ...{
                page: 1,
                rowNumber: value[0],
            }
        })
    }

    const handleStatusFilterChange = (value) => {
        setQuery({
            ...query,
            ...{
                page: 1,
                status: value[0],
            }
        })
    }


    const handleReadFilterChange = (value) => {
        setQuery({
            ...query,
            ...{
                page: 1,
                read: value[0],
            }
        })
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
            key: 'statusFilter',
            label: 'Status',
            filter: (
                <ChoiceList
                    title="Status"
                    titleHidden
                    choices={[
                        {label: 'All', value: '0'},
                        {label: 'Unresolved', value: '2,3'},
                        {label: 'Resolved', value: '4,5'},
                    ]}
                    selected={query.status || defaultStatus}
                    onChange={handleStatusFilterChange}
                    // allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: 'readFilter',
            label: 'Read',
            filter: (
                <ChoiceList
                    title="Read"
                    titleHidden
                    choices={[
                        {label: 'All', value: '0'},
                        {label: 'Unread', value: 'false'},
                        {label: 'Read', value: 'true'},
                    ]}
                    selected={query.read || defaultRead}
                    onChange={handleReadFilterChange}
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
                    selected={query.rowNumber || defaultRowNumber}
                    onChange={handleRowNumberChange}
                    // allowMultiple
                />
            ),
            shortcut: true,
        }
    ]


    const handleStatusFilterRemove = () => {
        setQuery({
            ...query,
            ...{
                page: 1,
                status: defaultStatus,
            }
        })
    }

    const handleReadFilterRemove = () => {
        setQuery({
            ...query,
            ...{
                page: 1,
                read: defaultRead,
            }
        })
    }

    const handleDateRangeRemove = () => {
        setDateRange(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        setDateRangeChoice(null)
        setQuery({
            ...query,
            ...{
                page: 1,
                since: null,
                until: null
            }
        })
    }

    const mappingRead = {
        "true": "Read",
        "false": "Unread"
    }


    const disambiguateLabel = (key, value) => {
        switch (key) {
            case 'readFilter':
                return `Status: ` + mappingRead[value]
            case 'statusFilter':
                return `Status: ` + mappingStatus[value]
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


    if (!isEmpty(query.status)) {
        const key = 'statusFilter'
        if (query.status !== defaultStatus) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, query.status),
                onRemove: handleStatusFilterRemove,
            })
        }
    }

    if (!isEmpty(query.read)) {
        const key = 'readFilter'
        if (query.read !== defaultRead) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, query.read),
                onRemove: handleReadFilterRemove,
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


    const handleFiltersQueryChange = (value) => {
        setQuery({
            ...query,
            ...{
                page: 1,
                q: value,
            }
        })

    }


    const handleQueryValueRemove = () => {
        setQuery({
            ...query,
            ...{
                page: 1,
                q: null,
            }
        })
    }

    const handleFiltersClearAll = () => {
        setDateRange(null)
        setDateRangeChoice(null)
        setQuery({
            page: 1,
            rowNumber: defaultRowNumber,
            status: defaultStatus,
            read: defaultRead,
            q: null,
            since: null,
            until: null
        })
    }

    const tableContent = () => {
        if (tickets.length > 0) {
            return (
                <Table
                    dataSource={tickets}
                    columns={columns}
                    showHeader={config.showHeader}
                    loading={isLoading}
                    pagination={false}
                    {...(config === TicketTableConfig.page ? {...scrollTable} : {})}
                    rowClassName={record => {
                        let className = []
                        className.push("ticket-row")
                        if (record.read === false) {
                            className.push("unread-ticket")
                        }
                        if (RESOLVED_STATUS.includes(record.status)) {
                            // className += "resolved-ticket"
                            className.push("resolved-ticket")
                        }
                        return className
                    }}
                    onRow={
                        (record, index) => {
                            return {
                                onClick: event => {
                                    rowClick(record)
                                }, // click row
                                onDoubleClick: event => {
                                }, // double click row
                                onContextMenu: event => {
                                }, // right button click row
                                onMouseEnter: event => {
                                    if (action) {
                                        event.target.style.cursor = "pointer"
                                    }
                                }, // mouse enter row
                                onMouseLeave: event => {
                                }, // mouse leave row
                            }
                        }
                    }
                />
            )
        } else {
            if (isLoading) {
                return (
                    <Table
                        loading={isLoading}
                        columns={columns}
                    />
                )
            } else {
                if (query.status === defaultStatus && query.since == null && query.until == null && query.q == null && query.read === defaultRead) {
                    return (
                        <Empty
                            style={{padding: '2rem'}}
                            description={`${config === TicketTableConfig.modal ? "This order doesn't" : "You don't"} have any ticket`}
                            imageStyle={{height: 80}}
                            image={createTicketImage}
                        >
                            <Button primary onClick={openCreateModal ? openCreateModal : () => {
                            }}>Create now</Button>
                        </Empty>
                    )
                } else {
                    return (<Table
                        dataSource={[]}
                        columns={columns}
                    />)
                }
            }
        }
    }


    return (
        <Card className={"shopifilize-card"}>
            <Card.Section>
                <div>
                    <Stack>
                        <Stack.Item fill>
                            <Filters
                                queryPlaceholder={'Ticket Subject, Description'}
                                queryValue={query.q}
                                filters={filters}
                                appliedFilters={appliedFilters}
                                onQueryChange={handleFiltersQueryChange}
                                onQueryClear={handleQueryValueRemove}
                                onClearAll={handleFiltersClearAll}
                            />
                        </Stack.Item>
                        <Stack.Item>
                            <TableStatus
                                loading={tickets.length > 0 ? false : isLoading}
                                amount={totalTickets}
                                objectName={"ticket(s)"}
                                verboseObjectName={"tickets"}/>
                        </Stack.Item>
                    </Stack>
                </div>
            </Card.Section>
            <div className="shopifilize-table ">
                {tableContent()}
            </div>
        </Card>
    )
}

export default TicketsTable
