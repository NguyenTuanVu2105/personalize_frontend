export const getMockupInfoSide = (abstract, sideId, currentVariant) => {
    if (!currentVariant) return null
    // console.log("currentVariant")
    // console.log(currentVariant)
    // console.log(abstract)
    const mockupInfoId = currentVariant.mockup_info
    const side = abstract.sides.find(s => s.id === sideId).type
    // console.log(abstract)
    return abstract.mockup_infos.find(info => info.id === mockupInfoId).preview[side]
}

export const getMockupInfo = (abstract, currentVariant) => {
    if (!currentVariant) return null
    const mockupInfoId = currentVariant.mockup_info
    return abstract.mockup_infos.find(info => info.id === mockupInfoId)
}


