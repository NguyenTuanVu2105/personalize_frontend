export function pad(n, width, z) {
    z = z || '0'
    n = n + ''
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

export function formatPrice(value) {
    return value.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
}
