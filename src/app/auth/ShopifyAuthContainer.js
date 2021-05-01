import * as qs from 'query-string'
import React, {useContext, useEffect, useRef, useState} from 'react'
import {shopifyAuthShop} from '../../services/api/auth'
import {Icon, Result} from 'antd'
import {useHistory, withRouter} from 'react-router-dom'
import Paths from '../../routes/Paths'
import {getShopIfyAuthUrl} from '../shop-setting/helpers/getShopIfyAuthUrl'
import {Avatar, Button, DisplayText, Heading} from "@shopify/polaris"
import Countdown from "react-countdown"
import AppContext from "../../AppContext"
import "./ShopifyAuthContainer.scss"
import {serializeObjectToQueryString} from "../../services/api"
import {INSTALL_RESPONSE_CODES} from "./constants/installResponses"
import {LOGIN_BANNER_CODE} from "./constants/loginBanner"
import {getReactEnv} from "../../services/env/getEnv"
import {getUser, retrieveUserAvatarUrl} from "../../services/auth/auth"
import logo from "../../assets/presentations/logo.png"
import shopify from '../../assets/images/shopify_logo_with_text.png'
import {faChevronRight, faExchangeAlt} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {SESSION_KEY, setSessionStorage} from "../../services/storage/sessionStorage"
import {getLocalStorage, LOCALSTORAGE_KEY} from "../../services/storage/localStorage"
import _ from 'lodash'
import {initUnAuthStore} from "../../services/api/shops"

const WAITING_TIME_TO_REDIRECT = 5000
const WAITING_TIME_TO_LOGIN_REDIRECT = 20000

const STORE_AUTH_RESULT_CODE = {
    SUCCESS: 1,
    PENDING: 2,
    ERROR: 3
}

const shopifyAPIKey = getReactEnv("SHOPIFY_CLIENT_ID")
const size = 5


