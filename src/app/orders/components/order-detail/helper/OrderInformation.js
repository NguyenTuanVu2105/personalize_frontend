function getAllItemSku(packs) {
    let allItemSku = []

    packs.forEach(pack => {
        return pack.items.forEach(item => {
            allItemSku.push(item.variant.sku)
        })
    })

    return allItemSku
}

function getAllPositiveItemSku(packs) {
    let allPositiveItemSku = []

    packs.forEach(pack => {
        return pack.items.forEach(item => {
            if (item.quantity > 0) allPositiveItemSku.push(item.variant.sku)
        })
    })

    return allPositiveItemSku
}

export { getAllItemSku, getAllPositiveItemSku }