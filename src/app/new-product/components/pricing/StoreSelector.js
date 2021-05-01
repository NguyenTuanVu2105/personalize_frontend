import {Checkbox} from 'antd'
import React, {useContext, useEffect, useState} from 'react'
import NewProductContext from '../../context/NewProductContext'
import {Caption, DisplayText, TextContainer, TextStyle} from '@shopify/polaris'
import {getLocalStorage, LOCALSTORAGE_KEY, setLocalStorage} from "../../../../services/storage/localStorage"
import AppContext from "../../../../AppContext"
import AddNewStoreModal from "../../../shop/components/AddNewStoreModal"
import {isInFrame} from "../../../../services/util/windowUtil"

const StoreSelector = ({refreshStoresAndPricing}) => {
    const {product, setProduct, stores} = useContext(NewProductContext)
    const {user} = useContext(AppContext)
    const [selectedStores, setSelectedStores] = useState([])
    const currentStore = user.shop ? stores.find(shop => shop.url === user.shop.url) : null
    const defaultChoice = currentStore ? [currentStore.id.toString()] : []

    useEffect(() => {
        const unParsedCachedSelectedStores = getLocalStorage(LOCALSTORAGE_KEY.SELECTED_STORE)
        const cachedSelectedStores = JSON.parse(unParsedCachedSelectedStores)
        // const selectedShopMem = selectedShopString && selectedShopString.length > 0 ? selectedShopString.split(",") : stores ? stores.map(store => '' + store.id) : []

        //if user.shop defined, the store[0] is the current shop in polaris
        let selectedStores = []
        if (cachedSelectedStores && cachedSelectedStores.length > 0) {
            // console.log("selectedStoreString", selectedStoreString)
            selectedStores = cachedSelectedStores
            if (currentStore) {
                if (selectedStores.every(shop => shop !== currentStore.id.toString())) {
                    selectedStores.push(currentStore.id.toString())
                }
            }
        } else {
            selectedStores = defaultChoice
        }
        updateStores(selectedStores)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const rowSelection = (storeIds) => updateStores(storeIds)

    const updateStores = (storeIds) => {
        setLocalStorage(LOCALSTORAGE_KEY.SELECTED_STORE, JSON.stringify(storeIds))
        setSelectedStores(storeIds)
        const tempProduct = product
        tempProduct.shops = storeIds
        setProduct(tempProduct)
    }

    const selectAll = () => {
        const storeIds = stores ? stores.map(store => '' + store.id) : []
        updateStores(storeIds)
    }

    if (!stores || !product || !product.shops) return <div/>


    const onSelectAll = () => {
        if (selectedStores.length === stores.length) {
            updateStores(defaultChoice)
        } else {
            selectAll()
        }
    }

    // console.log("selectedStores", selectedStores.length)
    // console.log("selectedStores", selectedStores)
    // console.log("stores", stores.length)

    return (
        <div className="p1em">
            <div className="flex-space-between">
                <DisplayText size="small" element="h6">
                    Stores to publish
                </DisplayText>
                {
                    !isInFrame() &&
                    <AddNewStoreModal buttonType={'plain'} callback={refreshStoresAndPricing}/>
                }
            </div>
            {
                stores.length === 0 && <div className={"mt-3"}>
                    <TextContainer>No store available</TextContainer>
                </div>
            }
            {
                stores.length > 0 &&
                <div>
                    <div className={'mt-3'}>
                        <Checkbox onChange={onSelectAll} checked={selectedStores.length === stores.length}>
                            Select all
                        </Checkbox>
                    </div>
                    <hr/>
                    <div id="shopList">
                        <Checkbox.Group value={selectedStores} onChange={rowSelection} style={{width: '100%'}}>
                            {stores.map((shop) => {
                                return (
                                    <div className="row no-gutters flex-middle" key={shop.id}>
                                        <Checkbox
                                            value={'' + shop.id}
                                            disabled={currentStore ? currentStore === shop : false}
                                            style={{
                                                width: '100%',
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <div style={{padding: "10px 0"}}>
                                                <TextStyle variation="strong">{shop.url}</TextStyle>
                                                <span className="row no-gutters flex-middle">
                                            <Caption>{shop.ecommerce.name}
                                                &nbsp; - &nbsp;
                                                <span>{shop.currency}</span>
                                            </Caption>
                                        </span>
                                            </div>
                                        </Checkbox>
                                    </div>
                                )
                            })}
                        </Checkbox.Group>
                    </div>
                </div>
            }

        </div>


    )
}

export default StoreSelector
