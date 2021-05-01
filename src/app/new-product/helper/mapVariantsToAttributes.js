import _ from 'lodash'

const mapVariantsToAttributes = function (variants) {
    const attributes = {}
    variants.forEach((variant) => {
        const data = variant
        data.attributes_value.forEach((item) => {
            const {attribute, value} = item
            if (attributes[attribute]) attributes[attribute] = [...attributes[attribute], value]
            else attributes[attribute] = [value]
        })
    })

    for (const i in attributes) {
        const attribute = attributes[i]
        attributes[i] = _.uniq(attribute)
    }

    return attributes
}

export default mapVariantsToAttributes
