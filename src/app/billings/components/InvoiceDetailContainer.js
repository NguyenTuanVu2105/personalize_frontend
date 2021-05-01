import React, {useContext, useEffect, useState} from 'react'
import {Col, Icon, Row} from 'antd'
import Paths from '../../../routes/Paths'
import DocTitle from '../../shared/DocTitle'
import {getInvoiceDetail, rechargeFailedInvoices} from '../../../services/api/invoices'
import InvoiceStatusContainer, {InvoiceStatus} from './InvoiceStatus'
import InvoiceItemContainer from './InvoiceItemContainer'
import PaymentContainer from './PaymentContainer'
import {formatDatetime} from '../../../services/util/datetime'
import {getQueryParams} from '../../../services/util/location'
import CompletePaymentWaitingOverlay from './CompletePaymentWaitingOverlay'
import AppContext from '../../../AppContext'
import {Button, DisplayText, TextContainer} from '@shopify/polaris'
import UserPageContext from '../../userpage/context/UserPageContext'
import RefundPackContainer from './RefundPackContainer'
import './Billing.scss'

const InvoiceDetailContainer = function (props) {
    const invoiceId = props.match.params.invoiceId
    const {setNameMap} = useContext(UserPageContext)
    const [invoiceDetail, setInvoiceDetail] = useState({})
    const [userSettings, setUserSettings] = useState({})
    const [isWaiting, setIsWaiting] = useState(false)
    const {setLoading} = useContext(AppContext)


    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.InvoiceList]: 'Billings',
            [Paths.InvoiceDetail(invoiceId)]: invoiceId,
        })
        _fetchInvoiceById()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const {waiting} = getQueryParams(props.location.search)
        setIsWaiting(waiting === 'true')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const _fetchInvoiceById = async () => {
        setLoading(true)
        const invoiceDetailResp = await getInvoiceDetail(invoiceId)
        const invoiceDetail = invoiceDetailResp.data
        setUserSettings(invoiceDetail.user_settings)
        setInvoiceDetail(invoiceDetail)
        setLoading(false)
    }

    const _rechargeCurrentFailedInvoice = async () => {
        await rechargeFailedInvoices([invoiceId])
        await _fetchInvoiceById()
    }


    const {id, status, total_cost, customer, packs, paid_time, create_time, payment_method, refunds} = invoiceDetail

    console.log("invoiceDetail", invoiceDetail)

    return (
        <div>
            <DocTitle title={`#${id} | Billing Detail`}/>
            {!!packs &&
            <div>
                <div className="page-header">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: "center"}}
                         className={'mb-2'}>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <TextContainer spacing="tight">
                                <DisplayText element="h3" size="large">{'Billing #' + invoiceId}</DisplayText>
                            </TextContainer>&nbsp;&nbsp;
                            <div className={''}>
                                <InvoiceStatusContainer status={status} style={{padding: '.5rem .8rem'}}/>
                            </div>
                        </div>
                        {status === InvoiceStatus.FAILED && userSettings.is_charge_halted &&
                        <Button destructive onClick={_rechargeCurrentFailedInvoice}>
                            <Icon type="reload" spin={false}/>&nbsp; Recharge This Billing
                        </Button>}
                    </div>
                    <div style={{marginBottom: '.5em'}}>
                        <span style={{color: '#1B1B1B'}}>Created at {formatDatetime(create_time)}</span>
                    </div>
                </div>
                <div>
                    {isWaiting ? <CompletePaymentWaitingOverlay/> : null}
                    <Row>
                        <Col span={24} lg={16}>
                            <div className="row">
                                {packs.map((item, i) => <InvoiceItemContainer key={i} data={item}/>)}
                                {refunds.map((item, i) => item.info.refunded_items &&
                                    <RefundPackContainer key={i} data={item}/>)}
                            </div>
                        </Col>
                        <Col span={24} lg={8} className="pl-lg-5">
                            <PaymentContainer invoiceId={id} customerInfo={customer} status={status}
                                              totalCost={total_cost}
                                              paidTime={paid_time} payment_method={payment_method}
                                              refunds={refunds}/>
                        </Col>
                    </Row>
                </div>
            </div>
            }
        </div>
    )

}

export default InvoiceDetailContainer
