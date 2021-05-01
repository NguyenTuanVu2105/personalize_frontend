import {DEFAULT_CURRENCY} from "../new-product/constants/constants"

export const numberFormatCurrency = (value, currency = DEFAULT_CURRENCY.currency, minimumFractionDigits=2) => {
    value = value ? value : 0
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: Math.max(minimumFractionDigits, 0),
        minimumIntegerDigits: 1
    }).format(value)
}


export const preFormatCurrencyUsd = (value, currency = "$") =>
    currency + new Intl.NumberFormat('en-US').format(value)
