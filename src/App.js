import React, {useEffect, useState} from 'react'
import './scss/index.scss'
import AppContext from './AppContext'
import {renderRoutes} from 'react-router-config'
import {getUser, setUserCookies} from './services/auth/auth'
import LoadingScreen from './app/userpage/components/LoadingScreen'
import enTranslations from '@shopify/polaris/locales/en.json'
import {AppProvider} from '@shopify/polaris'
import {I18nContext, I18nManager} from '@shopify/react-i18n'
import logo from './assets/presentations/logo.png'
import {hotjar} from 'react-hotjar'
import {getReactEnv} from "./services/env/getEnv"
import {getLocalStorage, setLocalStorage} from "./services/storage/localStorage"
import {updateUserMessage} from "./services/api/userProfile"
import {COOKIE_KEY} from "./services/storage/sessionStorage"
import {getActiveEvent} from "./services/api/banner"
import {getUnreadMessageCount} from "./services/api/message"

const locale = 'en'
const i18nManager = new I18nManager({
    locale,
    onError(error) {
    },
})

const CLOSE_BANNER_TIME_DELAY = 24 * 60 * 60 * 1000
// const clientId = getReactEnv('SHOPIFY_CLIENT_ID')

const App = ({route}) => {
    const userCookies = getUser()

    const [user, setUser] = useState({
        token: userCookies ? userCookies.token : null,
        email: userCookies ? userCookies.email : null,
        name: userCookies ? userCookies.name : null,
        userId: userCookies ? userCookies.userId : null,
        timezone: userCookies ? userCookies.timezone : null,
        avatar_url: userCookies ? userCookies.avatar_url : null,
        message_id: userCookies ? userCookies.message_id : null,
        shop: userCookies ? userCookies.shop : null,
    })


    const [loading, setLoading] = useState(false)
    const [reloadTrigger, setReloadTrigger] = useState({})
    const [instantPrompts, setInstantPrompts] = useState([])
    const [hasBanner, setHasBanner] = useState(false)
    const [hasContextual, setHasContextual] = useState(false)
    const [bannerContent, setBannerContent] = useState([])

    useEffect(() => {
        const lastCloseBannerTime = parseInt(getLocalStorage("LAST_CLOSE_BANNER"))
        const currentTime = Date.now()
        if (!(currentTime - lastCloseBannerTime > CLOSE_BANNER_TIME_DELAY)) {
            setHasBanner(false)
        }
    }, [])
    const triggerReloadPage = () => {
        setReloadTrigger({})
    }

    const closeBanner = () => {
        setLocalStorage("LAST_CLOSE_BANNER", Date.now())
        setHasBanner(false)
    }


    const myTranslations = {...enTranslations}
    // myTranslations.Polaris.ContextualSaveBar = {
    //     'save': "Save",
    //     'discard': "Discard"
    // }

    useEffect(() => {
        const hjid = getReactEnv('HOTJAR_SITE_ID')
        const hjsv = getReactEnv('HOTJAR_SERVER')
        hotjar.initialize(hjid, hjsv)
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        const response = await getActiveEvent()
        if (response.success) {
            setBannerContent(response.data)
            if (response.data.length <= 0) {
                setHasBanner(false)
            } else {
                setHasBanner(true)
            }

        }
    }

    const updateRestoreId = async (message_id) => {
        const {success, data} = await updateUserMessage(message_id)
        if (success) {
            if (data.success) {
                setLocalStorage(COOKIE_KEY.FRESH_CHAT_ID, data.message_id)
            }
        }
    }

    const changeUser = (state) => {
        // alert("USER CHANGED")
        setUser((user) => {
            setUserCookies(state)
            initiateCall(state)
            return {...user, ...state}
        })
    }

    const [badge, setBadge] = useState(0)

    const initFreshChat = (user) => {
        // console.log("user", user)
        // alert(user.message_id)
        window.fcWidget.init({
            token: getReactEnv("FRESHCHAT_TOKEN"),
            host: getReactEnv("FRESHCHAT_HOST"),
            externalId: user.email,
            restoreId: user.message_id && user.message_id !== "null" ? user.message_id : null
        })
        window.fcWidget.user.setFirstName(`${user.name} - ID: ${user.userId}`)
        window.fcWidget.user.setLastName("")
        window.fcWidget.user.setEmail(user.email)

        window.fcWidget.user.get(function (resp) {
            var status = resp && resp.status,
                data = resp && resp.data
            //console.log("data", resp)
            if (status !== 200) {
                window.fcWidget.user.setProperties({
                    email: user.email,
                    firstName: user.name,
                    lastName: ""
                })
                window.fcWidget.on('user:created', function (resp) {
                    // console.log("USER CREATED")
                    var status = resp && resp.status,
                        data = resp && resp.data
                    // console.log("user:created", resp)
                    if (status === 200) {
                        if (data.restoreId) {
                            const message_id = data.restoreId
                            updateRestoreId(message_id)
                        }
                    }
                })
            } else {
                if (data.restoreId) {
                    const message_id = data.restoreId
                    updateRestoreId(message_id)
                }
            }
        })
    }

    const initialize = (i, t, u) => {
        let e
        return i.getElementById(t) ? initFreshChat(u) : ((e = i.createElement("script")).id = t, e.async = !0, e.src = "https://wchat.eu.freshchat.com/js/widget.js", e.onload = () => initFreshChat(u), i.head.appendChild(e))
    }

    const initiateCall = (user) => {
        initialize(document, "freshchat-js-sdk", user)
    }

    const initFreshChatEvent = () => {
        if (user.name) {
            window.addEventListener ? window.addEventListener("load", () => initiateCall(user), !1) : window.attachEvent("load", () => initiateCall(user), !1)
            return () => {
                window.removeEventListener('load', initiateCall)
            }
        }
    }

    useEffect(() => {
        initFreshChatEvent()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, user.email])

    const reloadUnreadInstantPrompt = async () => {
        let data = (await getUnreadMessageCount()).data
        const {instant_prompts} = data
        setInstantPrompts(instant_prompts)
    }

    return (
        <AppContext.Provider value={{
            user,
            setUser: changeUser,
            loading,
            setLoading,
            instantPrompts,
            setInstantPrompts,
            reloadUnreadInstantPrompt,
            badge,
            setBadge,
            reloadTrigger,
            triggerReloadPage,
            hasBanner,
            closeBanner,
            hasContextual,
            setHasContextual,
            bannerContent
        }}>
            <I18nContext.Provider value={i18nManager}>
                <AppProvider
                    theme={{
                        logo: {
                            width: 160,
                            contextualSaveBarSource: logo,
                            // url: Paths.Dashboard
                        },
                    }}
                    i18n={{...myTranslations}}
                >
                    {/*{user.shop ?*/}
                    {/*    (<Provider config={{*/}
                    {/*        apiKey: clientId,*/}
                    {/*        shopOrigin: user.shop.url,*/}
                    {/*        forceRedirect: true*/}
                    {/*    }}>*/}
                    {/*        <div className="App">*/}
                    {/*            {renderRoutes(route.routes)}*/}
                    {/*        </div>*/}
                    {/*    </Provider>)*/}
                    {/*    :*/}
                    <div className="App">
                        {renderRoutes(route.routes)}
                    </div>

                    {loading && <LoadingScreen/>}


                </AppProvider>
            </I18nContext.Provider>

        </AppContext.Provider>
    )
}

export default App
