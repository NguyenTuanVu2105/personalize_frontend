import {Timeline} from "antd"
import React from "react"

function TimelineItem({color, datetime, title, description}) {
    return (
        <Timeline.Item color={color} className={"timeline-item"}>
            <p>{datetime}</p>
            <p>{title}</p>
            {description}
        </Timeline.Item>
    )
}

export default TimelineItem
