import React, {useEffect, useState} from 'react'
import {Button, Modal, TextField} from '@shopify/polaris'
import {getShopIfyAuthUrl} from '../../shop-setting/helpers/getShopIfyAuthUrl'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faPlus} from "@fortawesome/free-solid-svg-icons"

const AddNewStoreModal = ({buttonType = "normal", displayInstantly = false, callback}) => {
    const [storeUrl, setStoreUrl] = useState('')
    const [storeUrlError, setStoreUrlError] = useState('')

    const [addShopModalVisible, setAddShopModalVisible] = useState(null)
    const [installStoreWindow, setInstallStoreWindow] = useState(null)

    useEffect(() => {
        setAddShopModalVisible(displayInstantly)
    }, [displayInstantly])

    const onClickOpenModal = () => {
        setAddShopModalVisible(true)
    }

    const onChangeStore = (value) => {
        setStoreUrl(value)
        setStoreUrlError('')
    }

    const onClearButtonClick = () => {
        setStoreUrl('')
        setStoreUrlError('')
    }

    useEffect(() => {
        if (installStoreWindow) {
            const checkWindowInterval = setInterval(() => {
                if (installStoreWindow.closed) {
                    setInstallStoreWindow(null)
                    callback && callback()
                    setAddShopModalVisible(false)
                    // _fetchShops(page, rowNumber, queryValue, ecommerce, currency, selectedStartDate, selectedEndDate, '-create_time')
                }
            }, 200)
            return () => {
                clearInterval(checkWindowInterval)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [installStoreWindow])


    const onSubmit = (e) => {
        e.stopPropagation()
        const checkDomain = /^.*([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?\/?$/
        const checkPass = checkDomain.test(storeUrl)
        if (checkPass) {
            const url = getShopIfyAuthUrl(storeUrl)
            const strWindowFeatures = 'toolbar=no, menubar=no, width=1280, height=700, top=100, left=100'
            const newWindow = window.open('', '_blank', strWindowFeatures)
            newWindow.document.write('Loading page...')
            newWindow.location.href = url
            setInstallStoreWindow(newWindow)

            // eslint-disable-next-line no-restricted-globals
            // location.href = getShopIfyAuthUrl(storeUrl)
        } else setStoreUrlError("Incorrect store address. Valid store address ends with .myshopify.com, .com or another domain extension.")

    }

    const onClose = () => {
        setAddShopModalVisible(false)
    }

    const handleKeyPress = (event) => {
        const enterKeyPressed = event.keyCode === 13
        if (enterKeyPressed) {
            event.preventDefault()
            return onSubmit(event)
        }
    }

    return (
        <div>
            {
                buttonType === "normal" && <Button primary className="add-new-shop-btn" onClick={onClickOpenModal}
                                                   icon={
                                                       <FontAwesomeIcon icon={faPlus}
                                                                        style={{color: '#fff'}}/>}>
                    &nbsp;Add store</Button>
            }

            {
                buttonType === "plain" && <Button plain className="add-new-shop-btn" onClick={onClickOpenModal}
                                                  icon={
                                                      <FontAwesomeIcon icon={faPlus}/>}>
                    &nbsp;Add store</Button>
            }

            <Modal
                open={addShopModalVisible}
                onClose={onClose}
                title="Add new store"
                primaryAction={{
                    content: 'Add',
                    onAction: onSubmit,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: onClose,
                    },
                ]}
                maskClosable={false}
            >
                <Modal.Section>
                    <div onKeyDown={handleKeyPress}>
                        <TextField
                            label="Store address"
                            autoFocus
                            clearButton
                            onClearButtonClick={onClearButtonClick}
                            value={storeUrl}
                            onChange={onChangeStore}
                            placeholder="example.myshopify.com"
                            error={storeUrlError}
                            helpText={'Store address can include "http://", "https://" or not'}
                        />
                    </div>
                </Modal.Section>
            </Modal>
        </div>

    )
}

export default AddNewStoreModal
