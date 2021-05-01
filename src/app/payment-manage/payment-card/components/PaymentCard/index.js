import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import BankLogo from '../BankLogo'
import ModelLogo from '../ModelLogo'
import BrandLogo from '../BrandLogo'

const cardClasses = (bank, model, type, flipped, className, brand) => {
    const cardClassName = `${bank}-${model}-${type}`

    return `${cardClassName} payment-card ${brand}`
}

const PaymentCard = ({
                         bank,
                         model,
                         type,
                         number,
                         cvv,
                         expiration,
                         holderName,
                         brand,
                         flipped,
                         className,
                     }) => (
    <div className="wrapper">
        <div className={cardClasses(bank, model, type, flipped, className, brand)}>
            <div className={classNames(`cover-card-${brand}`, 'cover-card')}>
            </div>
            <div className="front">
                <BankLogo
                    bank={bank}
                    model={model}
                    type={type}
                    imgClassName="ffh-logo"
                />
                <ModelLogo
                    bank={bank}
                    model={model}
                    type={type}
                />
                <div className="chip">
                    <div className="horizontalLine"/>
                    <div className="verticalLine"/>
                </div>
                <div className="number">
                    {number}
                </div>
                <div className="expiration">
                    {expiration}
                </div>
                <div className="holderName">
                    {holderName}
                </div>
                <BrandLogo
                    brand={brand}
                    bank={bank}
                    model={model}
                    type={type}
                />
            </div>
            <div className="back">
                <div className="cvv">
                    {cvv}
                </div>
            </div>
        </div>
    </div>
)

PaymentCard.propTypes = {
    bank: PropTypes.string,
    model: PropTypes.string,
    type: PropTypes.string,
    brand: PropTypes.string,
    number: PropTypes.string,
    cvv: PropTypes.string,
    holderName: PropTypes.string,
    expiration: PropTypes.string,
    flipped: PropTypes.bool,
    className: PropTypes.string,
}

PaymentCard.defaultProps = {
    bank: '',
    model: '',
    type: '',
    brand: '',
    number: '•••• •••• •••• ••••',
    cvv: '•••',
    holderName: 'Nome Completo',
    expiration: 'MM/AA',
    flipped: false,
    className: null,
}

export default PaymentCard
