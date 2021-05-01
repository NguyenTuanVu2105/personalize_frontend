import React, {useEffect, useState} from 'react'
import {Divider, Empty, Timeline, Typography} from 'antd';
import _ from 'lodash'
import './OrderHistory.scss'
import OrderHistoryItem from './OrderHistoryItem';
import {DisplayText} from '@shopify/polaris'
import {convertDatetime} from "../../../../../services/util/datetime"

function OrderHistory({history}) {
    const [dayBasedHistory, setDayHistory] = useState({})

    useEffect(() => {
        setDayHistory(splitHistoryIntoDays(history));
    }, [history])

    const splitHistoryIntoDays = (history) => {
        return _.groupBy(history, (item) => (
            convertDatetime(item.create_time).format("MMMM D")
        ))
    }

    const renderHistoryItem = () => {
        if (!history.length) {
            return <Empty/>
        }

        return Object.keys(dayBasedHistory).map((day, index) => (
            <Timeline className={`day-history ${index !== 0 ? "not-first-day" : ""}`} key={index}>
                <Timeline.Item color="green" className="timeline-date">
                    <Typography.Text className="text-uppercase pb-1" style={{fontSize: "13px"}}
                                     strong>{day}</Typography.Text>
                </Timeline.Item>
                {
                    dayBasedHistory[day].map(item => (
                        <Timeline.Item key={item.id}>
                            <OrderHistoryItem key={item.id} item={item}/>
                        </Timeline.Item>
                    ))
                }
                {(index !== Object.keys(dayBasedHistory).length - 1) ? <Divider
                    style={{minWidth: "unset", width: "calc(100% - 4px)", left: 4, margin: " 10px 0"}}/> : null}
            </Timeline>
        ))
    }

    return history && (
        <div className="order-history-container mt-5">
            <DisplayText size="small"><b>Timeline</b></DisplayText>
            {/*<Heading>Timeline</Heading>*/}
            <Divider className={"mt-4"}/>
            {
                renderHistoryItem()
            }
            <Divider/>
        </div>
    )
}

export default OrderHistory
