export const getMockupInfoSide = (abstract, sideId, currentVariant) => {
    if (!currentVariant) return null
    if (!abstract) return null
    const mockupInfoId = currentVariant.mockup_info
    const _side = abstract.sides.find(s => s.id === sideId)
    if (!_side) return null
    const side = _side.type
    return abstract.mockup_infos.find(info => info.id === mockupInfoId).preview[side]
}

export const getMockupInfo = (abstract, currentVariant) => {
    if (!currentVariant) return null
    if (!abstract) return null
    const mockupInfoId = currentVariant.mockup_info
    return abstract.mockup_infos.find(info => info.id === mockupInfoId)
}


