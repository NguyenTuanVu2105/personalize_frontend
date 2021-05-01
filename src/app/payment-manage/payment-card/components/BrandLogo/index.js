import React from 'react'
import PropTypes from 'prop-types'

import brandLogos from './helpers/brandLogos'

const BrandLogo = ({
                       brand
                   }) => {
    if (!brandLogos[brand]) {
        return null
    }

    return (
        <img
            src={brandLogos[brand]}
            alt={brand}
            className={'brandLogo'}
        />
    )
}

BrandLogo.propTypes = {
    brand: PropTypes.string,
    bank: PropTypes.string,
    model: PropTypes.string,
    type: PropTypes.string,
}

BrandLogo.defaultProps = {
    brand: '',
    bank: '',
    model: '',
    type: '',
}

export default BrandLogo
