import React from "react"
import TicketStatus from "./TicketStatus"
import {getLocalStorage} from "../../../../services/storage/localStorage"
import {COOKIE_KEY} from "../../../../services/storage/sessionStorage"

const TicketDetailHeader = ({detail}) =>{


    const statusField = () => {
        if (detail) {
            return (
                <div style={{float: "right"}}>
                    <TicketStatus status={detail.status}/>
                </div>
            )
        } else{
            return
        }
    }

    // const open = () =>{
    //     if (detail){
    //         window.open(detail.url,'_blank')
    //     }
    // }

    return(
        detail
            ? (
                <div className="ticket-details-header">
                    <div className="ticket-header-container">
                        <div className="ticket-header">
                            <div className="element-flex">
                                <span className="ticket-subject-heading text--large text--bold">
                                    {detail ? detail.subject : "Loading..."}
                                </span>
                            </div>
                        </div>
                        <div className="ticket-created-info">
                            <span className="text--very-lightgrey">Created by</span>
                            <span className="text--dark text--semi-bold"> {getLocalStorage(COOKIE_KEY.NAME)}</span>
                            {/*<Button style={{marginLeft: '1rem'}} size={"large"} type="link" onClick={open}>*/}
                            {/*    View Detail In Freshdesk*/}
                            {/*</Button>*/}
                        </div>
                    </div>
                    {statusField()}
                </div>
            )
            : <div/>
    )
}

export default TicketDetailHeader