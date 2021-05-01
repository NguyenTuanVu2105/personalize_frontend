import React from "react"
import "./Tickets.scss"
import moment from 'moment-timezone'
import {Link} from "react-router-dom"
import Paths from "../../../routes/Paths"
import {Typography} from 'antd'
import {TicketStatus} from "../constant/TicketStatus"

const {Text} = Typography

const TicketCell = ({ticket, link = false}) =>{
    const attrLink = () => {
        if (link === true){
            return {
                to: Paths.TicketDetail(ticket.id)
            }
        }else {
            return {
                to: "#"
            }
        }
    }
    const mapResponseStatus = (ticket) => {
        const create_time = moment(ticket.create_time).fromNow()
        const update_time = moment(ticket.update_time).fromNow()
        if (!ticket) return
        if (ticket.customer_last_reply) {
            return  `Replied ${update_time}`
        } else if (ticket.customer_last_reply === false) {
            return `Agent responsed ${update_time}`
        } else {
            if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
                return `Resolved ${update_time}`
            } else {
                return `Created ${create_time}`
            }
        }
    }

    return (
        <div className={'ticket_cell'} title={ticket.subject}>
            <div className="tickets_list_content">
                <div className="ticket_list_content">
                    <p align="left" style={{marginBottom: 0}}>
                        <Text className={"w-100"}  ellipsis={true}>
                            <Link {...attrLink()} >
                                {ticket.subject}
                            </Link>
                        </Text>
                    </p>

                    <p align="left">
                        <span>
                            {mapResponseStatus(ticket)}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default TicketCell
