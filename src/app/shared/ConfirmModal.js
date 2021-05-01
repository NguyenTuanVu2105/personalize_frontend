import React, {useState} from "react"
import {Button, Modal, TextContainer} from "@shopify/polaris"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons"
import {Button as AntButton} from "antd"

const POLARIS_TYPE = "polaris"
const ANT_TYPE = "ant"

export const ConfirmModal = ({butttonType = POLARIS_TYPE, buttonText, buttonClass, title, content, primaryAction, secondaryActionText}) => {
    const [modalActive, setModalActive] = useState(false)
    const handleActiveModalChange = () => setModalActive(!modalActive)
    return (
        <div>
            {butttonType === POLARIS_TYPE &&
            <Button primary onClick={handleActiveModalChange}>{buttonText}</Button>}
            {butttonType === ANT_TYPE &&
            <AntButton onClick={handleActiveModalChange} className={buttonClass} href="#"
                       type="link">
                <FontAwesomeIcon icon={faTrashAlt}/>
            </AntButton>}
            <Modal
                open={modalActive}
                onClose={handleActiveModalChange}
                title={title}
                primaryAction={primaryAction}
                secondaryActions={[
                    {
                        content: secondaryActionText,
                        onAction: handleActiveModalChange,
                    },
                ]}
            >
                <Modal.Section>
                    <TextContainer>
                        {content}
                    </TextContainer>
                </Modal.Section>
            </Modal>
        </div>
    )
}