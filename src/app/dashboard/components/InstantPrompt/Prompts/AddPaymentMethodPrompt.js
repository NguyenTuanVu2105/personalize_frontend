import React, {useState} from 'react'
import {Banner, Button, Modal, TextContainer} from '@shopify/polaris'
import Paths from '../../../../../routes/Paths'
import {useHistory} from 'react-router-dom'

const AddPaymentMethodPrompt = ({status = 'info', confirmRequired = false}) => {

    const history = useHistory()
    const [modalVisible, setModalVisible] = useState(false)

    const handleClickButton = () => {
        if (confirmRequired) {
            setModalVisible(true)
        } else {
            redirectToPaymentManager()
        }
    }

    const redirectToPaymentManager = () => {
        history.push(Paths.PaymentManager)
    }

    const handleReturn = () => {
        setModalVisible(false)
    }

    return (
        <div className={'m-b-20'}>
            <Banner title="Add your billing method" status={status}>
                <div className="p-b-10">
                    <p>You need to add billing method to fulfill your orders. Click button below to add billing
                        methods</p>
                </div>

                <Button onClick={handleClickButton}>
                    Manage billing methods
                </Button>
            </Banner>

            {
                confirmRequired && (
                    <Modal
                        open={modalVisible}
                        onClose={() => setModalVisible(false)}
                        title="Change location"
                        primaryAction={{
                            content: 'Stay here',
                            onAction: handleReturn
                        }}
                        secondaryActions={[
                            {
                                content: 'Continue',
                                onAction: redirectToPaymentManager,
                            },
                        ]}
                    >
                        <Modal.Section>
                            <TextContainer>
                                <p>
                                    Changes you made may not be saved.
                                </p>
                            </TextContainer>
                        </Modal.Section>
                    </Modal>
                )
            }
        </div>
    )
}
export default AddPaymentMethodPrompt
