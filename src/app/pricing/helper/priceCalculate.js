import BigNumber from "bignumber.js"

export const roundPrice = (price, precision = 0) => {
    if (precision < 0) {
        let roundDegree = Math.pow(10, precision)
        return Math.ceil(price * roundDegree) / roundDegree
    }

    let stringPrice = BigNumber(price).toFixed(precision)
    return BigNumber(stringPrice).toNumber()
}

export const changePrecision = (precision) => {
    return precision < 0 ? 0 : precision
}

export const convertCurrency = (originalPrice, originalExchangeRate, destinationExchangeRate, precision) => {
    return roundPrice((originalPrice / originalExchangeRate) * destinationExchangeRate, precision)
}