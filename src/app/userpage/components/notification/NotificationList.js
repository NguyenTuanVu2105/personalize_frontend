import {Avatar, Button, List, Spin} from 'antd'

import InfiniteScroll from 'react-infinite-scroller'
import React, {useContext, useEffect, useState} from 'react'
import {getMessages, readAllMessages, readMessage} from '../../../../services/api/message'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCircle, faPiggyBank, faSearchDollar, faTicketAlt, faTruck, faUserTie} from '@fortawesome/free-solid-svg-icons'
import SanitizeHTML from '../../../shared/SanitizeHTML'
import {faClipboard, faEnvelope} from '@fortawesome/free-regular-svg-icons'
import {formatDatetime} from '../../../../services/util/datetime'
import {LoadingOutlined} from "@ant-design/icons"
import UserPageContext from "../../context/UserPageContext"
import {useHistory} from 'react-router-dom'
import {Stack} from "@shopify/polaris"

const iconMessages = {
    cancel_shipping_approved: {
        icon: faTruck,
        color: '#33cc33'
    },
    cancel_shipping_rejected: {
        icon: faTruck,
        color: '#ff0000',
    },
    registration_activation_email: {
        icon: faEnvelope,
        color: '#99ccff',
    },
    add_payment_prompt: {
        icon: faSearchDollar,
        color: '#ff9900',
    },
    recharge_notification: {
        icon: faPiggyBank,
        color: '#ff8000',
    },
    cancel_order_success: {
        icon: faClipboard,
        color: '#33cc33',
    },
    cancel_order_success_shop_owner: {
        icon: faUserTie,
        color: '#33cc33',
    },
    order_rejected: {
        icon: faClipboard,
        color: '#ff0000',
    },
    order_rejected_shop_owner: {
        icon: faUserTie,
        color: '#ff0000',
    },
    ticket_resolved: {
        icon: faTicketAlt,
        color: '#33cc33',
    },
    user_product_delete: {
        icon: faClipboard,
        color: "#ff0000"
    },
    order_shipping_address_update_rejected: {
        icon: faTruck,
        color: '#ff0000',
    },
}

const optionSanitizeHTML = {
    allowedTags: ['p', 'a', 'i', 'b', 'u'],
    allowedAttributes: {
        'a': ['href']
    }
}

// const history = createBrowserHistory()

const NotificationList = (props) => {
    const {badge, setBadge, closeNotificationBox} = props
    const [loading, setLoading] = useState(false)
    const {notification, setNotification} = useContext(UserPageContext)
    const history = useHistory()

    const getData = async () => {
        setLoading(true)
        let data = (await getMessages(notification.page, 10)).data
        setNotification({
            data: notification.data.concat(data.results),
            hasMore: data.next != null,
            page: data.next != null ? (notification.page + 1) : notification.page
        })
        setLoading(false)
    }

    useEffect(
        () => {
            if (!notification.data.length > 0) {
                getData()
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []
    )

    const handleInfiniteOnLoad = () => {
        if (notification.hasMore) {
            getData()
        }
    }

    const onClickRead = (item) => {
        return () => {
            if (item.status === 'unread') {
                // console.log('read')
                readMessage(item.id)
                notification.data.find(i => i.id === item.id).status = 'read'
                setNotification({
                    data: notification.data
                })
                setBadge(badge - 1)
            }
        }
    }

    const onClickReadAll = () => {
        readAllMessages()
        notification.data.forEach(item => {
            item.status = 'read'
        })
        setNotification({data: notification.data})
        setBadge(0)
    }

    const headerList = (
        <div className={"notification-header"}>
            <Stack>
                <Stack.Item fill>
                    <h2 className='title-noti flex-horizontal'>Notifications</h2>
                </Stack.Item>
                <Stack.Item>
                    <Button type='link' onClick={onClickReadAll}>Mark all as read</Button>
                </Stack.Item>
            </Stack>
        </div>
    )

    const loadingAntIcon = <LoadingOutlined style={{fontSize: 24}} spin/>

    const clickHandler = (e) => {
        // e.stopPropagation()
        const el = e.target.closest("span.link-ui");
        if (el && e.currentTarget.contains(el)) {
            const path = el.getAttribute("path")
            if (path) {
                closeNotificationBox && closeNotificationBox()
                history.push(path)
            }
        }
    }

    return (
        // TODO remove this if no notification has anchor tag: includes("<a")
        <div className="message-container">
            <InfiniteScroll
                initialLoad={false}
                pageStart={0}
                loadMore={handleInfiniteOnLoad}
                hasMore={notification.hasMore}
                useWindow={false}
            >
                <List
                    header={headerList}
                    itemLayout="horizontal"
                    dataSource={notification.data}
                    renderItem={item => {
                        return item.content.includes("<a") ? <span/> : (
                            <List.Item className={`message-${item.status}`} onClick={onClickRead(item)}>
                                <List.Item.Meta
                                    avatar={<Avatar style={{background: iconMessages[`${item.type}`].color}}>
                                        <FontAwesomeIcon icon={iconMessages[`${item.type}`].icon}/>
                                    </Avatar>}
                                    title={
                                        <div>
                                            <strong>{item.title}</strong> &nbsp;
                                            {item.status === 'unread' &&
                                            <FontAwesomeIcon
                                                style={{
                                                    fontSize: '0.5rem',
                                                    color: 'red',
                                                    verticalAlign: 'middle',
                                                    lineHeight: 'normal'
                                                }}
                                                icon={faCircle}/>}
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <div>
                                                <SanitizeHTML html={item.content} options={optionSanitizeHTML}
                                                              onClick={clickHandler}/>
                                            </div>
                                            <div style={{fontWeight: 300, fontSize: '12px'}}>
                                                {formatDatetime(item.create_time)}
                                            </div>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )
                    }
                    }
                >
                    {
                        loading && (
                            <div style={{
                                width: "100%",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                marginTop: notification.data.length > 0 ? "1rem" : "3rem"
                            }}
                            >
                                <Spin indicator={loadingAntIcon}/>
                            </div>
                        )
                    }
                </List>
            </InfiniteScroll>
        </div>
    )
}

export default NotificationList
