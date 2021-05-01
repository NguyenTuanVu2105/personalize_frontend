import React from 'react'
import "./NumberFormButton.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faMinus, faPlus, faRedo, faUndo} from "@fortawesome/free-solid-svg-icons"
import {Tooltip} from "antd"

const NumberFormButton = function ({value = 0, onChangeInput, onClickMinus, onClickPlus, tooltip, defaultIcon = true, id}) {
    // const color = isActive ? "#5C6AC4" : "#a0a2a5"
    // const containerClassName = `vertical-icon-button justify-content-center text-center ${isDisable ? "disable-icon-button" : "non-disable-icon-button"}`
    const renderContent = () => {
        return (
            <div className="row number-form-button mx-0" style={{marginBottom: 10, height: 30}}>
                <div className="col-3 px-0 text-center flex-center">
                    <button id={id ? `btn-${id}-decrease` : ""} className="btn minnus-btn px-0" onClick={onClickMinus}>
                        <FontAwesomeIcon style={{fontSize: '1.6rem'}} icon={!defaultIcon ? faUndo : faMinus}/>
                    </button>
                </div>
                <div className="col-6 px-1 flex-center">
                    <input maxLength={5} id={id ? `input-${id}` : ""} className="form-control" type="text" value={value} onChange={onChangeInput? onChangeInput: () =>{}}/>
                </div>
                <div className="col-3 px-0 text-center flex-center">
                    <button id={id ? `btn-${id}-increase` : ""} className="btn plus-btn px-0" onClick={onClickPlus}>
                        <FontAwesomeIcon style={{fontSize: '1.6rem'}} icon={!defaultIcon ? faRedo : faPlus}/>
                    </button>
                </div>
            </div>
        )
    }

    return tooltip ? (
        <Tooltip title={tooltip} placement={"bottom"}>
            {renderContent()}
        </Tooltip>
    ) : (
        <div>{renderContent()}</div>
    )
}

export default NumberFormButton