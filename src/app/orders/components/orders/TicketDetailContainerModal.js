import React, { useEffect} from "react"
import TicketDetail from "./../../../tickets/components/ticket-detail/TicketDetail"
import {Button} from "antd"

const TicketDetailContainerModal = ({ticket_id, setTitle, _back}) =>{


    useEffect(() =>{
        setTitle(
            <div style={{
                    alignItems: 'center',
                        display: "inline-flex"
                }}>
                <Button icon="arrow-left" size={"large"} type="link" onClick={_back}/>
                View Ticket Detail
            </div>
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    return (
        <TicketDetail id={ticket_id} container />
    )
}

export default TicketDetailContainerModal