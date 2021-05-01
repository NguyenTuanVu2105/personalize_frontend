import React from 'react'
import "./ShadowIconButton.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {Tooltip} from "antd"

export const BUTTON_CONFIGS = {
    "PRIMARY": {
        "name": "PRIMARY",
        "color": "#a0a2a5",
        "backgroundColor": "#fff"
    },
    "WARNING": {
        "name": "WARNING",
        "color": "#333",
        "backgroundColor": "#F49342"
    },
    "DANGER": {
        "name": "DANGER",
        "color": "#fff",
        "backgroundColor": "#BF0711"
    },
}

const ShadowIconButton = function ({status = BUTTON_CONFIGS.PRIMARY.name, isDisable = false, icon, onClick, size = 30, tooltip,placement, id}) {
    const color = BUTTON_CONFIGS[status].color
    const backgroundColor = BUTTON_CONFIGS[status].backgroundColor
    const containerClassName = `shadow-icon-button justify-content-center text-center ${isDisable ? "disable-icon-button" : "non-disable-icon-button"}`
    const renderContent = () => {
        return (
            <div
                id={id}
                className={containerClassName}
                style={{
                    minWidth: size,
                    height: size,
                    color: color,
                    backgroundColor: backgroundColor
                }}
                onClick={isDisable
                    ? () => {}
                    : onClick
                }
            >
                <div className={"center"}>
                    <div className={"text-center"}>
                        <FontAwesomeIcon style={{fontSize: '1.4rem'}} icon={icon}/>
                    </div>
                </div>
            </div>
        )
    }

    return tooltip && !isDisable ? (
        <Tooltip title={tooltip} placement={placement||"bottom"}>
            {renderContent()}
        </Tooltip>
    ) : (
        <div>{renderContent()}</div>
    )
}

export default ShadowIconButton