const ShopifyAuthContainer = (props) => {
    const currentUser = getUser()
    const redirected = props.location && props.location.redirected
    const params = qs.parse(props.location.search)
    const isATab = window.menubar.visible

    const [status, setStatus] = useState(STORE_AUTH_RESULT_CODE.PENDING)
    const [responseCode, setResponseCode] = useState(null)
    const [ownerEmail, setOwnerEmail] = useState(null)
    const [displayAccount, setDisplayAccount] = useState((!!currentUser && !redirected))
    const [storeOwnersList, setStoreOwnersList] = useState([])

    const context = useContext(AppContext)
    const history = useHistory()
    const flag = useRef(0)

    // const appConfig = {
    //     apiKey: shopifyAPIKey,
    //     shopOrigin: params.shop ? params.shop : ''
    // }
    //
    // const app = createApp(appConfig)
    // const redirect = Redirect.create(app)

    useEffect(() => {
        if(flag.current === 0) {
            onInitStore()
            if (!displayAccount || !isATab) {
                authenticateStore()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props, displayAccount, isATab])

    const loginHandler = (authData) => {
        context.setUser({
            ...authData,
            userId: authData.user_id,
        })
    }

    const onInitStore = async () => {
        await initUnAuthStore(params)
        // console.log(success, data)
    }

    const authenticateStore = () => {
        flag.current += 1
        // TODO Separate screen when 401 and when error
        if (params.shop && params.code) {
            shopifyAuthShop({shop: params.shop, code: params.code, props}).then((res) => {
                if (res.data && res.data.success) {
                    setStatus(STORE_AUTH_RESULT_CODE.SUCCESS)
                    const responseData = res.data.data
                    setResponseCode(responseData.code)

                    if (responseData.code === INSTALL_RESPONSE_CODES.SUCCESS_NEW_ACCOUNT) {
                        loginHandler(responseData.auth_response)
                    }
                    else if (responseData.code === INSTALL_RESPONSE_CODES.ALL_STORE_INACTIVE) {
                        setDisplayAccount(true)
                        setStoreOwnersList(responseData.owners)
                    }

                    if (responseData.owner_email) setOwnerEmail(responseData.owner_email)
                } else {
                    setTimeout(() => {
                        setStatus(STORE_AUTH_RESULT_CODE.ERROR)
                    }, 3000)
                }
            }).catch(() => {
                setTimeout(() => {
                    setStatus(STORE_AUTH_RESULT_CODE.ERROR)
                }, 3000)
            })
        }
    }

    const CompletionistCloseWindow = () => <span>Closing...</span>

    const rendererCloseWindow = ({hours, minutes, seconds, completed}) => {
        if (completed) {
            window.close()
            return <CompletionistCloseWindow/>
        } else {
            return (
                <p>
                    This window will automatically close after <span
                    style={{color: "#50B83C"}}>{seconds}</span> {seconds > 1 ? 'seconds' : 'second'}
                </p>
            )
        }
    }

    const renderCloseWindowContent = () => {
        return <Countdown date={Date.now() + WAITING_TIME_TO_REDIRECT} renderer={rendererCloseWindow}/>
    }

    const rendererRedirectStoreExisted = ({hours, minutes, seconds, completed}) => {
        if (completed) {
            forceRedirect(Paths.Login, {email: ownerEmail, case: LOGIN_BANNER_CODE.AI_STORE_EXIST, store: params.shop})
            return <span>Redirecting...</span>
        } else {
            return (
                <div>
                    <p>
                        Your store was connected to PrintHolo successfully before, with
                        account <strong>{ownerEmail}</strong>. Please login to this account to manage your store's
                        products
                    </p>
                    <p className={"mt-2"}>
                        Redirect to login page after <span
                        style={{color: "#50B83C"}}>{seconds}</span> {seconds > 1 ? 'seconds' : 'second'}
                    </p>
                </div>
            )
        }
    }

    const rendererRedirectStoreEmailExisted = ({hours, minutes, seconds, completed}) => {
        if (completed) {
            forceRedirect(Paths.Login, {
                email: ownerEmail,
                case: LOGIN_BANNER_CODE.AI_STORE_EMAIL_EXIST,
                store: params.shop
            })
            return <span>Redirecting...</span>
        } else {
            return (
                <div>
                    <p>
                        It seems your store' email <strong>{ownerEmail}</strong> was used to register a PrintHolo
                        account before. Please login to this account to manage your store's products
                    </p>
                    <p className={"mt-2"}>
                        Redirect to login page after <span
                        style={{color: "#50B83C"}}>{seconds}</span> {seconds > 1 ? 'seconds' : 'second'}
                    </p>
                </div>
            )
        }
    }

    const redirectToIframeApp = () => {
        window.location.href = `https://${params.shop}/admin/apps/${shopifyAPIKey}`
        // redirect.dispatch(Redirect.Action.APP)
    }

    const rendererRedirectStoreSuccessInstallation = ({hours, minutes, seconds, completed}) => {
        if (completed) {
            redirectToIframeApp()
            return <span>Redirecting...</span>
        } else {
            return (
                <div>
                    <p>
                        Now you can create and sync products to this Shopify store.
                    </p>
                    <p className={"mt-2"}>
                        Redirect to store's dashboard page after <span
                        style={{color: "#50B83C"}}>{seconds}</span> {seconds > 1 ? 'seconds' : 'second'}
                    </p>
                </div>
            )
        }
    }

    const forceRedirect = (path, queryParams) => {
        const queryString = serializeObjectToQueryString(queryParams)
        return props.history.push(`${path}/?${queryString}`)
    }

    const renderInTabSubtitle = () => {
        switch (responseCode) {
            case INSTALL_RESPONSE_CODES.SUCCESS_NEW_ACCOUNT:
                return <Countdown date={Date.now() + WAITING_TIME_TO_LOGIN_REDIRECT}
                                  renderer={rendererRedirectStoreSuccessInstallation}/>

            case INSTALL_RESPONSE_CODES.SUCCESS:
                return <Countdown date={Date.now() + WAITING_TIME_TO_LOGIN_REDIRECT}
                                  renderer={rendererRedirectStoreSuccessInstallation}/>

            case INSTALL_RESPONSE_CODES.STORE_EXISTED:
                return <Countdown date={Date.now() + WAITING_TIME_TO_LOGIN_REDIRECT}
                                  renderer={rendererRedirectStoreExisted}/>

            case INSTALL_RESPONSE_CODES.STORE_EMAIL_EXISTED:
                return <Countdown date={Date.now() + WAITING_TIME_TO_LOGIN_REDIRECT}
                                  renderer={rendererRedirectStoreEmailExisted}/>

            default:
                return "Now you can create and sync products to this Shopify store"
        }
    }

    const renderInTabButton = () => {
        switch (responseCode) {
            case INSTALL_RESPONSE_CODES.SUCCESS_NEW_ACCOUNT:
                return <Button primary onClick={redirectToIframeApp}>Redirect now</Button>

            case INSTALL_RESPONSE_CODES.SUCCESS:
                return <Button primary onClick={redirectToIframeApp}>Redirect now</Button>

            case INSTALL_RESPONSE_CODES.STORE_EXISTED:
                return <Button primary onClick={() => forceRedirect(Paths.Login, {
                    email: ownerEmail,
                    case: LOGIN_BANNER_CODE.AI_STORE_EXIST,
                    store: params.shop
                })}>
                    Login now
                </Button>

            case INSTALL_RESPONSE_CODES.STORE_EMAIL_EXISTED:
                return <Button primary onClick={() => forceRedirect(Paths.Login, {
                    email: ownerEmail,
                    case: LOGIN_BANNER_CODE.AI_STORE_EMAIL_EXIST,
                    store: params.shop
                })}>
                    Login now
                </Button>

            default:
                return <Button primary onClick={() => props.history.push(Paths.NewProduct)}>Add products</Button>
        }
    }

    const renderAccountCard = (user, key, onClick, namePrefixed) => {
        return (
            <div className="row justify-content-center mt-3 account-card flex-center mx-0" key={key} onClick={onClick}>
                <div className="col-2 text-center avatar-container">
                    {/*<img src={retrieveUserAvatarUrl(user.avatar_url, user.name)} alt="Account Avatar"*/}
                    {/*className={'account-avatar'}/>*/}
                    <Avatar customer={false} size="medium"
                            source={retrieveUserAvatarUrl(user.avatar_url, user.name)}/>
                </div>
                <div className="col-8">
                    <Heading>
                        {user.name}&nbsp;
                        {namePrefixed ? `(${namePrefixed})` : ''}
                    </Heading>
                    <div>{user.email}</div>
                </div>
                <div className="col-2 text-center">
                    <FontAwesomeIcon className={"next-icon"} style={{fontSize: "18px"}}
                                     icon={faChevronRight}
                                     color={'#8e8e8e'}/>
                </div>
            </div>
        )
    }

    const renderLoggedAccounts = () => {
        const loggedAccounts = JSON.parse(getLocalStorage(LOCALSTORAGE_KEY.LOGGED_ACCOUNTS, "[]"))
        const index = _.findIndex(loggedAccounts, {email: currentUser.email})
        if (index >= 0) {
            loggedAccounts.splice(index, 1)
        }
        const renderer = loggedAccounts.map((account, index) => renderAccountCard(account, index, () => onClickRecentlyAccount(account.email)))
        return loggedAccounts.length > 0 ? renderer : <span/>
    }

    const renderConnectedAccounts = () => {
        const renderer = storeOwnersList.map((account, index) => renderAccountCard(account, index,
            () => onClickRecentlyAccount(account.email),
            account.store_active ? "current connected" : "")
        )
        return storeOwnersList.length > 0 ? renderer : <span/>
    }

    const onClickLogin = () => {
        setSessionStorage(SESSION_KEY.REDIRECT_URL, props.location.pathname + props.location.search)
        history.push(Paths.Login)
    }

    const onClickRegister = () => {
        setSessionStorage(SESSION_KEY.REDIRECT_URL, props.location.pathname + props.location.search)
        history.push(Paths.Register)
    }

    const onClickCurrentAccount = () => setDisplayAccount(false)

    const onClickRecentlyAccount = (email) => {
        setSessionStorage(SESSION_KEY.REDIRECT_URL, props.location.pathname + props.location.search)
        history.push({
            pathname: Paths.Login,
            search: `email=${email}`
        })
    }


    const renderAccountsSelector = () => {
        const accountsSection = responseCode === INSTALL_RESPONSE_CODES.ALL_STORE_INACTIVE ? (
            <div className={`col-${size} mt-4`}>
                {renderConnectedAccounts()}
            </div>
        ) : (
            <div className={`col-${size} mt-4`}>
                {renderAccountCard(currentUser, currentUser.user_id, onClickCurrentAccount, "logged in")}
                {renderLoggedAccounts()}
            </div>
        )
        return (
            <div>
                <div className="row justify-content-center" style={{marginTop: "4rem"}}>
                    <div className={`col-${size} text-center`}>
                        <DisplayText size="large">Choose account to connect</DisplayText>
                    </div>
                </div>
                <div className="row justify-content-center">
                    {accountsSection}
                </div>
                <div className="row justify-content-center">
                    <div className={`col-${size} text-center account-links`}>
                        <div className="row justify-content-center mx-0">
                            <div className={'account-link'} onClick={onClickLogin}>Connect to another PrintHolo
                                account
                            </div>
                        </div>
                        <div className="row justify-content-center mx-0 mt-4">
                            <div className={'account-link'} onClick={onClickRegister}>Register new PrintHolo account
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderLogoRow = (
        <div className="row justify-content-center">
            <div className={`col-${size} pt-5 text-center flex-center`}>
                <img src={logo} alt="PrintHolo Logo" height={'35px'}/>
                <FontAwesomeIcon className={"mx-5"} style={{fontSize: "24px"}}
                                 icon={faExchangeAlt}
                                 color={'#8e8e8e'}/>
                <img src={shopify} alt="Shopify Logo" height={'35px'}/>
            </div>
        </div>
    )

    const renderInTabResultByStatus = () => {
        switch (status) {
            case STORE_AUTH_RESULT_CODE.PENDING:
                return <Result
                    status="success"
                    title="Authenticating store"
                    subTitle="Authenticating can take up to one minute, please wait..."
                    icon={<Icon type="loading"/>}
                />
            case STORE_AUTH_RESULT_CODE.ERROR:
                return (
                    <div>
                        <Result
                            status="error"
                            title="Error on authenticating your store"
                            subTitle="An error has been occurred. Please uninstall app and install it again"
                        />
                        <div className="flex-center">
                            <Button primary onClick={() => props.history.push(Paths.ListShop())}>Back to store
                                list</Button>
                            &nbsp;
                            <Button primary
                                    onClick={() => window.location.href = getShopIfyAuthUrl(params.shop)}>Retry</Button>
                        </div>
                    </div>
                )
            case STORE_AUTH_RESULT_CODE.SUCCESS:
                return (
                    <div>
                        <Result
                            status="success"
                            title="Authenticating store successfully"
                            // subTitle="Now you can create and sync product with your Shopify store"
                            icon={<Icon type="check-circle"/>}
                        />
                        <div className="row justify-content-center">
                            <div className="col-12 text-center">
                                {renderInTabSubtitle()}
                            </div>
                            <div className="col-12 mt-4 text-center">
                                {renderInTabButton()}
                            </div>
                        </div>

                    </div>
                )
            default:
                return <Result
                    status="success"
                    title="Authenticating store"
                    subTitle="Authenticating can take up to one minute, please wait..."
                    icon={<Icon type="loading"/>}
                />
        }
    }

    const renderNewWindowResultByStatus = () => {
        switch (status) {
            case STORE_AUTH_RESULT_CODE.PENDING:
                return <Result
                    status="success"
                    title="Authenticating store"
                    subTitle="Authenticating can take up to one minute, please wait..."
                    icon={<Icon type="loading"/>}
                />
            case STORE_AUTH_RESULT_CODE.ERROR:
                return (
                    <div>
                        <Result
                            status="error"
                            title="Error on authenticating your store"
                            subTitle="An error has been occurred. Please uninstall app and install it again"
                        />
                        <div className="flex-center">
                            <Button primary
                                    onClick={() => window.location.href = getShopIfyAuthUrl(params.shop)}>Retry</Button>
                            &nbsp;
                            <Button primary onClick={() => window.close()}>Close window</Button>
                        </div>
                    </div>
                )
            case STORE_AUTH_RESULT_CODE.SUCCESS:
                return (
                    <div>
                        <Result
                            status="success"
                            title="Authenticating store successfully"
                            // subTitle="Now you can create and sync product with your Shopify store"
                            icon={<Icon type="check-circle"/>}
                        />
                        <div className="row justify-content-center">
                            <div className={'col-12 text-center'}>
                                {renderCloseWindowContent()}
                            </div>
                            <div className="col-12 text-center mt-4">
                                <Button primary onClick={() => window.close()}>Close now</Button>
                            </div>
                        </div>
                    </div>
                )
            default:
                return <Result
                    status="success"
                    title="Authenticating store"
                    subTitle="Authenticating can take up to one minute, please wait..."
                    icon={<Icon type="loading"/>}
                />
        }
    }

    return isATab ? (
        <div className="flex-center shopify-auth">
            <div className={'container account-selector'}>
                {renderLogoRow}
                {displayAccount && renderAccountsSelector()}
                {!displayAccount && (
                    <div className="row justify-content-center">
                        <div className={`col-${size} mt-4`}>
                            {renderInTabResultByStatus()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    ) : (
        <div className="flex-center shopify-auth">
            <div className={'container account-selector'}>
                {renderLogoRow}
                <div className="row justify-content-center">
                    <div className={`col-12 mt-4`}>
                        {renderNewWindowResultByStatus()}
                    </div>
                </div>
            </div>
        </div>
    )
}


export default withRouter(ShopifyAuthContainer)

