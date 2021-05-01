export const waitForArtworksLoading = async (loadingInterval, userProduct) => {
    return new Promise((resolve) => {
        loadingInterval = setInterval(() => {
            const layers = []
            if (userProduct) {
                userProduct.sideLayers.forEach((s) => {
                    layers.push(...s.layers)
                })
            }
            if (userProduct && layers.every(layer => layer.data)) {
                resolve()
                clearInterval(loadingInterval)
            }
        }, 500)
    })
}

export const waitForArtworksProcessing = async (processingInterval, artworkInfo, sides) => {
    return new Promise((resolve) => {
        processingInterval = setInterval(() => {
            if (sides && sides.every(side => !!artworkInfo[side.type])) {
                resolve()
                clearInterval(processingInterval)
            }
        }, 500)
    })
}
