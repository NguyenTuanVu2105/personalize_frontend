import React, {useContext, useEffect} from "react"
import TicketsTable from "../../../tickets/components/TicketsTable"
import {TicketTableConfig} from "../../../tickets/constant/TicketTableConfig"
import {Button} from "antd"
import ModalContext from "../../context/ModalContext"


const TicketsContainerModal = (
    {
        order_id,
        query,
        setQuery,
        totalTickets,
        setTotalTickets,
        action,
        setTitle
    }) => {

    const {setSelectedOrders, setVisibleViewModal, setVisibleCreateModal} = useContext(ModalContext)


    const openCreateModal = () => {
        setSelectedOrders([order_id])
        setVisibleViewModal(false)
        setVisibleCreateModal(true)
    }

    useEffect(() => {
        setTitle(
            (
                <div style={{
                    alignItems: 'center',
                    display: "inline-flex"
                }}>
                    View Sent Ticket Support
                    <Button style={{marginLeft: '1rem'}} icon="plus-circle" size={"large"} type="link" onClick={openCreateModal}>
                        Create Ticket
                    </Button>
                </div>
            )
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])


    return (
        <div className={'ticket_modal'}>
            <TicketsTable
                order_id={order_id}
                query = {query}
                setQuery = {setQuery}
                totalTickets={totalTickets}
                setTotalTickets={setTotalTickets}
                config={TicketTableConfig.modal}
                action={action}
                openCreateModal={openCreateModal}
            />
        </div>

    )
}

export default TicketsContainerModal