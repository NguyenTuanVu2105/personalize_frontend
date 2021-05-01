import Paths from "../../../routes/Paths"
import React from "react"
import TicketCell from "../components/TicketCell"
import TicketStatus from "../components/ticket-detail/TicketStatus"
import {formatDatetime} from "../../../services/util/datetime"
import {Link} from "react-router-dom"


export const ColumnIdentify = {
    id : {
        title: "ID",
        dataIndex: 'id',
        key: 'id',
        render: (id) => {
            return <Link to={Paths.TicketDetail(id)} >#{id}</Link>
        },
        align: 'center'
    },
    subjectModal : {
        title: "Subject",
        dataIndex: 'Subject',
        key: 'Subject',
        render: (content, record) => {
            return <TicketCell ticket={record} link={false}/>
        },
        ellipsis: true,
        align: 'center',
    },
    subjectPage : {
        title: "Subject",
        dataIndex: 'Subject',
        key: 'Subject',
        render: (content, record) => {
            return <TicketCell ticket={record} link={true}/>
        },
        ellipsis: true,
        align: 'center',
        width: '50%'
    },
    status : {
        title: "Status",
        dataIndex: 'status',
        key: 'status',
        width: 150,
        render: (status) => {
            return <TicketStatus status={status}/>
        },
        align: 'center'
    },
    createTime : {
        title: "Create time",
        dataIndex: 'create_time',
        key: 'create_time',
        render: (datetime) => {
            return formatDatetime(datetime)
        },
        align: 'center'
    },
    updateTime : {
        title: "Update time",
        dataIndex: 'update_time',
        key: 'update_time',
        render: (datetime) => {
            return formatDatetime(datetime)
        },
        align: 'center'
    }
}