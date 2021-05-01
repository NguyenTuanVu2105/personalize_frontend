import React, {useContext, useState} from 'react'
import {Caption, Checkbox, Heading, Modal, TextContainer} from "@shopify/polaris"
import "./PolicyAgreementModal.scss"
import {ignoreInstantPrompt} from "../../../../services/api/instantPrompt"
import AppContext from "../../../../AppContext"

const PolicyAgreementModal = (props) => {
    const {policyData} = props
    const [policyAgreement, setPolicyAgreement] = useState(false)
    const [modalActive, setModalActive] = useState(true)
    const {reloadUnreadInstantPrompt} = useContext(AppContext)

    const handleModalChange = () => {
        return policyAgreement ? onAcceptedClose() : onDisagreeClose()
    }

    const onAcceptedClose = async () => {
        setModalActive(!modalActive)
        const reqData = {
            type: 'policy_agreement'
        }
        const {success, data} = await ignoreInstantPrompt(reqData)
        if (success && data.success) {
            reloadUnreadInstantPrompt()
            // add notification if necessary
        }
    }


    const handleChangePolicy = (newValue) => {
        setPolicyAgreement(newValue)
    }

    const onDisagreeClose = () => {
        const selector = "#policy-agreement-checkbox"
        if (selector) {
            const element = document.querySelector(selector)
            if (element) {
                if (!element.classList.contains('importantError')) {
                    element.classList.add('importantError')
                    setTimeout(() => {
                        element.classList.remove('importantError')
                    }, 2000)
                }
            }
        }
    }

    return (
        <div className={'policy-agreement-modal'}>
            <Modal
                open={modalActive}
                onClose={handleModalChange}
                // large
                title="PrintHolo's seller policy"
                primaryAction={{
                    content: 'OK',
                    onAction: handleModalChange,
                    disabled: !policyAgreement,
                }}
                footer={
                    (
                        <div className={"text-left"}>
                            <Caption>The version of this Policy is effective December 01, 2020.</Caption>
                        </div>
                    )
                }
            >
                <div className={'policy-agreement-modal'}>
                    <Modal.Section>
                        <Heading>{policyData[0].title}</Heading>
                        <Caption>Please read our policy carefully, if you have any questions, please contact our support
                            team.</Caption>
                        <TextContainer>
                            <div className={'mt-4 policy-content'}>
                                {
                                    policyData[0] && (
                                        <div dangerouslySetInnerHTML={{__html: policyData[0].content}}/>
                                    )
                                }
                            </div>
                            <div id={'policy-agreement-checkbox'}>
                                <Checkbox
                                    label="I have read and accepted PrintHolo's seller policy"
                                    checked={policyAgreement}
                                    onChange={handleChangePolicy}
                                />
                            </div>
                        </TextContainer>
                    </Modal.Section>
                </div>
            </Modal>
        </div>
    )

}

export default PolicyAgreementModal
