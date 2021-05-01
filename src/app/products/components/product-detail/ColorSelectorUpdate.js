import React, {useState} from 'react'
import {Button} from "@shopify/polaris"
import {notification, Tag, Tooltip} from "antd"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faCheck} from "@fortawesome/free-solid-svg-icons"
import Color from "color"

const DARK_COLORS = ['#333333', '#2d384b', '#003466', '#382d29', '#660066', '#464a53', '#345039']
const LIGHT_COLORS = ['#ffffff', '#cd0102', '#c8c8d2', '#fecb00', '#1ebb6a', '#a1c4e2', '#ff3300', '#f2cfd6']

const MAXIMUM_VARIANT = 100

const ColorSelectorUpdate = (props) => {

    const {colors, setColors, colorAttributes, variantCount} = props

    const [status, setStatus] = useState(0)

    if (!colorAttributes) return <div></div>

    const selectAttribute = (id) => {
        if (!colors.includes(id)) {
            if (variantCount*(colors.length + 1) <= MAXIMUM_VARIANT)colors.push(id)
            else {
                notification['warning']({
                    message: "Exceed maximum number of variants",
                    description: 'The Shopify variant limit of variants per product is 100. You cannot add more!'
                })
            }
        }
        else {
            const index = colors.indexOf(id)
            colors.splice(index, 1)
        }
        setColors([...colors])
        setStatus(status+1)
    }

    const clearColor = () => {
        setColors([])
    }

    const selectColors = (colorValues) => {
        const _color = colorAttributes.child_attributes_value_set
            .filter(a => colorValues.includes(a.value))
            .map((a) => a.id)
        setColors(_color)
    }

    return (
        <div>
            <ul className="attributes-selection">
                {colorAttributes.child_attributes_value_set.map((attributeValue) => {
                    const isSelected = colors.includes(attributeValue.id)
                    return (
                        <li key={attributeValue.id} className="attribute-item">
                            <Tooltip title={attributeValue.label} mouseLeaveDelay={0}>
                                <Tag color={attributeValue.value}
                                     className="attribute-color"
                                     onClick={() => selectAttribute(attributeValue.id)}
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
            <div className="flex-start mt10">
                <Button className="mr5" size='slim' onClick={clearColor}>Clear</Button>
                <Button className="mr5" size='slim' onClick={() => selectColors(DARK_COLORS)}>Dark</Button>
                <Button className="mr5" size='slim' onClick={() => selectColors(LIGHT_COLORS)}>Light</Button>
            </div>

        </div>
    )
}

export default ColorSelectorUpdate
