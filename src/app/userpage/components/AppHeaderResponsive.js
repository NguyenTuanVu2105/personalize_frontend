import React, {useCallback, useContext, useEffect, useState} from 'react'
import {Badge, Drawer, Layout, Menu, Popover as AntPopover, Typography} from 'antd'
import {Link, withRouter} from 'react-router-dom'
import AppContext from '../../../AppContext'
import {routingMain, routingUser, LOGOUT} from '../../../shared/routing'
import Notification from './notification/Notification'
import {isInFrame} from '../../../services/util/windowUtil'
import {Avatar} from '@shopify/polaris'
import {COOKIE_KEY} from '../../../services/storage/sessionStorage'
import {DEFAULT_TIMEZONE} from '../../user-settings/constants/timezones'
import moment from 'moment-timezone'
import logoShort from '../../../assets/presentations/logo-short.png'
import logo from '../../../assets/presentations/logo.png'
import {getLocalStorage} from '../../../services/storage/localStorage'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faBars, faChevronDown} from "@fortawesome/free-solid-svg-icons"
import {WidthResponsiveNavBar} from "../../../shared/resizeScrollTable"
import {logout, retrieveUserAvatarUrl} from "../../../services/auth/auth"
import Paths from "../../../routes/Paths"

const {Header} = Layout
const {Text, Paragraph} = Typography

const userRoutes = []

routingUser.forEach(group => {
    group.forEach(route => {
        if (route.path != null) {
            userRoutes.push(route)
        }
    })
})

