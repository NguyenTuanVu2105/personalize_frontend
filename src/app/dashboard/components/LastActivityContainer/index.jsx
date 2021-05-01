import React, {useEffect, useState} from "react"
import {Timeline} from 'antd'
import {Heading} from "@shopify/polaris"
import './styles.scss'
import TimelineItem from "./TimelineItem"
import {getMessages} from "../../../../services/api/message"
import {formatDatetime} from '../../../../services/util/datetime'
import SanitizeHTML from "../../../shared/SanitizeHTML"
import {WidthResponsiveBestSelling} from "../../../../shared/resizeScrollTable"
import {useHistory} from 'react-router-dom'

const colorMessages = {
    cancel_shipping_approved: '#33cc33',
    cancel_shipping_rejected: '#ff0000',
    registration_activation_email: '#99ccff',
    add_payment_prompt: '#ff9900',
    recharge_notification: '#ff8000',
    cancel_order_success: '#33cc33',
    cancel_order_success_shop_owner: '#33cc33',
    order_rejected: '#ff0000',
    order_rejected_shop_owner: '#ff0000',
    ticket_resolved: '#33cc33',
    order_shipping_address_update_rejected: '#ff0000',
}

const optionSanitizeHTML = {
    allowedTags: ['p', 'a', 'i', 'b', 'u'],
    allowedAttributes: {
        'a': ['href']
    }
}


function LastActivityContainer() {

    const [messages, setMessages] = useState([])
    const [marginClass, setMarginClass] = useState("m-r-30")
    const history = useHistory()

    useEffect(

        () => {
            if (window.innerWidth <= WidthResponsiveBestSelling){
                setMarginClass("")
            } else {
                setMarginClass("m-r-30")
            }
            getData()
            window.addEventListener("resize", () => {
                if (window.innerWidth <= WidthResponsiveBestSelling){
                    setMarginClass("")
                } else {
                    setMarginClass("m-r-30")
                }
            })
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []
    )

    const getData = async () => {
        let data = (await getMessages(1, 5)).data
        setMessages(data.results)
        // console.log(data)
    }

    const clickHandler = (e) => {
        // e.stopPropagation()
        const el = e.target.closest("span.link-ui");
        if (el && e.currentTarget.contains(el)) {
            const path = el.getAttribute("path")
            if (path) {
                history.push(path)
            }
        }
    }

    return (
        <div className={'timeline-container '+ marginClass}>
            <div className={"timeline-heading"}>
                <Heading>Last activities</Heading>
            </div>
            <div className={"timeline-detail m-t-20 m-l-10"}>
                <Timeline>
                    {messages.map((mess, index) => {
                        return <TimelineItem key={index} color={colorMessages[mess.type]} datetime={formatDatetime(mess.create_time)} title={mess.title}
                                             description={<SanitizeHTML html={mess.content} options={optionSanitizeHTML} onClick={clickHandler}/>}/>
                    })}
                    {/*<TimelineItem color={"gray"}/>*/}
                </Timeline>
            </div>
        </div>
    )
}

export default LastActivityContainer
