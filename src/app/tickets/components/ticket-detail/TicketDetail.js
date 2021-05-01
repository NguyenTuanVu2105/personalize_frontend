import React, {useContext, useEffect, useState} from "react"
import {ticketConversations} from "../../../../services/api/conversations"
import {sendReply} from "../../../../services/api/tickets"
import {Button, Card, Tooltip} from "antd"
import TicketDescription from "./TicketDescription"
import TicketConversation from "./TicketConversation"
import TicketDetailHeader from "./TicketDetailHeader"
import './TicketDetail.scss'
import Zenscroll from 'zenscroll'
import {Spin} from 'antd'
import {LoadingOutlined} from '@ant-design/icons'
import {ticketDetail} from "../../../../services/api/tickets"
import Editor from "../../../shared/Editor"
import TicketAttachment from "./TicketAttachment"
import {Stack} from "@shopify/polaris"
import {Button as PolarisButton} from "@shopify/polaris"
import {faPaperclip, faPaperPlane} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {getUnreadMessageCount} from "../../../../services/api/message"
import AppContext from "../../../../AppContext"
import _ from "lodash"

// const defaultNumberConversation = 10

const TicketDetail = ({container, id}) => {

    const [conversations, setConversations] = useState([])
    const [scrollInto, setScrollInto] = useState(0)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [isLoadMore, setIsLoadMore] = useState(true)
    const [detail, setDetail] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingReply, setIsLoadingReply] = useState(false)
    const [isLoadingSend, setIsLoadingSend] = useState(false)
    const [contentReply, setContentReply] = useState("")
    const [notification, setNotification] = useState("Send")
    const [typeError, setTypeError] = useState(0)
    const [availableSend, setAvailableSend] = useState(false)
    const [attachments, setAttachments] = useState([])
    const {setInstantPrompts} = useContext(AppContext)


    const fetchData = async () => {
        setIsLoading(true)
        setIsLoadMore(true)
        const response = await ticketDetail(id)

        const {success, message, data} = response

        if (!success) {
            return console.log(message)
        }

        fetchConversations(1)

        setDetail(data)
        setIsLoadingReply(true)

    }


    const fetchConversations = async (_page) => {
        if (_page === 1) {
            setIsLoading(true)
        }
        setIsLoadMore(true)
        const response = await ticketConversations(id, _page)
        setConversations([])
        const {success, message, data} = response
        if (!success) {
            return console.log(message)
        }

        const {count, results: conversationsResult} = data

        conversationsResult.forEach(conversation => {
            conversation.key = conversation.id
            conversation.new = true
        })


        conversationsResult.reverse()

        let tmpConversation = []
        if (_page !== 1) {
            tmpConversation = conversations
        }

        tmpConversation.forEach(conversation => {
            conversation.new = false
            conversationsResult.push(conversation)
        })


        let tmp = 0
        if (conversationsResult[0]) {
            tmp = conversationsResult[0].id
            if (tmpConversation[0]) {
                tmp = tmpConversation[0].id
            }
        }

        setPage(_page + 1)
        setTotal(count)
        setScrollInto(tmp)
        setConversations(conversationsResult)
        setIsLoadMore(false)
        if (_page === 1) {
            setIsLoading(false)
        }
    }

    const arrayUnique = (arr, uniqueKey) => {
        const flagList = new Set()
        //eslint-disable-next-line
        return arr.filter(function (item) {
            if (!flagList.has(item[uniqueKey])) {
                flagList.add(item[uniqueKey])
                return true
            }
        })
    }

    const handleAddFiles = (e) => {
        let attempt = [...attachments, ...e.target.files]
        attempt.forEach(file => {
            if (!file.id){
                file.id = file.lastModified + "_" + _.random(10000)
            }
        })
        const combinedFiles = arrayUnique(attempt, 'id')
        setAttachments(combinedFiles)
    }

    const loadMore = () => {
        fetchConversations(page)
    }

    useEffect(() => {
        if (!isLoading) {
            if (!isLoadMore) {
                scrollToConversation()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadMore])


    const scrollToConversation = () => {
        const element = document.getElementById("scrollInto")
        const defaultDuration = 500

        if (element) {
            if (container) {
                const container = document.querySelector(".Polaris-Modal__Body.Polaris-Scrollable.Polaris-Scrollable--vertical")
                const myScroller = Zenscroll.createScroller(container)
                myScroller.center(element, defaultDuration)
            } else {
                Zenscroll.center(element, defaultDuration)
            }
        }
    }

    const scrollToReply = (duration) => {
        const element = document.getElementById("reply")
        if (element) {
            if (container) {
                const container = document.querySelector(".Polaris-Modal__Body.Polaris-Scrollable.Polaris-Scrollable--vertical")
                const myScroller = Zenscroll.createScroller(container)
                myScroller.center(element, duration)
            } else {
                Zenscroll.center(element, duration)
            }
        }
    }

    const numberConversationUnloaded = () => {
        let tmp = total - conversations.length
        return tmp < 10 ? tmp : 10
    }

    const reloadUnreadCount = async () => {
        let data = (await getUnreadMessageCount()).data
        const {instant_prompts} = data
        setInstantPrompts(instant_prompts)
    }

    useEffect(() => {
        setConversations([])
        fetchData().then(x =>
            reloadUnreadCount()
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])


    const loadingAntIcon = <LoadingOutlined style={{fontSize: 24}} spin/>

    const buttonLoadMore = () => {
        if (numberConversationUnloaded() > 0) {
            if (isLoadMore === true) {
                return (
                    <Spin style={{marginBottom: "3rem"}} indicator={loadingAntIcon}/>
                )
            } else {
                return (
                    <Button type={"primary"} shape={"round"} size={"small"}
                            style={{marginBottom: "3rem"}}
                            onClick={loadMore}
                    >
                        Load more {numberConversationUnloaded()} conversations
                    </Button>
                )
            }
        } else {
            return ""
        }
    }

    const listConversations = () => {
        if (conversations.length > 0) {
            return (
                conversations.map((conversation, index) => {
                    return (
                        <TicketConversation newConversation={conversation.new}
                                            scrollInto={conversation.id === scrollInto}
                                            key={index} conversation={conversation}
                                            requestor={{email: detail.email, name: detail.name}}
                        />
                    )
                })
            )
        } else {
            return (
                <div id="scrollInto"/>
            )
        }
    }

    const changeEditor = (value) => {
        setContentReply(value)
    }

    const height = container ? 200 : 400


    const replySpace = () => {
        return (
            <div >
                {iconLoading()}
                <div id="reply">
                    <Editor
                        value={contentReply}
                        init={{
                            height: height,
                            menubar: false,
                            setup: function (ed) {
                                ed.on('init', function (ed) {
                                    this.getBody().style.fontSize = '14px'
                                    this.getBody().style.fontFamily = 'Helvetica Neue, Helvetica, Arial, sans-serif'
                                    this.getBody().style.lineHeight = '1.5'
                                    setIsLoadingReply(false)
                                })

                            },
                            verify_html: false,
                            entity_encoding: 'raw',
                            cleanup: false
                        }}
                        onEditorChange={changeEditor}
                    />
                    {footerReply()}
                </div>
            </div>
        )
    }

    const onRemoveFile = (file, index) => {
        const updatedFiles = attachments.filter((file, idx) => {
            return idx !== index
        })
        setAttachments(updatedFiles)
    }

    const onRemoveAllFiles = () => {
        setAttachments([])
    }

    const footerReply = () => {
        if (!isLoadingReply) {
            return (
                <div
                    style={{
                        border: '1px solid #ccc',
                        display: 'flow-root',
                        borderTop: 'none',

                        width: '100%',
                        padding: '1rem'
                    }}
                >
                    <div style={{paddingTop: "1rem 0rem", maxWidth: '75%', padding: '0px 20px', float: 'left',}}>
                        {
                            attachments.length > 0 && (
                                <div style={{display: "inline-flex", width: '100%', overflow: 'auto'}}>
                                    {attachments.map((file, index) => (
                                        <TicketAttachment file={file} key={index} _delete={onRemoveFile} index={index}/>
                                    ))}
                                </div>
                            )
                        }

                    </div>
                    <div
                        style={{paddingTop: "1rem 0rem", width: '25%', float: 'right',}}
                    >
                        <div style={{float: 'right'}}>
                            <Tooltip title={"Attach files"}>
                                <Button size={"small"} type={"ghost"}
                                        style={{width: '70px', marginRight: '15px'}}
                                        onClick={() => document.querySelector('#add-files').click()}
                                >
                                    <FontAwesomeIcon icon={faPaperclip} />
                                    <input id={'add-files'} type={'file'} multiple={true} hidden={true}
                                           onChange={handleAddFiles}/>
                                </Button>
                            </Tooltip>
                            <Tooltip placement={"top"}
                                     title={notification}>
                                <Button size={"small"} type={"primary"}
                                        onClick={reply}
                                        disabled={!availableSend || isLoadingSend}
                                        style={{width: '70px'}}
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </Button>
                            </Tooltip>
                        </div>

                        {
                            attachments.length > 0 && (
                                <div style={{float: 'left', marginTop: '1rem', width: '100%'}}>
                                    <Stack>
                                        <Stack.Item fill>{(attachments.length)} files selected</Stack.Item>
                                        <Stack.Item>
                                            <PolarisButton plain onClick={onRemoveAllFiles}>Remove
                                                all</PolarisButton>
                                        </Stack.Item>
                                    </Stack>
                                </div>

                            )
                        }
                    </div>
                </div>
            )
        } else {
            return
        }
    }

    useEffect(()=>{
        if (contentReply.trim().length > 0) {
            setNotification("Send")
            setTypeError(0)
            setAvailableSend(true)
        }else {
            setNotification("Please Enter Content")
            setTypeError(1)
            setAvailableSend(false)
        }
    }, [contentReply])

    const iconLoading = () => {
        if (isLoadingReply || isLoadingSend) {
            return (
                <div style={{
                    width: "100%",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '3rem'
                }}
                >
                    <Spin indicator={loadingAntIcon}/>
                </div>
            )
        } else {
            return
        }
    }

    const reply = async () => {
        setIsLoadingSend(true)
        setNotification("Sending...")
        scrollToReply(500)
        const content = contentReply
        const {success, data} = await sendReply(id, content, attachments)
        if (!success) {
            // console.log(success)
            serverError()
        } else {
            if (!data.success) {
                // console.log(data)
                serverError()
            } else {
                const conversation = data.data
                if (conversation) {
                    conversation.new = true
                    setConversations([...conversations, conversation])
                    setNotification("Send")
                    setContentReply("")
                    setAttachments([])
                    scrollToReply(1000)
                } else {
                    serverError()
                }
            }
        }
        setIsLoadingSend(false)
    }

    const serverError = () => {
        if (typeError !== 2) {
            setNotification("Server was error, please try again or later")
            setTypeError(2)
            setTimeout(() => {
                setNotification("Send")
                setTypeError(0)
            }, 2000)
        }
    }


    return (
        <div>
            <Card title={
                isLoading === true ? "" : <TicketDetailHeader detail={detail}/>
            }
                  style={{borderRadius: "10px"}}
                  headStyle={{borderBottom: "none"}}
                  bordered={false}
                  loading={isLoading}
            >

                <TicketDescription detail={detail}/>
                <div style={{
                    width: "100%",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                >
                    {buttonLoadMore()}
                </div>
                {listConversations()}
                {replySpace()}
            </Card>
        </div>

    )
}

export default TicketDetail