const AppHeaderResponsive = function (props) {
    const {user, instantPrompts} = useContext(AppContext)
    const userName = user.name || user.email || 'Profile'
    const avatar_url = retrieveUserAvatarUrl(getLocalStorage(COOKIE_KEY.AVATAR_URL), userName)
    const timezone = getLocalStorage(COOKIE_KEY.TIMEZONE, DEFAULT_TIMEZONE)
    const currentRoute = props.location.pathname
    const totalRoutes = [...routingMain, ...userRoutes]

    const findMenu = totalRoutes.find((item) => {
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
    const [isOpenMenu, setIsOpenMenu] = useState(false)
    const [selectUserAction, setSelectUserAction] = useState(userRoutes.find(route => route.name === defaultMenu) != null)


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


    const getCurrentTime = () => {
        setCurrentTime(moment().tz(timezone).format('hh:mm A DD/MM/YY [(GMT]Z[)]'))
    }

    const getTicketStatus = () => {
        if (instantPrompts.find(value => value === "ticket_unread")) {
            return true
        } else {
            return false
        }
    }

    useEffect(() => {
        setUnreadTicket(getTicketStatus())
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instantPrompts])


    useEffect(() => {
        closeMenu()
        window.addEventListener('resize', () => {
            if (window.innerWidth > WidthResponsiveNavBar) {
                closeMenu()
            }
        })
    }, [])

    useEffect(() => {
        setSelectUserAction(userRoutes.find(route => route.name === defaultMenu) != null)
    }, [defaultMenu])


    const closeMenu = () => {
        setIsOpenMenu(false)
    }

    const openMenu = () => {
        setIsOpenMenu(true)
    }

    const renderMenuItem = (route) => {
        if (route.children) {
            return (
                <Menu.SubMenu
                    key={route.name}
                    title={(
                        <div>
                            <FontAwesomeIcon
                                className="header-icon"
                                icon={route.icon}
                            />
                            <span>{route.title}</span>
                        </div>
                    )}
                >
                    {
                        route.children.map(child => {
                            return renderMenuItem(child)
                        })
                    }
                </Menu.SubMenu>
            )
        } else {
            return (
                <Menu.Item key={route.name}>
                    <Link to={Array.isArray(route.path) ? route.path[0] : route.path}
                          className={"link-header-responsive"}
                          style={{
                              color: defaultMenu === route.name ? '#5c6ac4' : '#454F5B',
                              fontWeight: defaultMenu === route.name ? '600' : '500',
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
                                            <FontAwesomeIcon
                                                icon={route.icon}
                                                style={{
                                                    marginRight: "5px",
                                                    width: 30
                                                }}
                                            />
                                            <span>{route.title}</span>
                                        </AntPopover>
                                    </Badge>
                                )
                                : (
                                    <div>
                                        <FontAwesomeIcon
                                            className="header-icon"
                                            icon={route.icon}
                                        />
                                        <span>{route.title}</span>
                                    </div>
                                )
                        }
                    </Link>
                </Menu.Item>
            )
        }
    }


    return (
        <Header className={`app-header-responsive ${props.hidden ? 'd-none' : ''}`}
                style={{padding: '0 30px'}}>
            <div className="flex-center email-container" onClick={openMenu}>
                <FontAwesomeIcon icon={faBars}/>
            </div>
            <Drawer
                title={(
                    <div className="flex-center">
                        <Link to={Paths.Dashboard}>
                            <img alt="" src={logo} height="25"/>
                        </Link>
                    </div>
                )}
                className="side-bar-menu"
                width={300}
                placement="left"
                closable={false}
                onClose={closeMenu}
                visible={isOpenMenu}
                bodyStyle={{
                    margin: 0,
                    padding: 0,
                }}
            >
                <div
                    className={`link-header-responsive flex-horizontal user-menu-description ${popoverActive === true ? "user-menu-open" : ""} ${selectUserAction === true ? "user-menu-selected" : ""}`}
                    style={{
                        padding: "0 24px",
                        height: "60px",
                        textTransform: "unset",
                        fontWeight: 600,
                        cursor: "context-menu",
                    }}
                    onClick={togglePopoverActive}
                >
                    <div className="flex-horizontal">
                        <div className={'avatar-header mr-3'}>
                            <Avatar customer={false} size="small"
                                    source={avatar_url}/>
                        </div>
                        <div style={{width: "80%"}}>
                            <Typography.Paragraph className="text-description" style={{marginBottom: 0}}
                                                  ellipsis={true}>
                                {userName}
                            </Typography.Paragraph>
                        </div>
                    </div>
                    <div className={popoverActive ? "user-active" : ""}>
                        <FontAwesomeIcon icon={faChevronDown} className="icon-menu-open"/>
                    </div>
                </div>
                <div
                    className={"flex-column user-menu border-bottom menu-border-top " + (popoverActive === true ? "user-menu-open" : "user-menu-close")}
                >
                    <div
                        className="link-header-responsive flex-column"
                        style={{
                            padding: "5px 24px",
                            textTransform: "unset",
                            cursor: "context-menu"
                        }}
                    >
                        <Paragraph ellipsis={true} style={{marginBottom: 0}}><Text
                            strong={true}>{getLocalStorage(COOKIE_KEY.EMAIL)}</Text></Paragraph>
                        <p style={{fontSize: '1.2rem'}}>{currentTime}</p>
                    </div>
                    <Menu
                        mode="inline"
                        className="user-sub-menu"
                        defaultSelectedKeys={defaultMenu}
                        inlineCollapsed={false}
                        selectedKeys={selectUserAction === true ? defaultMenu : null}
                    >
                        {
                            routingUser.map((group, index) => {
                                return group.map(route => {
                                    if (route.path) {
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
                                    } else {
                                        return <Menu.Divider/>
                                    }

                                })
                            })
                        }
                    </Menu>
                </div>
                <Menu
                    mode="inline"
                    className=""
                    defaultSelectedKeys={defaultMenu}
                    inlineCollapsed={false}
                    selectedKeys={selectUserAction === true ? null : defaultMenu}
                >
                    {
                        routingMain.map((route) => {
                            return renderMenuItem(route)
                        })
                    }
                </Menu>
            </Drawer>
            <div className="flex-start flex-horizontal ">
                <div className="flex-start">
                    {!isInFrame() && (
                        <Link to={Paths.Dashboard}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <img alt="" src={logoShort} height="25"/>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
            <div className={'flex-horizontal justify-content-end'}>
                <Notification dropdown={false} isLargeSize={false}/>
            </div>
        </Header>

    )
}

export default withRouter(AppHeaderResponsive)
