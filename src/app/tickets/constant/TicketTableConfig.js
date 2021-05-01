import {ColumnIdentify} from './ColumnIdentify'

const {id, subjectPage, status, createTime, updateTime, subjectModal} = ColumnIdentify


export const TicketTableConfig = {
    modal : {
        showHeader:false,
        column: [subjectModal, status],
        link:false
    },
    page : {
        showHeader: true,
        column: [id, subjectPage, status, createTime, updateTime],
        link: true
    }
}

