import React from 'react'
import PropTypes from 'prop-types'

import modelLogos from './helpers/modelLogos'


const ModelLogo = ({
                       bank,
                       model,
                       type,
                   }) => {
    if (
        !modelLogos[bank] ||
        !modelLogos[bank][model] ||
        !modelLogos[bank][model][type]
    ) {
        return null
    }

    return (
        <img
            src={modelLogos[bank][model][type]}
            alt={model}
            className={`${bank}-${model}-${type}`}
        />
    )
}

ModelLogo.propTypes = {
    bank: PropTypes.string,
    model: PropTypes.string,
    type: PropTypes.string,
}

ModelLogo.defaultProps = {
    bank: '',
    model: '',
    type: '',
}

export default ModelLogo
