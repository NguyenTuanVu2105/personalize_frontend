import React, {useContext, useEffect} from 'react'
import {Breadcrumb, Layout} from 'antd'
import AppHeader from './AppHeader'
import {renderRoutes} from 'react-router-config'
import UserPageContext from '../context/UserPageContext'
import {Link} from 'react-router-dom'
import _ from 'lodash'
import './UserPage.scss'
import AppHeaderResponsive from './AppHeaderResponsive'
import AppContext from '../../../AppContext'
import Paths from '../../../routes/Paths'

const {Content, Footer} = Layout

const DefaultPageContainer = (props) => {

    const {breadcrumbNameMap, viewWidth} = useContext(UserPageContext)
    const {setHasContextual} = useContext(AppContext)

    const breadcrumbItems = _.map(breadcrumbNameMap, (name, url) => {
        return (
            <Breadcrumb.Item key={url}>
                <Link to={url}>{name}</Link>
            </Breadcrumb.Item>
        )
    })

    useEffect(() => {
        if (props.history.location.pathname !== Paths.NewOrder && !props.history.location.pathname.includes(Paths.ListProducts)) {
            setHasContextual(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.history.location])


    return (
        <div className="user-page">
            <Layout className={`app-layout`}>
                <AppHeader {...props}/>
                <AppHeaderResponsive {...props}/>
                <div className={`layout-body`}>
                    <Content
                        className={`width-${viewWidth} content content-container`}
                    >
                        <Breadcrumb>{breadcrumbItems}</Breadcrumb>
                        <div className="main-content">
                            {renderRoutes(props.route.routes)}
                        </div>
                    </Content>
                    <Footer className={`footer`}>© {new Date().getFullYear()} PrintHolo</Footer>
                </div>
            </Layout>
        </div>
    )
}

export default DefaultPageContainer
