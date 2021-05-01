import React, {useContext} from 'react'
import {Badge, Button, Icon} from 'antd'
import {
    Tooltip
} from '@shopify/polaris'
import {getSupportTicketCountInfo} from '../utils/languages'
import ModalContext from "../../context/ModalContext"


// const DELAY_TIME_BETWEEN_TICKET_IN_MILLISECONDS = 3 * 60 * 1000

const OrderMailSupport = ({order_ids, order}) => {
    const {setVisibleViewModal, setOrderId, setSelectedOrders, setVisibleCreateModal} = useContext(ModalContext)


    // const userSettings = props.userSettings

    // const isAbleToSendTicket = (userSettings.last_create_support_ticket_time != null && (convertDatetime(new Date()) - convertDatetime(userSettings.last_create_support_ticket_time)) < DELAY_TIME_BETWEEN_TICKET_IN_MILLISECONDS)


    const showFormModal = () => {
        setVisibleViewModal(false)
        setVisibleCreateModal(true)
        setSelectedOrders(order_ids)
    }

    return (
        <div>
            <div className="flex-center">
                <div>
                    {order
                        ?
                        <Tooltip
                            content={getSupportTicketCountInfo(order.unresolved_support_ticket_count, order.support_ticket_count)}
                            preferredPosition="above"
                        >
                            <Button
                                className="ant-dropdown-link"
                                type="link"
                                style={{padding: 0}}
                                onClick={
                                    // showViewTicketModal
                                    () => {
                                        setOrderId(order.id)
                                        setVisibleViewModal(true)
                                    }
                                }
                            >
                                {
                                    order.unresolved_support_ticket_count > 0 ?
                                        <Badge count={order.unresolved_support_ticket_count}>
                                            <Icon type="mail" theme="twoTone" style={{
                                                fontSize: '20px'
                                            }}/>
                                        </Badge> :
                                        <Icon type="mail" theme="twoTone" twoToneColor="#52c41a"
                                              style={{fontSize: '20px'}}/>
                                }
                            </Button>
                        </Tooltip>
                        : (
                            <Icon type="mail" theme="twoTone" twoToneColor="#bbe5b3"
                                  style={{fontSize: '20px'}} onClick={showFormModal}
                            />
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default OrderMailSupport

