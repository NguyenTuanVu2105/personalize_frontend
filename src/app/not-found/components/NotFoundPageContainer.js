import React from 'react'
import DocTitle from '../../shared/DocTitle'
import NotFoundPage from './NotFoundPage'
import AppContext from '../../../AppContext'

const NotFoundPageContainer = (props) => {
    return (
        <AppContext.Consumer>
            {(context) => {
                return (
                    <div className="homepage-container">
                        <DocTitle title="404 Not Found" {...props} />
                        <NotFoundPage {...{...props, ...context}} />
                    </div>
                )
            }}
        </AppContext.Consumer>
    )
}

export default NotFoundPageContainer
