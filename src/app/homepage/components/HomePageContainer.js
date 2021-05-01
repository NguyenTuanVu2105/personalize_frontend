import React, {useContext, useEffect} from 'react'
import DocTitle from '../../shared/DocTitle'
import AppContext from '../../../AppContext'
import {getSessionStorage, SESSION_KEY, setSessionStorage} from '../../../services/storage/sessionStorage'
import Paths from '../../../routes/Paths'
import {Frame, Loading} from '@shopify/polaris'
import * as qs from 'query-string'
import {isInFrame} from '../../../services/util/windowUtil'
import {getShopIfyAuthUrl} from '../../shop-setting/helpers/getShopIfyAuthUrl'
import {verifyStoreAuth} from '../../../services/api/shops'
import {serializeObjectToQueryString} from "../../../services/api"
import {notification} from "antd"
import {STATUS_CODES} from "../../shop/constants/storeStatuses"
import {getReactEnv} from "../../../services/env/getEnv"
import {Redirect} from '@shopify/app-bridge/actions'
import {CONFIRM_INSTALLATION_EXPIRED} from "../../auth/constants/confirmInstallationExpired"
import {appBridgeRedirect} from "../../../services/app-bridge/redirect"

const clientUrl = getReactEnv("CLIENT_URL")

const HomePageContainer = (props) => {

    const {setUser} = useContext(AppContext)

    useEffect(() => {
        authRedirect()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const history = props.history

    const warningAccess = () => {
        window.location.href = Paths.ShopAccessWarning
    }

    const redirectToLogin = (path, queryParams) => {
        const queryString = serializeObjectToQueryString(queryParams)
        return history.push(`${path}/?${queryString}`)
    }

    const loginHandler = (authData, store) => {
        setUser({
            ...authData,
            userId: authData.user_id,
            shop: store
        })

        props.history.push(Paths.Dashboard)
    }

    const authRedirect = () => {
        let params = qs.parse(window.location.search)
        const hasShopParams = params && params.shop && params.hmac

        if (isInFrame()) {
            if (hasShopParams) {
                setSessionStorage(SESSION_KEY.SHOPIFY_PARAMS, params)
            } else {
                params = getSessionStorage(SESSION_KEY.SHOPIFY_PARAMS)
            }

            const reqData = {
                query_string: qs.stringify(params)
            }

            verifyStoreAuth(reqData).then((res) => {
                try {
                    if (res.success && res.data.success && res.data.code === STATUS_CODES.ACTIVE) {
                        const authData = res.data.data
                        setSessionStorage(SESSION_KEY.SHOP, res.data.store)
                        loginHandler(authData, res.data.store)

                    } else if (res.success && res.data.success && res.data.code === STATUS_CODES.UNAUTH) {
                        const confirmInstallationParams = res.data.params
                        const confirmInstallationTimestamp = parseInt(confirmInstallationParams.timestamp * 1000)
                        const currentTimestamp = Date.now()
                        const isExpired = currentTimestamp - confirmInstallationTimestamp > CONFIRM_INSTALLATION_EXPIRED
                        const oauthPath = getShopIfyAuthUrl(params.shop).split("admin")[1]
                        const confirmInstallationUrl = `${clientUrl}${Paths.ShopifyAuth}/?${qs.stringify(confirmInstallationParams)}`

                        return isExpired ? appBridgeRedirect(params.shop, Redirect.Action.ADMIN_PATH, oauthPath) : appBridgeRedirect(params.shop, Redirect.Action.REMOTE, confirmInstallationUrl)

                    } else {
                        notification.error({
                            message: "Invalid store",
                            description: "Please try again or contact our support team"
                        })
                    }

                } catch (e) {
                    warningAccess()
                }
            }).catch(e => redirectToLogin(Paths.Login))

        } else {
            if (hasShopParams) {
                // eslint-disable-next-line no-restricted-globals
                location.href = getShopIfyAuthUrl(params.shop)
            } else {
                history.push(Paths.Dashboard)
            }
        }
    }

    return (
        <Frame className="homepage-container">
            <DocTitle title="Homepage"/>
            <Loading/>
        </Frame>
    )
}

export default HomePageContainer
