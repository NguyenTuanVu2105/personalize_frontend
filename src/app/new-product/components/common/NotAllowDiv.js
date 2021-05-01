import React from "react"
import {Tooltip} from "antd"

const NotAllowDiv = ({isDisable, message, placement = "right"}) => {
    return (
        <Tooltip title={message} placement={placement}>
            <div
                style={{
                    position: "absolute",
                    backgroundColor: "transparent",
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                    zIndex: 11,
                    cursor: "not-allowed",
                    display: isDisable ? "unset" : "none"
                }}
            />
        </Tooltip>
    )
}

export default NotAllowDiv
