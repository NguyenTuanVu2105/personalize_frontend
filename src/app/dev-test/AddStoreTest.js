import React, {useEffect, useState} from 'react'
import {Button, TextField} from '@shopify/polaris'
import {getShopIfyAuthUrl} from '../shop-setting/helpers/getShopIfyAuthUrl'

const AddStoreTest = (props) => {
    const [storeUrl, setStoreUrl] = useState('')
    const [storeUrlError, setStoreUrlError] = useState('')

    const [installStoreWindow, setInstallStoreWindow] = useState(null)


    const onChangeShop = (value) => {
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
            // eslint-disable-next-line no-restricted-globals
            location.href = getShopIfyAuthUrl(storeUrl)
        } else setStoreUrlError("Incorrect store address. Valid store address ends with .myshopify.com, .com or another domain extension.")

    }

    const handleKeyPress = (event) => {
        const enterKeyPressed = event.keyCode === 13
        if (enterKeyPressed) {
            event.preventDefault()
            return onSubmit(event)
        }
    }

    return (
        <div className={"m-4"} onKeyDown={handleKeyPress}>
            <TextField
                label="Store address"
                autoFocus
                clearButton
                onClearButtonClick={onClearButtonClick}
                value={storeUrl}
                onChange={onChangeShop}
                placeholder="example.myshopify.com"
                error={storeUrlError}
                helpText={'Store address can include "http://", "https://" or not'}
            />
            <div className={"mt-4"}>
                <Button primary onClick={onSubmit}>Submit</Button>
            </div>
        </div>

    )
}

export default AddStoreTest
