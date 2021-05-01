import React, {useContext, useEffect, useState} from 'react'
import NewProductContext from '../../../../context/NewProductContext'
import {Checkbox, Col, Row, Tag, Tooltip} from 'antd'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCaretDown, faCaretUp, faCheck} from '@fortawesome/free-solid-svg-icons'
import Color from 'color'
import './BackgroundColorSelector.scss'
import {Heading} from '@shopify/polaris'
import {BACKGROUND_COLORS, DEFAULT_BACKGROUND_COLOR} from "../../../../constants/constants"
import {ChromePicker} from 'react-color'
import {getSessionStorage, SESSION_KEY} from "../../../../../../services/storage/sessionStorage"
import NewProductDesignContext from "../../context/NewProductDesignContext"
import NotAllowDiv from "../../../common/NotAllowDiv"

const BackgroundColorSelector = (props) => {
    const {isDisable, visible, onChangeBGRColorVisible} = props
    const {product, setProduct} = useContext(NewProductContext)
    const {designState} = useContext(NewProductDesignContext)

    const [selectedColor, setSelectedColor] = useState(null)
    const [loading, setLoading] = useState(true)
    const [defaultMaterialColor, setDefaultMaterialColor] = useState(null)
    const [transparent, setTransparent] = useState(true)
    const [applyAllSide, setApplyAllSide] = useState(false)

    useEffect(() => {
        fetchColor()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [designState.currentProductIndex, designState.currentSideId, product])

    useEffect(() => {
        setApplyAllSide(false)
    }, [designState.currentProductIndex])

    useEffect(() => {
        setTransparent(!defaultMaterialColor)
    }, [defaultMaterialColor])

    const fetchColor = () => {
        const defaultMaterialColor = product.defaultBackgroundColor
        const currentProduct = product.userProducts[designState.currentProductIndex]
        let sideLayer = null
        if (currentProduct) {
            sideLayer = currentProduct.sideLayers.find((side) => side.side.id === designState.currentSideId)
        }
        const backgroundColor = sideLayer ? sideLayer.backgroundColor : defaultMaterialColor ? defaultMaterialColor.toUpperCase() : null
        setSelectedColor(backgroundColor)
        setDefaultMaterialColor(defaultMaterialColor)
        setLoading(false)
    }

    // const handleChange = (newValue) => {
    //     // console.log(/^#[0-9A-F]{6}$/i.test(newValue))
    //     setInputColorValue(newValue)
    //     if (/^#[0-9A-F]{6}$/i.test(newValue)) {
    //         onSelectColor(newValue)
    //     }
    // }

    const onSelectColor = (colorValue) => {
        // console.log(colorValue)
        if (!defaultMaterialColor && selectedColor === colorValue) {
            changeProductSideColor(null)
            setSelectedColor(null)
            setTransparent(true)
        } else {
            changeProductSideColor(colorValue)
            setSelectedColor(colorValue)
        }
    }

    const handleColorPickerChange = (color, event) => {
        // const colorObject = Color.rgb(Object.values(color.rgb))
        setSelectedColor(color.hex)
        changeProductSideColor(color.hex)
    }

    const sellerBackgroundColors = getSessionStorage(SESSION_KEY.SELLER_BACKGROUND_COLORS, [])

    const getColorLabel = (colorValue) => {
        const result = BACKGROUND_COLORS.filter(color => color.value.toUpperCase() === colorValue)[0]
        return result ? result.label : colorValue
    }


    const onChangeTransparent = (event) => {
        const value = event.target.checked
        let color = null
        if (!value) color = DEFAULT_BACKGROUND_COLOR
        changeProductSideColor(color)
        setSelectedColor(color)
        setTransparent(value)
    }


    const changeProductSideColor = (value) => {
        setTransparent(false)
        const userProduct = product.userProducts[designState.currentProductIndex]
        if (userProduct) {
            userProduct.previewUpdated = false

            if (applyAllSide) {
                userProduct.sideLayers.forEach((s) => s.backgroundColor = value)
            } else {
                const sideLayer = userProduct.sideLayers.find((s) => s.side.id === designState.currentSideId)
                sideLayer.backgroundColor = value
            }
        }
        setProduct({userProducts: product.userProducts})
    }

    const colorColumn = 2

    const handleChangeCheckbox = (event) => {
        const checked = event.target.checked
        if (checked) {
            const userProduct = product.userProducts[designState.currentProductIndex]
            if (userProduct) {
                userProduct.sideLayers.forEach((s) => s.backgroundColor = selectedColor)
                userProduct.previewUpdated = false
            }
        }
        setApplyAllSide(checked)
    }

    return loading ? (<div/>) : (
        <div className="background-color-selector">
            <NotAllowDiv isDisable={isDisable} message={"Please change to design"}/>
            <Row>
                <Col span={22}>
                    <Heading>Background color</Heading>
                </Col>
                <Col span={2}>
                    <FontAwesomeIcon
                        id={"btn-background-visible"}
                        className="mt-1"
                        size={"lg"}
                        icon={visible ? faCaretUp : faCaretDown}
                        onClick={onChangeBGRColorVisible}
                        style={{cursor: "pointer"}}
                    />
                </Col>
            </Row>
            {
                visible
                && (
                    <div id={'background-color-selector'} className="background-color-selector-item">
                        <div className={"mt-3"}>
                            <ChromePicker color={!selectedColor ? DEFAULT_BACKGROUND_COLOR : selectedColor}
                                          onChange={handleColorPickerChange} width="100%"
                                          disableAlpha/>
                            {/*<SketchPicker color={selectedColor} onChange={handeColorPickerChange} presetColors={presetColors} width={150}/>*/}
                        </div>
                        {
                            !defaultMaterialColor && (
                                <div className="mb-3 ml-1 mr-3 d-flex">
                                    <Checkbox
                                        checked={transparent}
                                        onChange={onChangeTransparent}
                                    >
                                        Transparent
                                    </Checkbox>
                                </div>
                            )
                        }
                        <div>
                            <div className="row background-color-selection">
                                {
                                    BACKGROUND_COLORS.map((color, index) => {
                                        const isSelected = selectedColor && color.value.toUpperCase() === selectedColor.toUpperCase()
                                        const colorClass = (index + 1) % (12 / colorColumn) === 0 ? `col-${colorColumn} background-color-item pl-0` : (index + 2) / (12 / colorColumn) === 0 ? `col-${colorColumn} background-color-item pr-0` : `col-${colorColumn} background-color-item`
                                        return (
                                            <div key={color.value} className={colorClass}>
                                                <Tooltip title={color.label} mouseLeaveDelay={0}>
                                                    <Tag color={color.value}
                                                         className="background-color mr-0"
                                                         onClick={() => onSelectColor(color.value)}
                                                         id={`btn-color-${color.value.replaceAll("#","")}`}
                                                        // onMouseEnter={() => setCurrentColor(attributeValue.id, true)}
                                                        // onMouseLeave={() => resetCurrentColor()}
                                                        //  title={color.label}
                                                    >
                                                        {selectedColor && isSelected ?
                                                            <FontAwesomeIcon style={{fontSize: "11px"}} icon={faCheck}
                                                                             color={Color(color.value.toLowerCase()).hsl().color[2] > 90 ? '#8e8e8e' : '#ffffff'}/> :
                                                            <span>&nbsp;</span>}
                                                    </Tag>
                                                </Tooltip>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        {
                            sellerBackgroundColors.length > 0 && (
                                <div className={"mt-3"}>
                                    <div className={"mb-2"}>
                                        Recently colors
                                    </div>
                                    <div className="row background-color-selection">
                                        {
                                            sellerBackgroundColors.map((color, index) => {
                                                const isSelected = selectedColor && color.toUpperCase() === selectedColor.toUpperCase()
                                                const colorColumn = 2
                                                const colorClass = index % (12 / colorColumn) === 0 ? `col-${colorColumn} background-color-item ml-0` : (index + 1) / (12 / colorColumn) === 0 ? `col-${colorColumn} background-color-item mr-0` : `col-${colorColumn} background-color-item`
                                                return (
                                                    <Tooltip key={color} title={() => getColorLabel(color)}
                                                             mouseLeaveDelay={0}>
                                                        <div className={colorClass}>
                                                            <Tag color={color}
                                                                 className="background-color mr-0"
                                                                 onClick={() => onSelectColor(color)}
                                                                // onMouseEnter={() => setCurrentColor(attributeValue.id, true)}
                                                                // onMouseLeave={() => resetCurrentColor()}
                                                                //  title={color.label}
                                                            >
                                                                {selectedColor && isSelected ?
                                                                    <FontAwesomeIcon style={{fontSize: "11px"}}
                                                                                     icon={faCheck}
                                                                                     color={Color(color.toLowerCase()).hsl().color[2] > 90 ? '#8e8e8e' : '#ffffff'}/> :
                                                                    <span>&nbsp;</span>}
                                                            </Tag>
                                                        </div>
                                                    </Tooltip>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            )
                        }
                        {
                            product.abstract.sides.length > 1 && (
                                <div className="mt10">
                                    <Checkbox
                                        checked={applyAllSide}
                                        onChange={handleChangeCheckbox}
                                        id={"checkbox-apply-background-all-side"}
                                    >
                                        Apply to all placements
                                    </Checkbox>
                                </div>
                            )
                        }
                    </div>
                )}
            {/*<div className={"mt-3"}>*/}
            {/*<TextField label="Type a color" value={inputColorValue} onChange={handleChange}/>*/}
            {/*</div>*/}
        </div>
    )
}

export default BackgroundColorSelector
