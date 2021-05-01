import React, {useContext, useEffect, useState} from 'react'
import DocTitle from '../../shared/DocTitle'
import {logout, setUserCookiesWithStorage} from '../../../services/auth/auth'

import UserPageContext from '../context/UserPageContext'
import {isInFrame} from '../../../services/util/windowUtil'
import AppContext from '../../../AppContext'
import {renderRoutes} from 'react-router-config'
import ModalContext from "../../orders/context/ModalContext"
import Paths from "../../../routes/Paths"
import {LOCALSTORAGE_KEY, removeLocalStorage} from "../../../services/storage/localStorage"
import {getScrollTable} from "../../../shared/resizeScrollTable"
import {getUnreadMessageCount} from "../../../services/api/message"
import {deepCompareObject} from "../../../services/util/objectUtil"
import {getSessionStorage, SESSION_KEY} from "../../../services/storage/sessionStorage"
import {getReactEnv} from "../../../services/env/getEnv"
import {Provider, TitleBar} from '@shopify/app-bridge-react';
import {useHistory} from 'react-router-dom'
import SecurityOpenFullsiteWarningModal from "../../warning/SecurityOpenFullsiteWarningModal"

const DEFAULT_VIEW_WIDTH = 100

const UserPageContainer = (props) => {
    const {setBadge, user, instantPrompts, setInstantPrompts} = useContext(AppContext)
    const [breadcrumbNameMap, _setNameMap] = useState({})
    const [viewWidth, _setViewWidth] = useState(DEFAULT_VIEW_WIDTH)
    const [visibleCreateModal, _setVisibleCreateModal] = useState(false)
    const [visibleViewModal, _setVisibleViewModal] = useState(false)
    const [selectedOrders, _setSelectedOrders] = useState([])
    const [orderId, _setOrderId] = useState(null)
    const [fullsiteWarningVisible, setFullsiteWarningVisible] = useState(false)
    const [fullsiteButtonDisabled, setFullsiteButtonDisabled] = useState(false)
    const [scrollTable, _setScrollTable] = useState(getScrollTable())
    const [notification, _setNotification] = useState({
        data: [],
        hasMore: true,
        page: 1
    })
    // const [routerKeys, setRouterKeys] = useState([props.location.key])
    // const [backDisabled, setBackDisabled] = useState(true)
    // const [forwardDisabled, setForwardDisabled] = useState(true)

    const currentRoute = props.location.pathname
    const history = useHistory()

    // console.log(history)

    useEffect(() => {
        (props.location.pathname === Paths.NewProduct) || removeLocalStorage(LOCALSTORAGE_KEY.SELECTED_CATEGORY)
    }, [props.location])

    useEffect(() => {
        _fetchData()
        let notificationRefresh = setInterval(_fetchData, 60 * 1000)
        return () => {
            clearInterval(notificationRefresh)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        window.addEventListener("resize", setScrollTable)
    }, [])

    // useEffect(() => {
    //     const keys = routerKeys
    //     isInFrame() && history.listen((location) => {
    //         const {key} = location
    //         if (!keys.includes(key)) keys.push(key)
    //
    //         const keyIndex = keys.indexOf(key)
    //         if (keyIndex < keys.length - 1) setForwardDisabled(false)
    //         else setForwardDisabled(true)
    //
    //         if (keys.length > 1 && keyIndex > 0) setBackDisabled(false)
    //         else setBackDisabled(true)
    //         setRouterKeys(keys)
    //     })
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [])

    if (!user) {
        logout()
        return (<div/>)
    }

    const _fetchData = async () => {
        if (user) {
            let data = (await getUnreadMessageCount()).data
            setBadge(data.count)
            if (!deepCompareObject(instantPrompts, data.instant_prompts)) {
                setInstantPrompts(data.instant_prompts)
            }
        }
    }

    const setNameMap = (params) => _setNameMap(params)

    const setDefaultViewWidth = () => setViewWidth(DEFAULT_VIEW_WIDTH)

    const setViewWidth = (viewWidth) => {
        if (!isInFrame()) _setViewWidth(viewWidth)
        else _setViewWidth(100)
    }


    // function Modal Context
    const setVisibleCreateModal = (value) => _setVisibleCreateModal(value)

    const setVisibleViewModal = (value) => _setVisibleViewModal(value)

    const setSelectedOrders = (value) => _setSelectedOrders(value)

    const setOrderId = (value) => _setOrderId(value)

    const setNotification = (value) => _setNotification(value)

    const setScrollTable = () => _setScrollTable(getScrollTable())

    //end function Modal Context

    const shop = getSessionStorage(SESSION_KEY.SHOP)
    const config = {
        apiKey: getReactEnv("SHOPIFY_CLIENT_ID"),
        shopOrigin: shop ? shop.url : ''
    }

    const onOpenFullsite = () => {
        let localStorage
        const clientUrl = getReactEnv("CLIENT_URL")
        try {
            setFullsiteButtonDisabled(true)
            localStorage = window.self.localStorage
            setUserCookiesWithStorage(localStorage, user)
            setFullsiteButtonDisabled(false)
            return window.open(clientUrl)
        } catch (e) {
            setFullsiteWarningVisible(true)
            // history.push(Paths.SecurityOpenFullsiteWarning)
        }
    }

    const onClickCreateProduct = () => {
        history.push({
            pathname: Paths.NewProduct,
            deleteSession: true
        })
    }

    const userPageContent = () => (
        <div className={`userpage-container ${isInFrame() ? "in-frame" : ""}`}>
            <DocTitle title="User page"/>
            <UserPageContext.Provider value={{
                breadcrumbNameMap,
                setNameMap,
                viewWidth,
                scrollTable,
                notification,
                setViewWidth,
                setDefaultViewWidth,
                setNotification
            }}>
                <ModalContext.Provider value={{
                    visibleCreateModal,
                    visibleViewModal,
                    selectedOrders,
                    orderId,
                    setVisibleCreateModal,
                    setVisibleViewModal,
                    setSelectedOrders,
                    setOrderId
                }}>
                    <div id="hidden"/>
                    {renderRoutes(props.route.routes)}
                </ModalContext.Provider>
            </UserPageContext.Provider>
        </div>
    )

    const titleBarSecondaryActions = [
        {
            content: "Home",
            onAction: () => history.push(Paths.Dashboard),
        },
        // {
        //     content: 'Go back',
        //     onAction: () => history.goBack(),
        //     disabled: backDisabled
        // },
        // {
        //     content: 'Go forward',
        //     onAction: () => history.goForward(),
        //     disabled: forwardDisabled
        // },
        // {
        //     content: 'Products',
        //     onAction: () => history.push(Paths.ListProducts),
        // },
        // {
        //     content: 'Orders',
        //     onAction: () => history.push(Paths.Orders),
        // },
        // {
        //     content: 'Artworks',
        //     onAction: () => history.push(Paths.Artworks),
        // },
        // {
        //     content: 'Tickets',
        //     onAction: () => history.push(Paths.Tickets),
        // },
        {
            content: 'Open full website',
            onAction: onOpenFullsite,
            disabled: fullsiteButtonDisabled
        },
        {
            content: 'CREATE ORDER',
            onAction: () => history.push(Paths.NewOrder),
            disabled: currentRoute.includes(Paths.NewOrder)
        }
    ]

    return (isInFrame() && shop) ? (
        <Provider config={config}>
            <TitleBar
                // title="My App using up-to-date code"
                primaryAction={
                    {
                        content: 'CREATE PRODUCT',
                        onAction: onClickCreateProduct,
                        disabled: currentRoute.includes(Paths.NewProduct)
                    }
                }
                secondaryActions={titleBarSecondaryActions}
            />
            {userPageContent()}
            {fullsiteWarningVisible && <SecurityOpenFullsiteWarningModal fullsiteWarningVisible={fullsiteWarningVisible}
                                                                         setFullsiteWarningVisible={setFullsiteWarningVisible}/>}
        </Provider>
    ) : userPageContent()

}

export default UserPageContainer
