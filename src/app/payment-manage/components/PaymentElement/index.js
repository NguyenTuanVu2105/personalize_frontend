import {Icon, Modal, Tooltip, Typography} from 'antd'
import React from 'react'
import PaymentMethodIcon from '../../../billings/components/PaymentMethodIcon'
import {removePaymentMethod} from '../../../../services/api/paymentMethods'
import draggableIcon from '../../../../assets/images/draggable.svg'

const {confirm} = Modal

export default ({payment_id, payment_method_type, message, expiredDate, onClick, refresh, amountOfPaymentMethod}) => {
    const showConfirm = (payment_id) => {
        return amountOfPaymentMethod === 1 ?
            Modal.error({
                content: 'CAN\'T DELETE. You have to keep at least one payment method!'
            })
            : confirm({
                title: 'Do you want to delete this payment method?',
                content: 'You also can remove and add this payment method again in the future.',
                async onOk() {
                    await removePaymentMethod(payment_id)
                    refresh()
                },
                onCancel() {
                },
                okType: 'danger',
                okText: 'Remove'
            })
    }


    return (
        <Tooltip title="Drag the card to reorder payment method priority" >
            <div className="btn btn-light" style={{width: '100%', height: '100%', cursor: "pointer"}} onClick={onClick}>
                <div>
                    <div className={'flex-horizontal'} style={{padding: '0.25em 0em', fontSize: '1.4rem'}}>

                        {/*<img src={draggableIcon} width="20px" height="20px" alt={"Drag Drop"}/>*/}
                        <div className="flex-center-vertical w-75" style={{height: 60, paddingRight: 10}}>
                            <div className="m-r-15">
                                <img src={draggableIcon} width="24px" height="24px" alt={'Drag Drop'}/>
                            </div>
                            <span style={{height: 30, display: 'flex', justifyContent: 'start'}}>
                                <PaymentMethodIcon brand={payment_method_type}/>
                            </span>
                            <Typography.Text ellipsis={true} style={{fontWeight: '500'}}>{message}</Typography.Text>
                        </div>
                        <div className="flex-center-vertical flex-end w-25">
                            {expiredDate && (<span
                                style={{fontSize: '1.4rem', fontWeight: '500', color: '#6f7f8c'}}>{expiredDate}</span>)}
                            <Icon type={'delete'} style={{fontSize: '1.5em', color: '#F44336'}}
                                  className={'m-l-25 m-r-10'}
                                  onClick={() => showConfirm(payment_id)}/>
                        </div>
                    </div>
                </div>
            </div>
        </Tooltip>
    )
}
