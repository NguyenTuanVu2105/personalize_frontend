import React, {useContext, useEffect, useState} from 'react'
import { Modal } from '@shopify/polaris'
import TicketDetailContainerModal from "./TicketDetailContainerModal"
import TicketsContainerModal from "./TicketsContainerModal"
import {Button, Pagination} from "antd"
import ModalContext from "../../context/ModalContext"
import {listSupportTicketByOrderId} from "../../../../services/api/tickets"
// import TicketsTable from "../../../tickets/components/TicketsTable"


const defaultRowNumber = "10"
const defaultStatus = "0"
const defaultRead = "0"
const ViewTicketsModal = () => {
    const [showDetail, setShowDetail] = useState(false)
    const [ticketId, setTicketId] = useState(null)
    const [title, setTitle] = useState("View Sent Support Ticket")
    const [totalTickets,setTotalTickets] =useState(0)
    const {visibleViewModal, setVisibleViewModal, orderId} = useContext(ModalContext)

    const [query, setQuery] = useState({
        page: 1,
        rowNumber: defaultRowNumber,
        status: defaultStatus,
        read: defaultRead,
        q: null,
        since: null,
        until: null
    })

    const [listTicketsId, setListTicketsId] = useState([])

    const [neighborTicket, setNeighborTicket] = useState({
        next: null,
        back: null
    })

    const [loadPage, setLoadPage] = useState(false)


    useEffect(() => {
        if (visibleViewModal){
            setShowDetail(false)
            setTicketId(null)
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleViewModal])



    const _onPageChange = (page) => {
        setQuery({
            ...query,
            ...{
                page: page
            }
        })
    }

    const footer = () => {
        if (showDetail === false){
            return (
                <Pagination
                    onChange={_onPageChange}
                    current={query.page}
                    total={totalTickets}
                    pageSize={parseInt(query.rowNumber)}
                    // showQuickJumper={true}
                />
            )
        }else {
            return (
                <div style={{
                    width: "100%",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    float:"left"
                }}
                >
                    <div style={{width: "20%",display: 'flex'}}>
                        <Button icon={"arrow-left"} block={true}  style={{marginRight: "10px"}}
                                onClick={()=>{
                                    goPreviousTicket()
                                }}
                                disabled={neighborTicket.back ? false : true}
                        />
                        <Button icon={"arrow-right"} block={true} style={{marginLeft: "10px"}}
                                onClick={()=>{
                                    goForwardTicket()
                                }}
                                disabled={neighborTicket.next ? false : true}
                        />
                        <Button style={{position:"absolute", right: "1.6rem"}} onClick={closeModal}>Close</Button>
                    </div>
                </div>
            )
        }
    }



    const _back = () => {
        setShowDetail(false)
        setTicketId(null)
    }


    const showTicket = (id) => {
        setTicketId(id)
        setShowDetail(true)
    }

    const closeModal = () => {
        setVisibleViewModal(false)
    }

    const goPreviousTicket = () => {
        let idx = listTicketsId.indexOf(ticketId)
        if (idx === 0) {
            if (query.page !== 1) {
                setQuery({
                    ...query,
                    ...{
                        page: query.page - 1,
                    }
                })
            }
        }
        setTicketId(neighborTicket.back)
    }


    const goForwardTicket = () => {
        let idx = listTicketsId.indexOf(ticketId)
        if (idx === listTicketsId.length - 1) {
            if (query.page * query.rowNumber < totalTickets) {
                setQuery({
                    ...query,
                    ...{
                        page: query.page + 1,
                    }
                })
            }
        }
        setTicketId(neighborTicket.next)
    }





    useEffect(()=>{
        if (ticketId) {
            getNeighborTicket()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[ticketId, loadPage])

    useEffect(()=>{
        if (orderId){
            fetchListTicketsId()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[query])


    const getNeighborTicket = async () =>{
        let tmpBack = null
        let tmpNext = null
        let idx = listTicketsId.indexOf(ticketId)
        if (idx !== -1) {
            if (idx === 0) {
                if (query.page === 1) {
                    tmpBack = null
                } else {
                    const tmp = await listTemplateTicketsId(-1)
                    tmpBack = tmp[query.rowNumber - 1]
                }
            } else {
                tmpBack = listTicketsId[idx - 1]
            }

            if (idx === listTicketsId.length - 1) {
                if (query.page * query.rowNumber >= totalTickets) {
                    tmpNext = null
                } else {
                    const tmp = await listTemplateTicketsId(1)
                    tmpNext = tmp[0]
                }
            } else {
                tmpNext = listTicketsId[idx + 1]
            }
        }

        setNeighborTicket({
            next: tmpNext,
            back: tmpBack
        })
    }

    const fetchListTicketsId = async () => {
        setLoadPage(true)
        const response = await listSupportTicketByOrderId(orderId,query.page,query.rowNumber,query.status === defaultStatus ? null : query.status, query.q)
        const {success, message, data: ticketData } = response
        if (! success) {
            return console.log(message)
        }
        const {results: ticketResult} = ticketData
        let tmpTicketsId = []
        ticketResult.forEach(ticket => {
            tmpTicketsId.push(ticket.id)
        })
        setListTicketsId(tmpTicketsId)
        setLoadPage(false)
    }

    const listTemplateTicketsId = async (change) => {
        const response = await listSupportTicketByOrderId(orderId,query.page + change, query.rowNumber,query.status === defaultStatus ? null : query.status, query.q)
        const {success, message, data: ticketData } = response
        if (! success) {
            return console.log(message)
        }
        const {results: ticketResult} = ticketData
        let tmpTicketsId = []
        ticketResult.forEach(ticket => {
            tmpTicketsId.push(ticket.id)
        })
        return tmpTicketsId
    }



    const secondaryButtons = () => {
        if (showDetail){
            return
            // [
            //     {
            //         content: "Back",
            //         onAction: _back
            //     },
            //     {
            //         content: "Close",
            //         onAction: closeModal
            //     }
            // ]
        } else {
            return [
                {
                    content: "Close",
                    onAction: closeModal
                }
            ]
        }
    }


    const primaryButton = () => {
        return
        //
    }



    const content = () => {
        if (showDetail === true){
            return <TicketDetailContainerModal setTitle={setTitle} ticket_id = {ticketId} _back={_back}/>
        }else {
            return <TicketsContainerModal
                order_id = {orderId}
                totalTickets = {totalTickets}
                setTotalTickets = {setTotalTickets}
                query = {query}
                setQuery = {setQuery}
                action = {showTicket}
                setTitle= {setTitle}
            />
        }
    }

    return (
        <Modal
            title= { title }
            large
            open={visibleViewModal}
            onClose={closeModal}
            primaryAction = {primaryButton()}
            secondaryActions = {secondaryButtons()}
            footer = {footer()}
        >
            { content() }
        </Modal>
    )
}

export default ViewTicketsModal
