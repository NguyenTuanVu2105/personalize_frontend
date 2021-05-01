import React, {useContext} from 'react'
import './HomePage.css'
import Paths from '../../../routes/Paths'
import AppContext from '../../../AppContext'

const HomePage = function (props) {
    const {user} = useContext(AppContext)

    const dashboardPathWithParams = Paths.Dashboard + props.location.search

    if (user && user.userId) {
        props.history.push(dashboardPathWithParams)
        return <div/>
    } else {
        props.history.push(Paths.Login)
        return <div/>
    }

}

export default HomePage
