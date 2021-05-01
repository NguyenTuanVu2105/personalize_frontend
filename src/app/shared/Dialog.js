import React from 'react'
import PropTypes from 'prop-types'
import {Modal} from 'antd'

const Dialog = function (props) {
    const {title, show, onToggle, cancelText, okText, width} = props

    return (
        <Modal title={title} visible={show} onCancel={onToggle} okText={okText} cancelText={cancelText} width={width}>
            {props.children}
        </Modal>
    )
}

Dialog.defaultProps = {
    width: '520px',
}

Dialog.propTypes = {
    title: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    okText: PropTypes.string.isRequired,
    cancelText: PropTypes.string.isRequired,
    width: PropTypes.string,
}

export default Dialog
