import React, {useEffect, useState} from "react"
import {Card, Typography} from "antd"
import {formattedTime} from '../../../../shared/formatTime'
import {getLocalStorage} from "../../../../services/storage/localStorage"
import {COOKIE_KEY} from "../../../../services/storage/sessionStorage"
import TicketAttachment from "./TicketAttachment"
import moment from 'moment-timezone'
import SanitizeHTML from "../../../shared/SanitizeHTML"


const { Text } = Typography

const TicketConversation = ({conversation, scrollInto, newConversation}) => {

    const [classConversation, setClassConversation] = useState("");

    useEffect(()=>{
        initConfig()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[conversation])


    const getName = () => {
        if (conversation.customer_send === true) {
            return getLocalStorage(COOKIE_KEY.NAME)
        } else {
            return "Printholo Support"
        }
    }

    const attachments = () =>{
        if (conversation){
            if (conversation.meta.attachments.length > 0) {
                const files = conversation.meta.attachments
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



    const initConfig = () => {
        if (conversation.customer_send === true) {
            setClassConversation("ticket-detail-requester")
        } else {
            setClassConversation("ticket-detail-agent")
        }
    }
    return (
        <div className={(newConversation === true ? "fade-in" : "none") + ` conversation-${conversation.id}`}>
            <Card id={scrollInto === true ? "scrollInto" : ""}
                  title={
                      (
                          <div style={{display: "inline-flex"}}>
                              {/*<div className="avatar_ticket">*/}
                              {/*    <Avatar customer size="medium"*/}
                              {/*            name={conversation ? conversation.email : "Loading..."}/>*/}
                              {/*</div>*/}
                              <div>
                                  <div>
                                      <Text type="secondary"
                                            style={{color: "blue"}}> {conversation ? getName() : "Loading..."}
                                      </Text>
                                  </div>
                                  <div className="created-time">
                                      {conversation ? moment(conversation.meta.created_at).fromNow() + " (" + formattedTime(conversation.meta.created_at) + ")" : "Loading.."}
                                  </div>

                              </div>
                          </div>
                      )
                  }
                  className={classConversation}
                  style={{borderRadius : "10px", marginBottom: "3rem"}}
                  bordered ={false}
                  headStyle={{borderBottom: "none"}}
            >
                <SanitizeHTML className="ticket-description-text" html={conversation ? conversation.meta.body : "Loading..."}/>
                {attachments()}
            </Card>
        </div>
    )
}

export default TicketConversation
