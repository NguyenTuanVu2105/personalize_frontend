import React, {useEffect, useState} from 'react'
import DocTitle from '../../shared/DocTitle'
import {Button, Layout} from "@shopify/polaris"
import {activateAccount} from "../../../services/api/activateAccount"
import LoadingScreen from "../../userpage/components/LoadingScreen"

import {CheckCircleTwoTone, ExclamationCircleTwoTone, InfoCircleTwoTone, StopTwoTone} from '@ant-design/icons'
import Countdown from "react-countdown"

import "./AccountActivationContainer.css"
import Paths from "../../../routes/Paths"
import {getLocalStorage} from "../../../services/storage/localStorage"
import {COOKIE_KEY} from "../../../services/storage/sessionStorage"

const AccountActivationContainer = function (props) {
    const uid = props.match.params.uid
    const token = props.match.params.token
    const [pageLoading, setPageLoading] = useState(true)
    const [activateAccountMessage, setActivateAccountMessage] = useState('')
    const [activateAccountCode, setActivateAccountCode] = useState('')
    // const history = useHistory()
    useEffect(() => {
        activateAccountRequest()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const activateAccountRequest = async () => {
        const reqData = {
            "uid": uid,
            "token": token
        }
        const activateAccountResp = await activateAccount(reqData)
        const activateAccountRespData = activateAccountResp.data
        // console.log(activateAccountResp)
        // console.log(activateAccountRespData)
        if (activateAccountResp.success && activateAccountRespData['data']['message']) {
            setPageLoading(false)
            setActivateAccountMessage(activateAccountRespData.data.message)
            setActivateAccountCode(activateAccountRespData.data.code)
        }
        // window.location.href = Paths.ShopifyApp
        // history.push(Paths.ShopifyApp)
    }

    const renderIcon = () => {
        let result
        switch (activateAccountCode) {
            case "SUCCESS":
                result = <CheckCircleTwoTone className={"activation-result-icon"} twoToneColor="#50B83C"/>
                break
            case "EXPIRED":
                result = <ExclamationCircleTwoTone className={"activation-result-icon"} twoToneColor="#EEC200"/>
                break
            case "ALREADY_ACTIVATED":
                result = <InfoCircleTwoTone className={"activation-result-icon"} twoToneColor="#47C1BF"/>
                break
            case "INVALID":
                result = <StopTwoTone className={"activation-result-icon"} twoToneColor="#DE3618"/>
                break
            default:
                result = null
        }
        return result
    }

    const renderRedirect = () => {
        return activateAccountCode === "SUCCESS" ? (
            <Countdown date={Date.now() + 5000} renderer={renderer}/>
        ) : (
            <div className={"go-back-button"}>
                <Button plain url={'/'}>Go to home page</Button>
            </div>
        )
    }

    const Completionist = () => <span>Redirecting..</span>

    const renderer = ({hours, minutes, seconds, completed}) => {
        const user = getLocalStorage(COOKIE_KEY.USER_ID)
        if (user) {
            if (completed) {
                props.history.push(Paths.Dashboard)
                return <Completionist/>
            } else {
                return (
                    <h5>
                        Redirecting to Dashboard page after <span className="countdown">{seconds}</span> seconds
                    </h5>
                )
            }
        } else {
            if (completed) {
                props.history.push(Paths.Login)
                return <Completionist/>
            } else {
                return (
                    <h5>
                        Redirecting to Login page after <span className="countdown">{seconds}</span> seconds
                    </h5>
                )
            }
        }
    }

    return (
        <div>
            <DocTitle title="Account Activation"/>
            <Layout>
                <Layout.Section>
                    {pageLoading ? (
                        <LoadingScreen/>
                    ) : (
                        <div className={"container-fluid"}>
                            <div className={"row justify-content-center mt-5"}>
                                <div className="col-12 text-center mt-5 mb-5">
                                    {renderIcon()}
                                </div>
                                <div className="col-12 text-center">
                                    <h3>{activateAccountMessage}</h3>
                                    {renderRedirect()}
                                </div>
                            </div>
                        </div>
                    )}
                </Layout.Section>
            </Layout>
        </div>
    )
}

export default AccountActivationContainer