import React, {useEffect, useState} from "react"
import _ from "lodash"
import {convertDatetime} from "../../../../services/util/datetime"
import {Divider, Empty, Timeline, Typography} from "antd"
import "./TrackingTimeLine.scss"

const TrackingTimeLine = ({histories}) => {
    const [dayBasedHistory, setDayHistory] = useState({})

    useEffect(() => {
        const tmp = [...histories]
        const groups = splitHistoryIntoDays(tmp.reverse())
        const result = {}
        for (const [key, value] of Object.entries(groups)){
            result[key] = _.orderBy(value, ["date"], ["desc"])
        }
        setDayHistory(result)

    }, [histories])

    const splitHistoryIntoDays = (history) => {
        return _.groupBy(history, (item) => (
            convertDatetime(item.date).format("MMMM D")
        ))
    }

    const renderHistoryItem = () => {
        if (!histories.length) {
            return <Empty/>
        }

        return Object.keys(dayBasedHistory).map((day, index) => (
            <Timeline className={`day-history time-line-tracking ${index !== 0 ? "not-first-day" : ""}`} key={index}>
                <Timeline.Item color="green" className="timeline-date">
                    <Typography.Text className="text-uppercase pb-1" style={{fontSize: "13px"}}
                                     strong>{day}</Typography.Text>
                </Timeline.Item>
                {
                    dayBasedHistory[day].map((item, index) => (
                        <Timeline.Item key={index} style={{top: "0px !important"}}>
                            <span className="mr-2">
                                {convertDatetime(item.date).format("HH.mm")}:
                            </span>
                            <span>
                                {item.message}
                            </span>
                        </Timeline.Item>
                    ))
                }
                {(index !== Object.keys(dayBasedHistory).length - 1) ? <Divider
                    style={{minWidth: "unset", width: "calc(100% - 4px)", left: 4, margin: " 10px 0"}}/> : null}
            </Timeline>
        ))
    }
    return (
        <div>
            <div className="timeline-detail m-l-25">
                {renderHistoryItem()}
            </div>
        </div>
    )
}

export default TrackingTimeLine