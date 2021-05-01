import React, {useContext} from 'react'
import NewProductContext from '../../../../context/NewProductContext'
import {Button, Modal, Tag, Tooltip} from 'antd'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCheck} from '@fortawesome/free-solid-svg-icons'
import Color from 'color'
import NewProductDesignContext from '../../context/NewProductDesignContext'
import './ColorSelector.scss'
import {Heading} from '@shopify/polaris'
import {DETERMINE_COLOR, lightOrDark} from "../../../../helper/determineColor"
const MAXIMUM_VARIANT = 100

const ColorSelector = (props) => {
    const {multiple, mockupInfo} = props
    const colorAttrInteractive = mockupInfo && mockupInfo.preview_meta.color_attr_interactive
    const {product, updateAttributes, setProduct} = useContext(NewProductContext)
    // const [currentSelect, setCurrentSelect] = useState(null)
    // console.log(product)
    const {attributes} = product
    // const [variantCount, setVariantCount] = useState(Object.values(attributes).reduce((com, values) => com * values.length, 1))
    // TODO Show variant count
    // console.log(variantCount)
    const {setCurrentColor, resetCurrentColor} = useContext(NewProductDesignContext)
    const colorAttributes = product.abstract.child_attributes.find(attribute => attribute.name.toLowerCase().includes('color'))
    if (!colorAttributes) return <div/>

    const selectAttribute = (attribute, name) => () => {
        const selected = attributes[name] || []
        const isSelected = selected.includes(attribute)
        if (isSelected && selected.length <= 1) return
        const selectedResult = isSelected ?
            selected.filter((item) => item !== attribute) :
            (!multiple ? [attribute] : [...selected, attribute])
        const newAttributes = {
            ...attributes,
            [name]: selectedResult,
        }
        // console.log(newAttributes)
        const variantCount = Object.values(newAttributes).reduce((com, values) => com * values.length, 1)
        if (variantCount <= MAXIMUM_VARIANT) {
            updateAttributes(newAttributes, product)
            // setVariantCount(variantCount)
        } else {
            Modal.warning({
                title: 'Exceed maximum number of variants',
                content: 'The Shopify variant limit of variants per product is 100. You cannot add more!',
            })
        }
        setCurrentColor(newAttributes['Color'][newAttributes['Color'].length - 1], false)
        for (const userProduct of product.userProducts) {
            userProduct.previewUpdated = false
        }
        setProduct({userProducts: product.userProducts})
        // setStepTut(stepTut + 1)

    }
    // const selectOnlyAttribute = (attribute, name) => () => {
    //     const selected = attributes[name] || []
    //     const isSelected = selected.includes(attribute)
    //     if (isSelected && selected.length <= 1) return
    //     const selectedResult = isSelected ? selected.filter((item) => item !== attribute) : [...selected, attribute]
    //     const newAttributes = {
    //         ...attributes,
    //         [name]: selectedResult,
    //     }
    //     console.log(newAttributes)
    //     const variantCount = Object.values(newAttributes).reduce((com, values) => com * values.length, 1)
    //     if (variantCount <= MAXIMUM_VARIANT) {
    //         updateAttributes(newAttributes)
    //         setVariantCount(variantCount)
    //     } else {
    //         Modal.warning({
    //             title: 'Exceed maximum number of variants',
    //             content: 'The Shopify variant limit of variants per product is 100. You cannot add more!',
    //         })
    //     }
    //     setCurrentColor(newAttributes['Color'][newAttributes['Color'].length - 1], false)
    //
    // }

    const clearColor = () => {
        let attrData = {}
        attrData[colorAttributes.name] = []
        updateAttributes({...attributes, ...attrData}, product)
        // setVariantCount(0)
    }

    const selectColors = (value) => {
        let attrData = {}
        attrData[colorAttributes.name] = colorAttributes.child_attributes_value_set
            .filter(a => lightOrDark(a.value) === value)
            .map((a) => a.id)
        const newAttributes = {...attributes, ...attrData}
        updateAttributes(newAttributes, product)
        // const variantCount = Object.values(newAttributes).reduce((com, values) => com * values.length, 1)
        // setVariantCount(variantCount)
        setCurrentColor(newAttributes['Color'][0], false)
    }

    return (
        <div className="pb2em color-selector">
            <Heading>Colors</Heading>
            {!multiple && <br/>}
            {multiple &&
            <div className="flex-start mb5 text-primary">
                <Button type="link" className="text-primary no-padding" onClick={clearColor}>Clear</Button>
                <span>・</span>
                <Button type="link" className="text-primary no-padding"
                        onClick={() => selectColors(DETERMINE_COLOR.DARK)}>Dark</Button>
                <span>・</span>
                <Button type="link" className="text-primary no-padding"
                        onClick={() => selectColors(DETERMINE_COLOR.LIGHT)}>Light</Button>
            </div>}
            <ul className="attributes-selection">
                {colorAttributes.child_attributes_value_set.map((attributeValue) => {
                    const isSelected = (attributes[colorAttributes.name] || []).includes(attributeValue.id)
                    return (
                        <li key={attributeValue.id} className="attribute-item">
                            <Tooltip title={attributeValue.label} mouseLeaveDelay={0}>
                                <Tag color={attributeValue.value}
                                     className="attribute-color"
                                     onClick={selectAttribute(attributeValue.id, colorAttributes.name)}
                                     onMouseEnter={() => colorAttrInteractive && setCurrentColor(attributeValue.id, true)}
                                     onMouseLeave={() => colorAttrInteractive && resetCurrentColor()}
                                     title={attributeValue.label}>
                                    {isSelected ? <FontAwesomeIcon icon={faCheck}
                                                                   color={Color(attributeValue.value.toLowerCase()).hsl().color[2] > 90 ? '#8e8e8e' : '#ffffff'}/> :
                                        <span>&nbsp;</span>}
                                </Tag>
                            </Tooltip>
                        </li>
                    )
                })}
            </ul>

        </div>
    )
}

export default ColorSelector
