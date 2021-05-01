import React from 'react'
import {Helmet} from 'react-helmet'
import PropTypes from 'prop-types'
import {getReactEnv} from '../../services/env/getEnv'

const defaultTitle = getReactEnv('APP_NAME')

const DocTitle = function (props) {
    const {title} = props

    return (
        <Helmet>
            <meta charSet="utf-8"/>
            <title>{`${title} | ${defaultTitle}`}</title>
        </Helmet>
    )
}

DocTitle.defaultProps = {
    title: defaultTitle,
}

DocTitle.propTypes = {
    title: PropTypes.string,
}

export default DocTitle