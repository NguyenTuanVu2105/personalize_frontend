import React, {useCallback, useContext, useEffect, useState} from 'react'
import DocTitle from '../../shared/DocTitle'
import ShopTable from './ShopTable'
import UserPageContext from '../../userpage/context/UserPageContext'
import Paths from '../../../routes/Paths'
import AddNewStoreModal from './AddNewStoreModal'
import './ShopManageContainer.scss'
import {DisplayText, TextContainer} from '@shopify/polaris'
import ShopManagerContext from './ShopManagerContext'

const ShopManageContainer = (props) => {

    const {setNameMap} = useContext(UserPageContext)
    const [storesContext, setStoresContext] = useState(null)
    const [renderTimes, setRenderTimes] = useState(0)
    const [updateTableFlag, setUpdateTableFlag] = useState(0)
    const [, updateState] = useState()
    const forceUpdate = useCallback(() => {
        updateState({})
        setUpdateTableFlag((updateTableFlag) => ++updateTableFlag)
    }, [])

    const setStateContext = (stores) => {
        setRenderTimes(renderTimes + 1)
        setStoresContext(stores)
    }

    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.ListShop()]: 'Stores'
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="product-management-container">
            <ShopManagerContext.Provider value={{
                storesContext,
                setStoresContext,
                setStateContext
            }}>
                <DocTitle title="Stores"/>
                <div style={{display: 'flex', justifyContent: 'space-between'}} className={'mb-3'}>
                    <TextContainer spacing="tight">
                        <DisplayText element="h3" size="large">Stores</DisplayText>
                        <p>
                            All your ecommerce store are listed below
                        </p>
                    </TextContainer>
                    <div className={'btn-heading'}>
                        <AddNewStoreModal displayInstantly={storesContext && renderTimes === 1 && storesContext.length === 0}
                                          callback={forceUpdate}/>
                    </div>
                </div>
                <div className="page-main-content">
                    <ShopTable updateTableFlag={updateTableFlag}/>
                </div>
            </ShopManagerContext.Provider>

        </div>
    )
}

export default ShopManageContainer

