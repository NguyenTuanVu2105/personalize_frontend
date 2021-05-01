import React, {useContext, useEffect, useState} from "react"
import DocTitle from "../../shared/DocTitle"
import TicketsTable from "./TicketsTable"
import {Badge, DisplayText, Stack, TextContainer} from "@shopify/polaris"
import Paths from "../../../routes/Paths"
import UserPageContext from "../../userpage/context/UserPageContext"
import {Button, Pagination} from "antd"
import {TicketTableConfig} from "../constant/TicketTableConfig"
import CreateTicketModal from "./CreateTicketModal"
import ModalContext from "../../orders/context/ModalContext"
import {unreadCount} from "../../../services/api/tickets"
import AppContext from "../../../AppContext"
// import {listSupportTicketByOrderId} from "../../../services/api/tickets"

const defaultRowNumber = "10"
const defaultStatus = "0"
const defaultRead = "0"
const TicketsContainer = () =>{

    const [_isLoading, _setIsLoading] = useState(false)
    const {setNameMap, setViewWidth, setDefaultViewWidth} = useContext(UserPageContext)
    const {setLoading} = useContext(AppContext)
    const {setVisibleCreateModal, setVisibleViewModal, setSelectedOrders} = useContext(ModalContext)
    const [totalTickets, setTotalTickets] = useState(0)
    const [unreadTicket, setUnreadTicket] = useState(false)
    const [query, setQuery] = useState({
        page: 1,
        rowNumber: defaultRowNumber,
        status: defaultStatus,
        read: defaultRead,
        q: null,
        since: null,
        until: null
    })

    useEffect(() => {
        _setIsLoading(true)
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.Support]: 'Support'
        })
        setLoading(false)
        setViewWidth(100)
        setQuery({
            status: defaultStatus,
            rowNumber: defaultRowNumber,
            read: defaultRead,
            page: 1,
            q: null,
            since: null,
            until: null
        })
        setTotalTickets(0)
        _setIsLoading(false)
        return () => {
            setDefaultViewWidth()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const _setUnreadTicket = async () => {
        const {success, message, data} = await unreadCount()

        if (!success) {
            return console.log(message)
        }

        setUnreadTicket(data.count)
    }
    const _onPageChange = (page) => {
        setQuery({
            ...query,
            ...{
                page: page
            }
        })
    }

    const openCreateModal = () =>{
        setSelectedOrders([])
        setVisibleViewModal(false)
        setVisibleCreateModal(true)
    }

    const handleOnCreateTicketSuccess = () =>{
        setQuery({
            ...query,
            ...{
                page: 1,
                q: null
            }
        })
    }

    return (
        <div>
            <DocTitle title={_isLoading ? 'Loading...' : 'Support'}/>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <TextContainer spacing="tight">
                        <Stack alignment={'center'}>
                            <DisplayText element="h3" size="large">Tickets</DisplayText>
                            { unreadTicket ? <div><Badge status="critical"><strong>{unreadTicket}</strong> unread</Badge></div> : ""}
                        </Stack>

                    <p>All your tickets are listed below</p>
                </TextContainer>
                <div>
                    <div className="btn-heading">
                        <Button onClick={openCreateModal} type={"primary"}>New ticket</Button>
                    </div>
                </div>
            </div>
            <div className="ticketTable page-main-content">
                <TicketsTable
                    query = {query}
                    setQuery = {setQuery}
                    totalTickets={totalTickets}
                    setTotalTickets={setTotalTickets}
                    config={TicketTableConfig.page}
                    openCreateModal={openCreateModal}
                    fetchUnread={_setUnreadTicket}
                />
                <Pagination
                    onChange={_onPageChange}
                    current={query.page}
                    total={totalTickets}
                    pageSize={parseInt(query.rowNumber)}
                    // showQuickJumper={true}
                    style={{float: "right", marginTop:"3rem"}}
                />
                <CreateTicketModal handleSuccess = {handleOnCreateTicketSuccess}/>
            </div>
        </div>
    )
}

export default TicketsContainer