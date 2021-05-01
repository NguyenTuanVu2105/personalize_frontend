import React from 'react'
import DOMPurify from "dompurify"
import PropTypes from "prop-types"

const sanitize = (dirty, options) => ({
    __html: DOMPurify.sanitize(dirty, options),
})

const allowIframeOptions = {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
}

const SanitizeHTML = (props) => {
    const {html, allowIframe, ...childrenProps} = props
    return (<div {...childrenProps} dangerouslySetInnerHTML={sanitize(props.html, props.allowIframe ? allowIframeOptions : null)}/>)
}

SanitizeHTML.defaultProps = {
    allowIframe: false
}


SanitizeHTML.propTypes = {
    html: PropTypes.string.isRequired,
    allowIframe: PropTypes.bool
}

export default SanitizeHTML
