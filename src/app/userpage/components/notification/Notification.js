import React, {useContext, useEffect, useState} from 'react'
import {Badge, Drawer, Dropdown} from 'antd'
import {faBell} from '@fortawesome/free-solid-svg-icons/faBell'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import NotificationList from './NotificationList'
import './Notification.scss'
import {WidthResponsiveNavBar} from "../../../../shared/resizeScrollTable"
import AppContext from "../../../../AppContext"

const Notification = ({dropdown = true, isLargeSize = true}) => {
    const {badge, setBadge} = useContext(AppContext)
    const [isOpenMenu, setIsOpenMenu] = useState(false)
    const [dropdownVisible, setDropdownVisible] = useState(false)

    const closeMenu = () => {
        setIsOpenMenu(false)
    }


    const openMenu = () => {
        setIsOpenMenu(true)
    }

    useEffect(() => {
        window.addEventListener('resize', () => {
            if (window.innerWidth > WidthResponsiveNavBar) {
                setIsOpenMenu(false)
            } else {
                setDropdownVisible(false)
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return dropdown ? (
        <Dropdown
            overlay={(<NotificationList badge={badge} setBadge={setBadge}
                                        closeNotificationBox={() => setDropdownVisible(false)}/>)}
            visible={dropdownVisible}
            trigger={["click"]}
            onVisibleChange={visible => {
                setDropdownVisible(visible)
            }}
            overlayClassName={"notification-box-dropdown"}
        >
            <div className="flex-center email-container">
                <Badge count={badge} dot={false} offset={[2, -3]}>
                    <div>
                        <FontAwesomeIcon icon={faBell}/>
                    </div>
                </Badge>
                <span className={"can-hide-first"}>Notifications</span>
            </div>
        </Dropdown>
    ) : (
        <div>
            <div className="flex-center email-container ml-4" onClick={openMenu}>
                <Badge count={badge} dot={false} offset={[2, -3]}>
                    <div>
                        <FontAwesomeIcon icon={faBell}/>
                    </div>
                </Badge>
                {isLargeSize && <span className={"can-hide-first"}/>}
            </div>
            <Drawer
                className={"side-bar-notification"}
                placement="right"
                closable={false}
                onClose={closeMenu}
                visible={isOpenMenu}
                drawerStyle={{
                    height: "100vh"
                }}
                bodyStyle={{
                    padding: 0,
                    margin: 0,
                    height: "100%"
                }}
                width={isLargeSize ? 450 : 300}
            >
                <NotificationList badge={badge} setBadge={setBadge} closeNotificationBox={closeMenu}/>
            </Drawer>
        </div>
    )
}

export default Notification
