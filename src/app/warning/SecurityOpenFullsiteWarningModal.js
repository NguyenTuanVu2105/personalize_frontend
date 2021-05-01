import React, {useEffect, useState} from 'react'
import {Caption, Heading, Modal} from "@shopify/polaris"
import {getReactEnv} from "../../services/env/getEnv"
import Paths from "../../routes/Paths"

const SecurityOpenFullsiteWarningModal = function ({fullsiteWarningVisible, setFullsiteWarningVisible}) {
    const [warningVisible, setWarningVisible] = useState(null)

    useEffect(() => {
        setWarningVisible(fullsiteWarningVisible)
    }, [fullsiteWarningVisible])

    const onClose = () => {
        setWarningVisible(false)
        setFullsiteWarningVisible(false)
    }

    const goToFullSite = () => {
        const client_url = getReactEnv("CLIENT_URL")
        window.open(`${client_url}${Paths.Login}`)
    }

    return (
        <Modal
            open={warningVisible}
            onClose={onClose}
            title="Open PrintHolo full website"
            primaryAction={{
                content: 'Open website',
                onAction: goToFullSite,
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: onClose,
                },
            ]}
        >
            <Modal.Section>
                <Heading>PrintHolo can not keep your login state</Heading>
                <Caption>Maybe due to incognito window or some 3rd party libraries has been blocked. You can login again
                    in our full website to continue using PrintHolo.</Caption>
            </Modal.Section>
        </Modal>
    )
}

export default SecurityOpenFullsiteWarningModal
