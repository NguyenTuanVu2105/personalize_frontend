import React, {useContext, useEffect, useState} from "react"
import {getDetailTracking} from "../../../services/api/tracking"
import "./TrackingContainer.scss"
import logo from "../../../assets/presentations/logo.png"
import {Link} from "react-router-dom"
import Paths from "../../../routes/Paths"
import AppContext from "../../../AppContext"
import TrackingSteps from "./step/TrackingSteps"
import {formatDatetime} from "../../../services/util/datetime"
import {Col, Row} from "antd"
import TrackingTimeLine from "./time-line/TrackingTimeLine"

const TrackingContainer = (props) => {
    const tracking_number = props.match.params.tracking_number
    const {setLoading} = useContext(AppContext)
    const [_loading, _setLoading] = useState(true)
    const [data, setData] = useState(null)
    const [histories, setHistories] = useState([])

    const fetch = async () => {
        setLoading(true)
        _setLoading(true)
        const res = await getDetailTracking(tracking_number)
        if (res.success && res.data.success) {
            const data = res.data.data
            setData(data)
            setHistories(data.histories)
        } else {
            setData({
                status: "Not exists",
                updated_at: new Date().toISOString(),
            })
        }
        setLoading(false)
        _setLoading(false)
    }

    useEffect(() => {
        fetch().then()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const renderStatus = () => {
        let result = data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : ""
        result = result.replaceAll("_", " ")
        return result
    }


    if (_loading || !data) {
        return <></>
    } else {
        return (
            <div className="container-sm">
                <div className="tracking-header">
                    <div className="flex-center logo">
                        <Link to={Paths.HomePage}>
                            <img src={logo} alt="Logo"/>
                        </Link>
                    </div>
                </div>
                <TrackingSteps histories={histories}/>
                <div className="my-5 d-flex flex-space-between">
                    <div className="d-flex">
                        <b className="mr-2">Status:</b>
                        <span>{renderStatus()}</span>
                    </div>
                    <div>
                        <b className="mr-2">Last updated:</b>
                        <span>{formatDatetime(data.updated_at)}</span>
                    </div>
                </div>
                <hr/>
                <Row className="pt-3 row-same-height">
                    <Col span={8} className="border-right d-flex flex-column col-same-height">
                        <div style={{wordBreak: "break-word"}}>
                            <b>Carrier:&nbsp;</b>
                            {data.carrier}
                        </div>
                        <div style={{wordBreak: "break-word"}}>
                            <b>Tracking code:&nbsp;</b>
                            {data.tracking_code}
                        </div>
                    </Col>
                    <Col span={16} className="col-same-height">
                        <TrackingTimeLine histories={histories}/>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default TrackingContainer