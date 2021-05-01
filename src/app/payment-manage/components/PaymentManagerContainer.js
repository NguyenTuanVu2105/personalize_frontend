import React, {useCallback, useContext, useEffect, useState} from 'react'
import './PaymentManagerContainer.css'
import AvailablePaymentList from './AvailablePaymentList'
import NewPaymentMethodContext from './../context/NewPaymentMethodContext'
import AddPaymentMethodContainer from './AddPaymentMethodContainer'
import PaymentHistory from './PaymentHistory'
import Paths from '../../../routes/Paths'
import UserPageContext from '../../userpage/context/UserPageContext'
import {Card, DisplayText, Tabs, TextContainer} from '@shopify/polaris'
import AppContext from "../../../AppContext"


const PaymentManagerContainer = (props) => {
    const [newMethodAdded, setNewMethodAdded] = useState(0)
    const {setNameMap} = useContext(UserPageContext)
    const {setLoading} = useContext(AppContext)
    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.PaymentManager]: 'Payments',
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const [selected, setSelected] = useState(0)

    const updateNewMethodAddingStatus = () => {
        setNewMethodAdded(newMethodAdded + 1)
    }

    const handleTabChange = useCallback(
        (selectedTabIndex) => setSelected(selectedTabIndex),
        [],
    )

    const tabs = [
        {
            id: 'payment-methods',
            content: 'Payment methods',
            panelID: 'payment-methods',
            component: (
                <div className="row justify-content-center bg-white">
                    <div className="col-xl-8 col-12">
                        <div className="row">
                            <AddPaymentMethodContainer {...props} col={12}/>
                        </div>
                    </div>
                    <AvailablePaymentList col={4}/>
                </div>
            )
        },
        {
            id: 'transactions-history',
            content: <div className='step-view-history'>Transactions history</div>,
            panelID: 'transactions-history',
            component: (
                <div className="row justify-content-center bg-white">
                    <PaymentHistory/>
                </div>
            )
        },
    ]

    return (
        <NewPaymentMethodContext.Provider
            value={{
                newMethodAdded,
                updateNewMethodAddingStatus,
                setLoading
            }}>
            <TextContainer spacing="tight">
                <DisplayText element="h3" size="large">Payment management</DisplayText>
                <p>Add new payment method or see all transaction histories</p>
            </TextContainer>
            <div className="page-main-content">
                <Card>
                    <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
                        <Card.Section
                            // title={tabs[selected].content}
                        >
                            {tabs[selected].component}
                        </Card.Section>
                    </Tabs>
                </Card>
            </div>
        </NewPaymentMethodContext.Provider>
    )
}


export default PaymentManagerContainer
