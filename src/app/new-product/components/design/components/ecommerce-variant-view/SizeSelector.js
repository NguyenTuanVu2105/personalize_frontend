import React, {useContext} from 'react'
import NewProductContext from '../../../../context/NewProductContext'
import {Tag} from 'antd'
import {Heading} from '@shopify/polaris'

const SizeSelector = (props) => {
    const {product, updateAttributes} = useContext(NewProductContext)
    // console.log(product)
    const {attributes} = product
    // const [variantCount,] = useState(Object.values(attributes).reduce((com, values) => com * values.length, 1))
    // TODO Show variant count
    // console.log(variantCount)
    const sizeAttributes = product.abstract.child_attributes.find(attribute => attribute.name.toLowerCase().includes('size'))
    if (!sizeAttributes) return <div></div>

    const selectAttribute = (attribute, name) => () => {
        const selected = attributes[name] || []
        const isSelected = selected.includes(attribute)
        if (isSelected && selected.length <= 1) return
        const selectedResult = isSelected ?
            selected.filter((item) => item !== attribute) : [attribute]
        const newAttributes = {
            ...attributes,
            [name]: selectedResult,
        }
        updateAttributes(newAttributes, product)
    }

    return (
        <div className="pt1em pb1em">
            <Heading>Size</Heading>
            <br/>
            <ul className="attributes-selection">
                {sizeAttributes.child_attributes_value_set.map((attributeValue) => {
                    const isSelected = (attributes[sizeAttributes.name] || []).includes(attributeValue.id)
                    return (
                        <li key={attributeValue.id} className="attribute-item">
                            <Tag
                                className="attribute-size"
                                color={isSelected ? "#108ee9" : ''}
                                onClick={selectAttribute(attributeValue.id, sizeAttributes.name)}
                                title={attributeValue.label}>
                                {attributeValue.label}
                            </Tag>
                        </li>
                    )
                })}
            </ul>

        </div>
    )
}

export default SizeSelector
