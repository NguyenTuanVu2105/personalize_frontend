import React, {useCallback, useContext, useEffect, useState} from 'react'
import {Badge, Menu, Layout, Popover as AntPopover, Typography, Tooltip} from 'antd'
import {Link, useHistory, withRouter} from 'react-router-dom'
import AppContext from '../../../AppContext'
import './Header.scss'
import {logout, retrieveUserAvatarUrl} from '../../../services/auth/auth'
import {LOGOUT, routingMain, routingUser} from '../../../shared/routing'
import Notification from './notification/Notification'
import {isInFrame} from '../../../services/util/windowUtil'
import {ActionList, Avatar, Popover, Stack} from '@shopify/polaris'
import {COOKIE_KEY} from '../../../services/storage/sessionStorage'
import {DEFAULT_TIMEZONE} from '../../user-settings/constants/timezones'
import moment from "moment-timezone"
import logo from "../../../assets/presentations/logo.png"
import {getLocalStorage} from '../../../services/storage/localStorage'
import {WidthResponsiveNavBar} from "../../../shared/resizeScrollTable"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faChevronDown} from "@fortawesome/free-solid-svg-icons"

const {Header} = Layout


const AppHeader = function (props) {
    const {user, instantPrompts} = useContext(AppContext)

    const userName = user.name || user.email || 'Profile'
    const avatar_url = retrieveUserAvatarUrl(getLocalStorage(COOKIE_KEY.AVATAR_URL), userName)
    const timezone = getLocalStorage(COOKIE_KEY.TIMEZONE, DEFAULT_TIMEZONE)
    const history = useHistory()
    const currentRoute = props.location.pathname

    const [routes, setRoutes] = useState(routingMain.map(route => {
        return {...route}
    }))

    const findMenu = routes.find((item) => {
        if (item.children) {
            return item.children.find(child => currentRoute.includes(child.path))
        } else {
            return currentRoute.includes(item.path)
        }
    })

    const currentMenu = (findMenu && findMenu.children) ? findMenu.children.find(child => currentRoute.includes(child.path)) : findMenu

    const defaultMenu = (currentMenu) ? currentMenu.name : ''

    const [popoverActive, setPopoverActive] = useState(false)
    const [currentTime, setCurrentTime] = useState('')
    const [unreadTicket, setUnreadTicket] = useState(false)

    const togglePopoverActive = useCallback(
        () => setPopoverActive((popoverActive) => !popoverActive),
        [],
    )

    useEffect(() => {
        getCurrentTime()
        const interval = setInterval(() => {
            getCurrentTime()
        }, 60 * 1000)
        return () => {
            clearInterval(interval)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timezone])

    useEffect(() => {
        createMenuRoute()
        window.addEventListener("resize", () => {
            if (window.innerWidth <= WidthResponsiveNavBar) {
                setPopoverActive(false)
            }
            createMenuRoute()
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onMainMenuClick = (path) => {
        togglePopoverActive()
        history.push(path)
    }

    const getCurrentTime = () => {
        // console.log(timezone)
        setCurrentTime(moment().tz(timezone).format('hh:mm A DD/MM/YY [(GMT]Z[)]'))
    }


    const activatorRender = (user) => (
        <div onClick={togglePopoverActive}>
            <Stack>
                <Stack.Item>
                    <div className={'mt-4 avatar-header'}>
                        <Avatar customer={false} size="small"
                                source={avatar_url}/>
                    </div>
                </Stack.Item>
                <Stack.Item>
                    <Tooltip title={userName} overlayClassName={popoverActive ? "d-none" : ""}>
                        <Typography.Paragraph style={{marginBottom: 0}} ellipsis={true} className="can-hide-second">
                            <Typography.Text>
                                {userName}
                            </Typography.Text>
                        </Typography.Paragraph>
                    </Tooltip>
                </Stack.Item>
                <Stack.Item>
                    <div className={`ml-2 ${popoverActive ? "user-active" : ""}`}>
                        <FontAwesomeIcon icon={faChevronDown} className="icon-menu-open"/>
                    </div>
                </Stack.Item>
            </Stack>
        </div>
    )

    const getTicketStatus = () => {
        return !!instantPrompts.find(value => value === "ticket_unread");
    }

    useEffect(() => {
        setUnreadTicket(getTicketStatus())
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instantPrompts])


    const createMenuRoute = () => {
        const header = document.getElementById("app-header")
        if (header) {
            const end = document.getElementById("app-header-end")
            //LOGO 185 px
            const logoWidth = !isInFrame() ? 185 : 0
            const maxWidth = header.offsetWidth - parseInt(header.style.paddingLeft) - parseInt(header.style.paddingRight) - end.offsetWidth - logoWidth
            if (maxWidth > 0) {
                const hidden = document.getElementById("app-header-hidden")
                hidden.innerHTML = ""
                const size = routingMain.length
                let i
                let currentWidth = 0
                let overWidth = false
                for (i = 0; i < size; i++) {
                    hidden.appendChild(createMenuItemHidden(routingMain[i].title))
                    currentWidth = hidden.offsetWidth
                    if (currentWidth > maxWidth) {
                        overWidth = true
                        break
                    }
                }
                if (overWidth) {
                    let hasMore = false
                    do {
                        if (hasMore) {
                            hidden.removeChild(hidden.lastElementChild)
                        }
                        hasMore = true
                        hidden.removeChild(hidden.lastElementChild)
                        i--
                        hidden.appendChild(createMenuMoreHidden())
                        currentWidth = hidden.offsetWidth
                    } while (currentWidth > maxWidth)
                }
                const result = []
                for (let j = 0; j <= i && j < routingMain.length; j++) {
                    result.push(routingMain[j])
                }

                if (i < routingMain.length - 2) {
                    const more = {
                        path: "#",
                        title: 'More',
                        name: 'more',
                        children: []
                    }

                    for (let j = i + 1; j <= routingMain.length - 1; j++) {
                        more.children.push(routingMain[j])
                    }

                    result.push(more)
                }
                setRoutes(result)
                hidden.innerHTML = ''
            }
        }
    }
    const createMenuMoreHidden = () => {
        const a = document.createElement("A")
        a.className = "mr-4 header-menu-item"
        a.style.fontSize = '14px'
        a.style.textTransform = 'uppercase'
        a.style.fontWeight = '600'
        const span = document.createElement("span")
        span.innerText = "More"
        a.appendChild(span)
        const icon = document.createElement("span")
        icon.style.paddingLeft = "20px"
        a.appendChild(icon)
        return a
    }


    const createMenuItemHidden = (title) => {
        const a = document.createElement("A")
        a.className = "mr-4 header-menu-item"
        a.style.fontSize = '14px'
        a.style.textTransform = 'uppercase'
        a.style.fontWeight = '600'
        const span = document.createElement("span")
        span.innerText = title
        a.appendChild(span)
        return a
    }

    const generateSubMenu = (routes) => {
        return (
            <span>
                <FontAwesomeIcon className="ml-2 icon-menu-open" icon={faChevronDown}/>
                <Menu
                    className="header-menu-hidden"
                    selectedKeys={(findMenu && findMenu.name === routes.name) ? defaultMenu : null}
                >
                    {
                        routes.children.map(route => {
                            return (
                                <Menu.Item key={route.name}>
                                    <Link
                                        to={Array.isArray(route.path) ? route.path[0] : (route.name === LOGOUT ? "#" : route.path)}
                                        className={"link-header-responsive"}
                                        style={{
                                            color: defaultMenu === route.name ? '#5c6ac4' : '#454F5B',
                                            fontWeight: defaultMenu === route.name ? '600' : '500',
                                            fontSize: route.name === LOGOUT ? 12 : null
                                        }}
                                        onClick={route.name === LOGOUT ? logout : null}
                                    >
                                        <div>
                                            <FontAwesomeIcon
                                                className="header-icon"
                                                icon={route.icon}
                                            />
                                            <span>{route.title}</span>
                                        </div>
                                    </Link>
                                </Menu.Item>
                            )
                        })
                    }
                </Menu>
            </span>
        )
    }

    return (
        <Header id="app-header"
                className={`app-header ${props.hidden ? 'd-none' : ''}`}
                style={{padding: '0 30px', zIndex: 99}}>
            <div id="app-header-hidden" style={{position: "absolute", marginLeft: 185, opacity: 0}}/>
            <div className="flex-start">
                <div className="flex-start">
                    {!isInFrame() && (
                        <Link to='/'>
                            <div style={{display: 'flex', alignItems: 'center', marginRight: 15}}>
                                <img alt="" src={logo} height="30" className={'m-r-10'}/>
                            </div>
                        </Link>
                    )}
                    {
                        routes.map((route) => {
                            if (route.children) {
                                return (
                                    <div
                                        key={route.name}
                                        className="mr-4 d-flex header-menu-item"
                                        style={{
                                            color: (findMenu && findMenu.name === route.name) ? '#5c6ac4' : '#454F5B',
                                            fontSize: '14px',
                                            textTransform: 'uppercase',
                                            fontWeight: defaultMenu === route.name ? '600' : '500'
                                        }}>
                                        <span>{route.title}</span>
                                        {
                                            generateSubMenu(route)
                                        }
                                    </div>
                                )
                            } else {
                                return (
                                    <Link to={Array.isArray(route.path) ? route.path[0] : route.path}
                                          key={route.name}
                                          className="mr-4 header-menu-item"
                                          style={{
                                              color: defaultMenu === route.name ? '#5c6ac4' : '#454F5B',
                                              fontSize: '14px',
                                              textTransform: 'uppercase',
                                              fontWeight: defaultMenu === route.name ? '600' : '500'
                                          }}>
                                        {
                                            (route.title === "tickets" && unreadTicket === true)
                                                ? (
                                                    <Badge dot={true} offset={[5, 0]}>
                                                        <AntPopover
                                                            content={(
                                                                <b>You have unread Ticket</b>
                                                            )}
                                                        >
                                                            <span>{route.title}</span>
                                                        </AntPopover>
                                                    </Badge>
                                                )
                                                : (<span>{route.title}</span>)
                                        }
                                    </Link>
                                )
                            }
                        })
                    }
                </div>
            </div>
            <div id="app-header-end" className="flex-horizontal flex-shrink-0 justify-content-end">
                <Notification dropdown={false} isLargeSize={true}/>
                <AppContext.Consumer>
                    {(context) => {
                        return (
                            <div className="ml-4 user-dropdown">
                                <Popover
                                    active={popoverActive}
                                    activator={activatorRender(context.user)}
                                    onClose={togglePopoverActive}
                                    ariaHaspopup={false}
                                    sectioned
                                    fullHeight
                                >
                                    <Popover.Pane fixed>
                                        <Popover.Section>
                                            {/*<p>Current timezone</p>*/}
                                            <p><strong>{getLocalStorage(COOKIE_KEY.EMAIL)}</strong></p>
                                            <p style={{fontSize: '1.2rem'}}>{currentTime}</p>
                                        </Popover.Section>
                                    </Popover.Pane>
                                    {
                                        routingUser.map((group, index) => {
                                            const menu = []
                                            group.forEach(route => {
                                                if (route.path) {
                                                    const content = (
                                                        <div>
                                                            <FontAwesomeIcon className="header-icon" icon={route.icon}/>
                                                            {route.title}
                                                        </div>
                                                    )
                                                    const onAction = (
                                                        route.path === LOGOUT
                                                            ? () => logout()
                                                            : () => onMainMenuClick(route.path)
                                                    )

                                                    menu.push({
                                                        content,
                                                        onAction
                                                    })
                                                }
                                            })
                                            return (
                                                <Popover.Pane key={index} fixed>
                                                    <ActionList
                                                        items={menu}
                                                    />
                                                </Popover.Pane>
                                            )
                                        })
                                    }
                                </Popover>
                            </div>

                        )
                    }}
                </AppContext.Consumer>
            </div>
        </Header>

    )
}

export default withRouter(AppHeader)
