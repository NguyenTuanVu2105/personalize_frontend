import React from 'react'
import {Banner} from "@shopify/polaris"
import Countdown from "react-countdown"
import {convertToSeconds, parseDurationToSecond} from "../../../../services/util/datetime"

const OrderFulfillmentTypeInfo = ({order, refresh}) => {

    const renderCountdown = (time) => {
        return <Countdown date={Date.now() + time} renderer={renderer}/>
    }

    const renderer = ({days, hours, minutes, seconds, completed}) => {
        if (completed) {
            setTimeout(() => refresh(), 30000)
            return <span className={"text-primary"}>prepare to fulfill</span>
        } else {
            const dateUnit = days > 1 ? "days" : "day"
            const hourUnit = hours > 1 ? "hours" : "hour"
            const minuteDisplay = seconds >= 20 ? minutes + 1 : minutes
            const minuteUnit = minuteDisplay > 1 ? "minutes" : "minute"
            const timeInSecond = convertToSeconds(days, hours, minutes, seconds)

            return timeInSecond >= 86400 ? (
                <span
                    className={"text-primary"}>{days} {dateUnit} {hours} {hourUnit} {minuteDisplay} {minuteUnit} left</span>
            ) : timeInSecond >= 3600 ? (
                <span className={"text-primary"}>{hours} {hourUnit} {minuteDisplay} {minuteUnit} left</span>
            ) : timeInSecond >= 20 ? (
                <span className={"text-primary"}>{minuteDisplay} {minuteUnit} left</span>
            ) : (
                <span className={"text-primary"}>prepare to fulfill</span>
            )
        }
    }

    const renderTimeRemaining = () => {
        const delayTimeInMillisecond = parseDurationToSecond(order.edit_order_items_delay) * 1000
        const orderCreateTime = new Date(order.seller_edit_time).getTime()
        const currentTime = Date.now()
        const remainingTimeInMillisecond = orderCreateTime + delayTimeInMillisecond - currentTime

        if (remainingTimeInMillisecond < 0) {
            return (
                <span className={"text-primary"}>prepare to fulfill</span>
            )
        } else {
            return (
                <span>{renderCountdown(remainingTimeInMillisecond)}</span>
            )
        }
    }

    const orderTimeDelay = () => {
        const timeInSecond = parseDurationToSecond(order.edit_order_items_delay)
        return timeInSecond === 5 * 60 ? "5 minutes" : timeInSecond === 15 * 60 ? "15 minutes" : timeInSecond === 30 * 60 ? "30 minutes" : timeInSecond === 60 * 60 ? "1 hour" : timeInSecond === 2 * 60 * 60 ? "2 hours" : timeInSecond === 8 * 60 * 60 ? "8 hours" : timeInSecond === 12 * 60 * 60 ? "12 hours" : timeInSecond === 24 * 60 * 60 ? "24 hours" : timeInSecond === 48 * 60 * 60 ? "48 hours" : `${timeInSecond / 60} minutes`
    }

    return (
        <div className={"mb-4"}>
            <Banner status="info">
                {
                    order.request_order_processing_manually ? (
                        <strong>Request fulfillment manually</strong>
                    ) : (
                        <strong>Auto fulfillment {orderTimeDelay()} after creation: {renderTimeRemaining()}</strong>
                    )

                }
            </Banner>
        </div>
    )
}
export default OrderFulfillmentTypeInfo
