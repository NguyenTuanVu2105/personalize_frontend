export const standardFloatNumber = (originalNumber, decimalPlaces) => {
    const decimalParam = Math.pow(10, decimalPlaces)
    return Math.round(originalNumber * decimalParam) / decimalParam
}