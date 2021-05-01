import React, {useContext, useEffect, useState} from 'react'
import PaymentElement from '../PaymentElement'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'

import './styles.css'
import {Button, Modal, notification} from 'antd'
import DetailCardContent from '../DetailCardContent'
import {getPaymentMethodList, reorderPaymentMethod} from '../../../../services/api/paymentMethods'
import NewPaymentMethodContext from './../../context/NewPaymentMethodContext'
import {Heading} from '@shopify/polaris'

const AvailablePaymentList = ({col}) => {
    const context = useContext(NewPaymentMethodContext)
    const [_paymentMethods, _setPaymentMethods] = useState([])
    const [_detailModal, _setDetailModal] = useState(false)
    const [_reorderPaymentMethodCount, _setReorderPaymentMethodCount] = useState(0)

    useEffect(() => {
        getPaymentMethods()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context.newMethodAdded])

    useEffect(() => {
        if (_reorderPaymentMethodCount > 0) {
            onReorderCard()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_reorderPaymentMethodCount])

    const getPaymentMethods = async () => {
        const {success, data} = await getPaymentMethodList()
        if (success) {
            let {results} = data
            _setPaymentMethods(results)
            // _setPaymentMethods(results);
        } else {
            Modal.error({
                content: "An error occurs. Please try again"
            })
        }
    }

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list)
        const [removed] = result.splice(startIndex, 1)
        result.splice(endIndex, 0, removed)

        return result
    }

    const onDragEnd = (result) => {
        if (!result.destination) {
            return
        }

        if (result.destination.index !== result.source.index) {
            const cards = reorder(
                _paymentMethods,
                result.source.index,
                result.destination.index
            )

            _setPaymentMethods(cards)
            _setReorderPaymentMethodCount(_reorderPaymentMethodCount + 1)
        }
    }

    const onCloseModal = () => {
        _setDetailModal(false)
    }

    const onReorderCard = async () => {
        const reqData = {
            new_payment_method_order: _paymentMethods.map(m => m.id)
        }
        const {success, data} = await reorderPaymentMethod(reqData)
        if (success && data.success) {
            // alert("Reorder Successfully")
            notification.success({
                message: '"Reorder successfully"'

            })
        } else {
            Modal.error({
                content: 'An error occurs. Please try again'
            })
        }
    }

    return (
        <div className={`col-xl-${col} col-12 card-list-container px-4`}>
            <div className={'flex-horizontal'}>
                <div className={'flex-horizontal mt-2 mb-3'}>
                    <Heading element="h1">Available payment methods</Heading>
                </div>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="col-12 px-0">
                            <div className="row step-drag-payment-method">
                                {_paymentMethods.map((item, index) => (
                                        <Draggable key={index} draggableId={`${item.id}_${index}`} index={index}>
                                            {(provided, snapshot) => (
                                                <div ref={provided.innerRef}
                                                     {...provided.draggableProps}
                                                     {...provided.dragHandleProps}
                                                     className="col-lg-12 mt-2">
                                                    <PaymentElement payment_id={item.id}
                                                                    gateway={item.partner_payment_method.gateway}
                                                                    payment_method_type={item.partner_payment_method.type}
                                                                    message={
                                                                        item.partner_payment_method.last4
                                                                            ? `**** **** **** ${item.partner_payment_method.last4}`
                                                                            :
                                                                            item.partner_payment_method.email
                                                                                ? item.partner_payment_method.email
                                                                                : item.partner_payment_method.label}
                                                                    expiredDate={item.partner_payment_method.exp_month ? `${item.partner_payment_method.exp_month}/${item.partner_payment_method.exp_year}` : null}
                                                                    refresh={getPaymentMethods}
                                                                    amountOfPaymentMethod={_paymentMethods.length}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    )
                                )}

                            </div>
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <Modal
                title="All card detail"
                visible={_detailModal}
                onCancel={onCloseModal}
                keyboard={true}
                footer={[
                    <Button key="back" onClick={onCloseModal}>
                        Close
                    </Button>,
                ]}
                width={'90%'}
            >
                <DetailCardContent card={_paymentMethods}/>
            </Modal>
        </div>
    )
}


export default AvailablePaymentList
