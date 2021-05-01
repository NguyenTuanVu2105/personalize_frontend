import {Button, Checkbox, Form, notification} from 'antd'
import React, {useContext, useState} from 'react'
import {cancelShipping} from '../../../../services/api/orders'
import BuyItem from './FulfillmentItem'
import SummaryFulfillmentInfo from './SummaryFulfillmentInfo'
import {Modal} from '@shopify/polaris'
import './CancelShippingModal.scss'
import AppContext from '../../../../AppContext'

const CancelShippingModal = (props) => {
    const { order, packs } = props
    const [visible, setVisible] = useState('')

    const [checkedPacks, setCheckedPacks] = useState([])
    const {triggerReloadPage} = useContext(AppContext)

    const onChange = (checkedValues) => {
        setCheckedPacks(checkedValues)
    }


    const cancelShippingOrder = async () => {
        let res = await cancelShipping(order.id, checkedPacks, '')
        if (res.data.success) {
            notification.success({
                message: 'Cancel Shipping Order Success',
                description:
                    'Your request is succeeded',
            })
            triggerReloadPage()
        } else {
            notification.error({
                message: 'Cancel shipping order error',
                description:
                    'Error when cancel Shipping',
            })
        }
    }

    const onSubmit = () => {
        cancelShippingOrder().finally(() => {
            setVisible(false)
        })
    }

    const onClose = () => {
        setVisible(false)
    }

    return (
        <div className="cancel-shipping">
            <Button type="danger" className="add-new-shop-btn" onClick={() => {
                setVisible(true)
            }}>Cancel Shipping</Button>
            <Modal
                large={true}
                open={visible}
                onClose={onClose}
                title="Choose Pack to Cancel Shipping"
                primaryAction={{
                    content: 'Confirm',
                    onAction: onSubmit,
                    disabled: checkedPacks.length === 0
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: onClose
                    },
                ]}
                style={{width: '70%'}}
            >
                <Form className="cancel-shipping-form" onSubmit={onSubmit} layout="vertical">
                    <Checkbox.Group defaultValue={checkedPacks} onChange={onChange} style={{ width: '100%' }}>
                        {packs.map((pack, index)=> {
                            return (
                                <Modal.Section key={index}>
                                    <div>
                                        <Checkbox style={{ width: '100%' }} value={pack.id}>
                                            <h2 style={{display: "inline-block"}}>Pack #{pack.rawIndex + 1}</h2>
                                        </Checkbox>
                                        <div>
                                            {pack.items.map((item, index) => <BuyItem item={item} key={index} is_editable={false}/>)}
                                            <SummaryFulfillmentInfo pack={pack} />
                                        </div>
                                        {/*{index < packs.length - 1 && <hr/>}*/}
                                    </div>
                                </Modal.Section>
                            )
                        })}
                    </Checkbox.Group>
                </Form>
            </Modal>
        </div>

    )
}

export default CancelShippingModal
