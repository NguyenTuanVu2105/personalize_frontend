import React, {useContext, useEffect, useState} from 'react'
import {activatePayee, getPayoneerLoginUrl} from '../../../../services/api/payoneer'
import {notification} from 'antd'
import AppContext from '../../../../AppContext'
import {Button, Modal} from '@shopify/polaris'
import payoneer from '../../../../assets/images/payoneer.png'
import logo from '../../../../assets/presentations/logo.png'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExchangeAlt} from '@fortawesome/free-solid-svg-icons'
import PayoneerLoadingScreen from './PayoneerLoadingScreen'
import NewPaymentMethodContext from "../../context/NewPaymentMethodContext"

const PayoneerForm = (props) => {
    const {updateNewMethodAddingStatus} = useContext(NewPaymentMethodContext)
    const {setLoading, user} = useContext(AppContext)
    // const {onSuccess} = props
    const [showTermAndConditionConfirm, setShowTermAndConditionConfirm] = useState(false)
    const [loginWindow, setLoginWindow] = useState(null)

    useEffect(() => {
        if (loginWindow) {
            const checkWindowInterval = setInterval(() => {
                if (loginWindow.closed) {
                    setLoginWindow(null)
                }
            }, 200)
            return () => {
                clearInterval(checkWindowInterval)
            }
        }
    }, [loginWindow])

    const receiveMessage = (e) => {
        const params = e.data

        if (params.payee) activatePayee(params.payee, params.verify_code)
            .then((res) => {
                if (res.data.success) {
                    notification.success({
                        message: 'Authentication Success',
                        description:
                            'Your Payonneer account has been integrated successfully',
                    })
                    updateNewMethodAddingStatus()
                } else {
                    notification.error({
                        message: 'Cannot add payment',
                        description: res.data.description || 'Please try again or contact administrator to get support',
                    })
                }
            })
            .finally(() => {
                setLoginWindow(null)
                setShowTermAndConditionConfirm(false)
            })

    }

    const getPayoneerLoginLink = async () => {
        setLoading(true)
        const res = await getPayoneerLoginUrl(user.shop ? user.shop.url : null)
        const strWindowFeatures = 'toolbar=no, menubar=no, width=600, height=700, top=100, left=100'
        if (res.data && res.data.login_link) {
            setLoading(true)
            window.removeEventListener('message', receiveMessage)
            const newLoginWindow = window.open('', '_blank', strWindowFeatures)
            newLoginWindow.document.write('Loading page...')
            newLoginWindow.location.href = res.data.login_link
            window.addEventListener('message', receiveMessage, false)

            setShowTermAndConditionConfirm(false)
            setLoginWindow(newLoginWindow)
        } else {
            notification.warning({
                title: 'Error',
                content: res.data.message || 'An error has been occurred, please contact administrator!',
            })

        }
        setLoading(false)
    }

    const closeWindow = () => {
        setShowTermAndConditionConfirm(true)
        if (loginWindow && !loginWindow.closed) {
            loginWindow.close()
        }
        setLoginWindow(null)
    }

    return (
        <div className="flex-center p-t-10">
            <Modal
                open={showTermAndConditionConfirm}
                onClose={() => setShowTermAndConditionConfirm(false)}
                title="Pay with Payoneer"
                primaryAction={{
                    content: 'Agree and continue',
                    onAction: getPayoneerLoginLink,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => setShowTermAndConditionConfirm(false),
                    },
                ]}
                maskClosable={false}
            >
                <div className="p10">
                    <div className="flex-center p10">
                        <img src={payoneer} width="auto" height="40px" alt="pwp"/>
                        <FontAwesomeIcon icon={faExchangeAlt} size="lg" className="m25"/>
                        <img src={logo} width="auto" height="30px" alt="pwp"/>
                    </div>
                    <br/>
                    <div className="text-justify p10">
                        By clicking, you authorize PrintHolo (as MERCHIZE PTE. LTD.) to instruct Payoneer to debit your
                        Payoneer balance for all payments due by you to PrintHolo pursuant to the agreement between you
                        and PrintHolo. You further acknowledge and agree that Payoneer shall be entitled to debit your
                        Payoneer balance as instructed by PrintHolo from time to time. You may revoke this authorization
                        at any time, by written notice to PrintHolo, at the following email address:
                        support@printholo.com. You acknowledge that this authorization shall remain in force until you
                        revoke it as provided herein.
                    </div>

                </div>

            </Modal>
            <Button size="large" style={{backgroundColor: '#FF4800', color: 'white'}}
                    icon={(<img src={payoneer} width="auto" height="30px" alt="pwp" className={'m-r-10'}/>)}
                    onClick={() => setShowTermAndConditionConfirm(true)}>Pay with Payoneer</Button>
            {loginWindow && (<PayoneerLoadingScreen onClose={closeWindow}/>)}
        </div>
    )
}

export default PayoneerForm
