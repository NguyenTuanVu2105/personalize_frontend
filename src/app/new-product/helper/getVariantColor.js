import {DEFAULT_COLOR} from '../constants/constants'

export const getVariantColor = (variant) => {
    const currentColorValue = variant.attributes_value.find(value => value.attribute_name === 'Color')
    return currentColorValue ? currentColorValue.value : DEFAULT_COLOR
}
