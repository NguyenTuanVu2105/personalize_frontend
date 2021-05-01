import React, {useContext, useEffect, useState} from 'react'
import {Badge, Form, notification, Select, Table} from 'antd'
import {getHistoryTransactions} from '../../../../services/api/getHistoryTransactions'
import {formatDatetime} from '../../../../services/util/datetime'
import Path from '../../../../routes/Paths'
import {Link} from 'react-router-dom'
import PaymentMethodIcon from '../../../billings/components/PaymentMethodIcon'
import UserPageContext from "../../../userpage/context/UserPageContext"
import {Button, ButtonGroup} from "@shopify/polaris"
import {numberFormatCurrency} from "../../../shared/FormatNumber"

const STATUSES_LOWER = ['failed', 'success', 'failed', 'pending']
const TYPES_LOWER = ['refund', 'charge']

const FormItem = Form.Item
const Option = Select.Option
const defaultRowNumber = 10
const rowOption = [
    5,
    10,
    20,
    50
]

const types = [
    {
        value: "-1",
        title: "All"
    },
    {
        value: "0",
        title: "Refund"
    },
    {
        value: "1",
        title: "Charge"
    }
]


const TransactionHistoryTable = () => {
    const [_logs, _setLogs] = useState([])
    const [_rowNumber, _setRowNumber] = useState(defaultRowNumber)
    const [_totalLogs, _setTotalLogs] = useState(20)
    const [_page, _setPage] = useState(1)
    const [_type, _setType] = useState('-1')
    const {scrollTable} = useContext(UserPageContext)

    useEffect(() => {
        getLogs(1, _rowNumber)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        // let tableRefresh = setInterval(getLogs, 10000)
        //
        // return () => {
        //     clearInterval(tableRefresh)
        // }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_page, _rowNumber, _type])

    const getLogs = async (page, rowNumber, type = null) => {
        const {success, data} = await getHistoryTransactions(page || _page, rowNumber || _rowNumber, type || _type)
        if (success) {
            const rawLogs = data.results
            const logs = rawLogs.map((item, index) => {
                return {
                    key: index,
                    object: item.object || null,
                    amount: numberFormatCurrency(item.amount),
                    status: STATUSES_LOWER[item.status] || null,
                    method: item.payment_method,
                    type: TYPES_LOWER[item.type] || null,
                    time: item.create_time || null,
                }
            })
            _setLogs(logs)
            _setTotalLogs(rawLogs.length)
            _setTotalLogs(data.count)
            // getInvoices(logs);
        } else {
            notification.error({
                message: 'An error occurs. Please try again'
            })
        }
    }

    const columns = [
        {
            title: 'Transaction ID',
            dataIndex: 'object',
            key: 'object',
            render: (obj) => (
                <Link
                    className="text-primary"
                    to={Path.InvoiceDetail(obj.invoice ? obj.invoice.id : obj.id)}
                >
                    {obj.invoice ? `Refund for Invoice #${obj.invoice.id}` : `Invoice #${obj.id}`}
                </Link>
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            className: "text-capitalize"
        },
        {
            title: 'Status',
            dataIndex: 'status',
            align: 'center',
            key: 'status',
            render: (e) => renderStatus(e)
        },
        {
            title: 'Paid At',
            dataIndex: 'time',
            key: 'time',
            render: (e) => formatDatetime(e)
        },
        {
            title: 'Method',
            dataIndex: 'method',
            key: 'method',
            // width: "33%",
            render: (item) => {
                if (!item) {
                    return
                }
                let payment_method_type = item.type
                let message = item.last4
                    ? `**** **** **** ${item.last4}`
                    :
                    item.email || item.label
                return (
                    <div className={'d-flex justify-content-start align-items-center'} style={{height: '30px'}}>
                        <span style={{width: 'auto', height: '100%', display: 'flex', justifyContent: 'start'}}>
                            <PaymentMethodIcon brand={payment_method_type}/>
                        </span>
                        <span style={{fontWeight: 'bold'}}>{message}</span>
                    </div>
                )
            }
        },
        // {
        //     title: 'Receipt', dataIndex: 'receipt_url', key: 'receipt_url',
        //     render: (e) => (
        //         <a href={e} target={"_blank"}>Link</a>
        //     )
        // },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            // className: 'align-right'
        },
    ]

    const renderStatus = (status) => {
        let element = null
        if (status === 'success') {
            element = (<span>
                <Badge status="success"/>
                {status}
            </span>)
        } else if (status === 'pending' || status === 'transaction_pending') {
            element = (<span>
                <Badge status="warning"/>
                {status}
            </span>)
        } else {
            element = (<span>
                <Badge status="error"/>
                {status}
            </span>)
        }
        return (<div className={"text-capitalize"}>
            {element}
        </div>)
    }

    const _onPageChange = (page) => {
        _setLogs([])
        _setPage(page)
        getLogs(page, _rowNumber, _type)
    }

    const onSelectOption = async (value) => {
        _setLogs([])
        _setPage(1)
        _setRowNumber(value)
        getLogs(1, value, _type)
    }
    const onSelectType = async (value) => {
        _setLogs([])
        _setPage(1)
        _setType(value)
        getLogs(1, _rowNumber, value)
    }

    const listSelectOptions = rowOption.map(o => (
        <Option key={o}>{o}</Option>
    ))

    return (
        <div className={'col-12 px-0'}>
            <div className={'row mx-0'}>
                <div className={'col-lg-6'}>
                    <div className="row flex-start">
                        <div className='pr-3'>Type:</div>
                        <ButtonGroup segmented>
                            {
                                types.map(type => (
                                    <Button
                                        pressed={_type === type.value}
                                        key={type.title}
                                        onClick={() => {
                                            onSelectType(type.value)
                                        }}
                                        size={"slim"}
                                    >
                                        {type.title}
                                    </Button>
                                ))
                            }
                        </ButtonGroup>
                    </div>
                </div>
                <div className={'col-lg-6'}>
                    <div className="row float-lg-right">
                        <div className='pt-3 pr-3'>Show</div>
                        <FormItem className={"mb-3"}>
                            <Select
                                value={`${_rowNumber}`}
                                style={{width: 120}}
                                onChange={onSelectOption}
                                size="small">
                                {listSelectOptions}
                            </Select>
                        </FormItem>
                        <div className='pt-3 pl-3'>rows per page</div>
                    </div>
                </div>

            </div>
            <div className={'row mx-0'}>
                <Table
                    className="components-table-demo-nested w-100"
                    columns={columns}
                    // expandedRowRender={expandedRowRender}
                    dataSource={_logs}
                    pagination={{
                        onChange: _onPageChange,
                        total: _totalLogs,
                        pageSize: parseInt(_rowNumber),
                        current: _page,
                        showSizeChanger: false
                    }}
                    {...scrollTable}
                />
            </div>
        </div>
    )
}

export default TransactionHistoryTable
