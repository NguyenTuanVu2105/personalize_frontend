import React from "react"
import {Card, Typography} from "antd"
import {formattedTime} from "../../../../shared/formatTime"
import {getLocalStorage} from "../../../../services/storage/localStorage"
import {COOKIE_KEY} from "../../../../services/storage/sessionStorage"
import TicketAttachment from "./TicketAttachment"
import moment from 'moment-timezone'
import SanitizeHTML from "../../../shared/SanitizeHTML"

const {Text} = Typography


const TicketDescription = ({detail}) => {

    const attachments = () =>{
        if (detail){
            if (detail.attachments.length > 0) {
                const files = detail.attachments
                return (
                    <div>
                        <hr/>
                        <div className={'row row-attachments mt-3'}>
                            {files.map((file, index) => (
                                <TicketAttachment file={file} key={index} />
                            ))}
                        </div>
                    </div>
                )
            } else {
                return ""
            }
        }
    }


    return (
        <Card title={(
                <div style={{display: "inline-flex"}}>
                    {/*<div className="avatar_ticket">*/}
                    {/*    <Avatar customer size="medium" name={detail ? detail.email : "Loading..."}/>*/}
                    {/*</div>*/}
                    <div>
                        <div>
                            <Text type="secondary" style={{color: "blue"}}>{getLocalStorage(COOKIE_KEY.NAME)}</Text>
                            <span className="text--dark text--default"> reported via the portal</span>
                        </div>
                        <div className="created-time">
                            {detail ? moment(detail.create_time).fromNow() + " (" + formattedTime(detail.create_time) + ")" : "Loading.."}
                        </div>

                    </div>
                </div>
            )}
            style={{borderRadius : "10px", marginBottom: "3rem"}}
              bordered ={false}
              headStyle={{borderBottom: "none"}}
              className= "ticket-detail-description"
        >
            <SanitizeHTML className="ticket-description-text" html={detail ? detail.description : "Loading..."}/>


            {attachments()}
        </Card>
    )
}

export default TicketDescription
