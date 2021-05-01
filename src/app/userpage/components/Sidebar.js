import React, {useState} from 'react'
import {Icon, Layout, Menu} from 'antd'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import routing from '../../../shared/routing/'
import './SideBar.scss'

const {Sider} = Layout

const Sidebar = function (props) {
    const [_collapse] = useState(false)
    const currentRoute = props.location.pathname
    const currentMenu = routing.find((item) => item.path.includes(currentRoute))
    const defaultMenu = (currentMenu) ? currentMenu.name : routing[0].name

    return (
        <Sider collapsible collapsed={_collapse} theme="light" trigger={null} className="sidebar">
            <div className={classnames('logo', {'collapse': _collapse})}>
                {!_collapse &&
                <span className="brand">
                        <img src='https://merchize.com/p/images/logo/logo-merchize.png' alt='m8-logo'/>
                    </span>}
            </div>
            <Menu mode="inline" theme="light" className="sidebar-menu" defaultSelectedKeys={[defaultMenu]}>
                {routing.map((route) => <Menu.Item key={route.name}>
                    <Link to={Array.isArray(route.path) ? route.path[0] : route.path}>
                        <Icon type={route.icon}/>
                        <span className="nav-text">{route.title}</span>
                    </Link>
                </Menu.Item>)}
            </Menu>
        </Sider>
    )
}

export default Sidebar
