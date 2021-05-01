export const reduceFraction = (numerator, denominator) => {
    let gcd = (a, b) => {
        return b ? gcd(b, a % b) : a
    }
    gcd = gcd(numerator, denominator)
    return [numerator / gcd, denominator / gcd]
}
