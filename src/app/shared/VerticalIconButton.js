import React from 'react'
import "./VerticalIconButton.scss"
import {Tooltip} from "antd"
import {Button} from "@shopify/polaris"

const VerticalIconButton = function ({
                                         isActive = false,
                                         isDisable = false,
                                         text,
                                         onClick,
                                         tooltip,
                                         id
                                     }) {
    const color = isActive ? "#5C6AC4" : "#a0a2a5"
    const containerClassName = `vertical-icon-button justify-content-center text-center ${isDisable ? "disable-icon-button" : "non-disable-icon-button"}`
    const renderContent = () => {
        return (
            <div className={containerClassName}
                 style={{
                     width: "100%"
                 }}
                 onClick={isDisable ? null : onClick}
            >
                <Button size={"slim"}>
                    <span
                        id={id ? id : ""}
                        style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            lineHeight: 1.45,
                            color: color,
                        }}
                    >
                        {text.toUpperCase()}
                    </span>
                </Button>
            </div>
        )
    }

    return tooltip ? (
        <Tooltip title={tooltip} placement={"top"}>
            {renderContent()}
        </Tooltip>
    ) : (
        <div>{renderContent()}</div>
    )
}

export default VerticalIconButton