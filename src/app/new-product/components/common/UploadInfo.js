import React, {useContext, useEffect} from "react"
import PropTypes from 'prop-types'
import {Popover, Progress} from "antd"
import {IconUpload, IconUploadColor, UploadStatus} from "../../constants/upload"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faCloudUploadAlt} from "@fortawesome/free-solid-svg-icons"
import NewProductContext from "../../context/NewProductContext"
import "./UploadInfo.scss"

const IconUploadTotalDisplay = (props) => {

    const color = () => {
        if (props.error){
            return "rgb(250, 82, 82)"
        } else{
            if (props.percent === 100){
                return "rgb(135, 208, 104)"
            }
            else {
                return null
            }
        }
    }

    return (
        <div className={"flex-center"}>
            <FontAwesomeIcon
                icon={faCloudUploadAlt}
                color={color()}
                opacity={props.percent === 100 ? 1 : 0.7}
                style={{position: "absolute", transform: "scale(.75)"}}
                size={props.iconSize}
            />
            <Progress
                className={"progress-no-text"}
                width={props.width}
                type="circle"
                status={props.error ? "exception" : null}
                percent={props.percent}
            />
        </div>
    )
}

IconUploadTotalDisplay.defaultProps = {
    width: 25,
    iconSize: "1x",
}

IconUploadTotalDisplay.propTypes = {
    width: PropTypes.number,
    iconSize: PropTypes.oneOf(["2x","1x"]),
    percent: PropTypes.number.isRequired,
    error: PropTypes.bool.isRequired,
}


const UploadInfo = () => {
    const {uploadManager, artworkUploadPercent, clearUpload} = useContext(NewProductContext)


    const numberUploadComplete = () => {
        let complete = 0
        uploadManager.forEach(upload => {
            if (upload.status === UploadStatus.COMPLETED) {
                complete++
            }
        })
        return complete
    }

    useEffect(() => {
        if (uploadManager.length > 0) {
            let interval = setInterval(() => {
                if (numberUploadComplete() === uploadManager.length) {
                    setTimeout(() => {
                        clearUpload()
                        clearInterval(interval)
                    }, 2000)
                }
            })
            return () => {
                clearInterval(interval)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadManager])


    return (
        <Popover
            trigger={["click", "hover"]}
            placement={"rightBottom"}
            title={(
                <div className="flex-middle p-1 pt-3">
                    <IconUploadTotalDisplay error={uploadManager.some(upload => upload.status === UploadStatus.ERROR)} percent={artworkUploadPercent}/>
                    <b>&nbsp;Total uploaded artwork:&nbsp;</b>
                    <span>
                        {numberUploadComplete()}/{uploadManager.length}
                    </span>
                </div>
            )}
            content={(
                <div>
                    {
                        uploadManager.map(upload => {
                            let loaded = 0
                            let total = 0
                            if (upload.status !== UploadStatus.CANCELED) {
                                total = upload.uploadChunk.chunks.length + 1
                                upload.uploadChunk.chunks.forEach(chunk => {
                                    loaded += chunk.percent
                                })
                                loaded += upload.uploadChunk.merge ? upload.uploadChunk.merge.percent : 0
                            }

                            const statusAttr = upload.status === UploadStatus.ERROR ? {status: "exception"} : {}

                            return (
                                <div key={upload.id} className="d-flex p-1">
                                    <div
                                        className="flex-center"
                                    >
                                        <FontAwesomeIcon
                                            icon={IconUpload[upload.status]}
                                            color={IconUploadColor[upload.status]}
                                            style={{
                                                position: "absolute",
                                                transform: "scale(.75)"
                                            }}
                                        />
                                        <Progress
                                            className="progress-no-text"
                                            width={25}
                                            type="circle"
                                            percent={Math.floor(100 * (loaded / total))}
                                            {...statusAttr}
                                        />
                                    </div>
                                    <b>&nbsp;{upload.uploadChunk.fileName}</b>
                                </div>
                            )
                        })
                    }
                </div>
            )}
        >
            <div className={"upload-info-shortcut-container"}>
                <IconUploadTotalDisplay width={40} iconSize={"2x"} error={uploadManager.some(upload => upload.status === UploadStatus.ERROR)} percent={artworkUploadPercent}/>
            </div>
        </Popover>
    )
}

export default UploadInfo