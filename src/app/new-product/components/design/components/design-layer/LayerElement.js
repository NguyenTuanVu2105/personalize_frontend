import React, {useState} from "react"
import {Spin, Tooltip} from "antd"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faEye, faEyeSlash, faTrash, faClone} from "@fortawesome/free-solid-svg-icons"
import {ARTWORK_ERROR_CODES, LAYER_ERRORS, LAYER_TYPE} from "../../../../constants/constants"

import "./LayerElement.scss"
import {getArtworkDPI} from "../../../../helper/checkArtworkConstraints"
import {isInFrame} from "../../../../../../services/util/windowUtil"
import textIcon from "../../../../../../assets/images/textBlack.svg"

const LayerElement = ({
                          artwork,
                          onRemove,
                          onClick,
                          side,
                          artworkErrorCode,
                          dpi,
                          minDpi,
                          currentProductIndex,
                          setProduct,
                          product,
                          onClone
                      }) => {
    const [visibleChild, setVisibleChild] = useState(false)
    const [visibleParent, setVisibleParent] = useState(false)


    const tooltipParentProps = () => {
        return visibleChild ? {visible: false} : {visible: visibleParent}
    }

    const produceHoverMessage = (artwork) => {
        if (!artwork || !artwork.data) return 'Loading'
        if (artwork && artwork.data && artworkErrorCode) {
            if (artworkErrorCode === ARTWORK_ERROR_CODES.LOW_DPI) {
                return (
                    <div>
                        <div>Artwork <b>{artwork.name}</b> with <b>DPI {getArtworkDPI(artwork, side)}</b> is too low
                        </div>
                        <div>You can scale down artwork to increase DPI</div>
                        <br/>
                        <div>
                            <b>Minimum DPI:</b> {side.constraints.minimum_dpi}
                        </div>
                    </div>
                )
            } else return (
                <div>
                    {LAYER_ERRORS[artworkErrorCode](artwork, side)}
                </div>
            )
        }
        return 'Drag to reorder'
    }

    const toggleVisible = () => {
        artwork.visible = !artwork.visible
        product.userProducts[currentProductIndex].previewUpdated = false
        setProduct({userProducts: product.userProducts})
    }

    const dpiContent = () => {
        if (isInFrame()) {
            return (
                <div className="d-flex flex-column">
                    <b>
                        <span>DPI</span>
                    </b>
                    <div>
                        <span>{dpi}</span>
                        <span>/</span>
                        <span>{minDpi}</span>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="d-flex">
                    <b>
                        <span>{dpi >= minDpi ? "Good" : "Bad"}</span>
                        <span>:&nbsp;</span>
                    </b>
                    <div>
                        <span>{dpi}</span>
                        <span>/</span>
                        <span>{minDpi}</span>
                    </div>
                </div>
            )
        }
    }

    const renderAvatar = () => {
        switch (artwork.type) {
            case LAYER_TYPE.text:
                return (
                    <img
                        src={textIcon}
                        alt={'Layer item'}
                        style={{height: "100%", width: "100%", objectFit: "contain", padding: 5}}
                    />
                )
            default:
                if (artwork.data) {
                    return (
                        <img
                            src={artwork.data}
                            alt={'Layer item'}
                            style={{height: "100%", width: "100%", objectFit: "contain"}}
                        />
                    )
                } else {
                    return (
                        <div className="flex-center layer-item">
                            <Spin/>
                        </div>
                    )
                }
        }
    }

    const renderDPI = () => {
        if (!artwork || (artwork.type === LAYER_TYPE.text)) {
            return (<div/>)
        } else {
            return (
                (
                    <div
                        className="flex-center"
                        style={{
                            fontSize: "1em",
                            color: dpi >= minDpi ? "green" : "red",
                            flexWrap: "wrap"
                        }}
                    >
                        {
                            !!dpi
                                ? dpiContent()
                                : ("Loading...")

                        }
                    </div>
                )
            )
        }
    }

    return (
        <Tooltip title={produceHoverMessage(artwork)} {...tooltipParentProps()} placement={"left"}
                 onVisibleChange={(v) => setVisibleParent(v)}>
            <div
                className={`btn btn-light ${artworkErrorCode ? "error" : ""}`}
                style={{width: '100%', height: '100%', cursor: "pointer"}}
                onClick={onClick}
            >
                <div>
                    <div
                        className="d-flex flex-center-vertical"
                        style={{padding: '0.25em 0em', fontSize: '1.4rem'}}
                    >
                        <Tooltip
                            title={!!artwork.visible ? "Hide" : "Visible"}
                            placement={"left"}
                            mouseLeaveDelay={0}
                        >
                            <div
                                style={{width: 20, height: 20, marginRight: 5}}
                                onClick={(event) => {
                                    event.stopPropagation()
                                    onClick(false)
                                    toggleVisible()
                                }}
                                onMouseEnter={() => setVisibleChild(true)}
                                onMouseLeave={() => setVisibleChild(false)}
                            >
                                <FontAwesomeIcon icon={!!artwork.visible ? faEye : faEyeSlash}/>
                            </div>
                        </Tooltip>

                        <div
                            className="flex-center-vertical"
                            style={{
                                flex: "0 1 100%"
                            }}
                        >
                            <div
                                className="d-flex"
                                style={{
                                    minWidth: 40,
                                    minHeight: 40,
                                    height: 40,
                                    width: 40,
                                    border: '1px solid #69abdc',
                                    borderRadius: "6px"
                                }}
                            >
                                {renderAvatar()}
                            </div>
                            <div style={{flex: "1 1 100%"}}>
                                {renderDPI()}
                            </div>
                            <div className="flex-column d-flex">
                                <Tooltip title={"Duplicate"} placement={"right"}>
                                    <FontAwesomeIcon
                                        onMouseEnter={() => setVisibleChild(true)}
                                        onMouseLeave={() => setVisibleChild(false)}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            if (onClone) onClone()
                                        }}
                                        icon={faClone}
                                        style={{fontSize: '1em', color: '#0077ff'}}
                                        className="ml-2 mr-0 mb-3"
                                    />
                                </Tooltip>
                                <Tooltip title={"Remove"} placement={"right"}>
                                    <FontAwesomeIcon
                                        onMouseEnter={() => setVisibleChild(true)}
                                        onMouseLeave={() => setVisibleChild(false)}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            onRemove()
                                        }}
                                        icon={faTrash}
                                        style={{fontSize: '1em', color: '#F44336'}}
                                        className="ml-2 mr-0 mt-3"
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Tooltip>
    )
}

export default LayerElement
