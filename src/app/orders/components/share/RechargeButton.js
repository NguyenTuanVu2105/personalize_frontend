import React, {useState} from 'react'
import {Icon} from "antd"
import {Button, Modal, TextContainer} from "@shopify/polaris"
import {rechargeFailedInvoices} from "../../../../services/api/invoices"
import {DISPLAY_TYPE} from "../../constants"

const RechargeButton = ({displayType, orderId, callback}) => {
    const [rechargeConfirmModalDisplay, setRechargeConfirmModalDisplay] = useState(false)

    const _rechargeCurrentOrder = async () => {
        await rechargeFailedInvoices([], [orderId])
        await callback()
    }

    const toggleRechargeConfirmModal = () => setRechargeConfirmModalDisplay(!rechargeConfirmModalDisplay)

    return (
        <div>
            {
                displayType === DISPLAY_TYPE.DETAIL && (
                    <Button onClick={toggleRechargeConfirmModal}>
                        <Icon type="reload" spin={false}/>&nbsp; Recharge this order
                    </Button>
                )
            }
            {
                displayType === DISPLAY_TYPE.LIST && (
                    <Button onClick={toggleRechargeConfirmModal} plain>
                        Recharge
                    </Button>
                )
            }

            <Modal
                open={rechargeConfirmModalDisplay}
                onClose={toggleRechargeConfirmModal}
                title={`Recharge order #${orderId}`}
                primaryAction={{
                    content: 'Yes, recharge this order',
                    onAction: () => {
                        _rechargeCurrentOrder()
                        toggleRechargeConfirmModal()
                    },
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: toggleRechargeConfirmModal,
                    },
                ]}
            >
                <Modal.Section>
                    <TextContainer>
                        <p>
                            Are you sure to recharge this order?
                        </p>
                    </TextContainer>
                </Modal.Section>
            </Modal>
        </div>
    )
}
export default RechargeButton
