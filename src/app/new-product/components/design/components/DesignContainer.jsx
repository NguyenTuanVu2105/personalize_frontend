import React, {useCallback, useContext, useEffect, useState} from 'react'
import DesignView from './DesignView'
import MockupPreviewTabContent from './mockup-view/MockupPreviewTabContent'
import NewProductContext from '../../../context/NewProductContext'
import NewProductDesignContext from '../context/NewProductDesignContext'
import {getMockupInfo} from '../../../helper/getMockupInfo'
import {Button, Card, RangeSlider, Tabs, TextField} from "@shopify/polaris"
import "./DesignContainer.scss"
import {
    faArrowDown,
    faArrowLeft,
    faArrowRight,
    faArrowsAltH,
    faArrowsAltV,
    faArrowUp,
    faCloudUploadAlt,
    faGripLines,
    faGripLinesVertical,
    faSync,
    faTrash
} from "@fortawesome/free-solid-svg-icons"
import {
    DESIGN_SECTION_SQUARE_SIZE,
    LAYER_TYPE,
    MAX_ROTATE_ALLOW,
    PRE_POSITION,
    VIEW_STATE
} from "../../../constants/constants"
import {Col, Row, Spin} from "antd"
import ShadowIconButton from "../../../../shared/ShadowIconButton"
import NumberFormButton from "../../../../shared/NumberFormButton"
import BackgroundColorSelector from "./mockup-design-view/BackgroundColorSelector"
import {checkLayerSideConstraints, getArtworkDPI} from "../../../helper/checkArtworkConstraints"
import ColorSelector from "./product-info-view/ColorSelector"
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd"
import LayerElement from "./design-layer/LayerElement"
import AddLayer from "./design-layer/AddLayer"
import _ from "lodash"
import NotAllowDiv from "../../common/NotAllowDiv"
import DesignLabel from "../../common/DesignLabel"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {errorLimitLayer} from "./artwork-view/upload-artwork/constant"
import TextColorSelector from "./mockup-design-view/TextColorSelector"
import TextTypeFaceSelector from "./mockup-design-view/TextTypeFaceSelector"
import styled from "styled-components"
import DesignTextLayer from "./DesignTextLayer"
import {validCharacter} from "../../../helper/createText"


const ROTATE_STEP = 5

const MAX_LAYER = 10

const TIME_DELAY = 10


const DesignContainer = (props) => {
    const {product, setProduct, removeArtwork, uploadManager, duplicateLayer, listFonts} = useContext(NewProductContext)
    const {
        designState,
        setDesignState,
        currentProductIsAbleToPreview,
        viewState,
        setViewState,
        frameScale
    } = useContext(NewProductDesignContext)

    const [selectedSide, setSelectedSide] = useState(0)

    const sideData = product.abstract.sides[selectedSide]
    const minimumDPI = sideData ? sideData.constraints.minimum_dpi : null
    const sideFusionSize = sideData ? sideData.fusion_size.artwork_fusion_size : null

    const [curProduct, setCurProduct] = useState(null)

    const [curSideLayer, setCurSideLayer] = useState(null)

    const [curLayer, setCurLayer] = useState(null)

    const [currentNumberArtworks, setCurrentNumberArtworks] = useState(0)

    const [prePosition, setPrePosition] = useState([''])

    const [rotateValue, setRotateValue] = useState(0)

    const [textPreview, setTextPreview] = useState('Preview text')

    const [textSize, setTextSize] = useState()

    const [textColor, setTextColor] = useState("#000000")

    const [textLetterSpacing, setTextLetterSpacing] = useState(0)

    const [textArc, setTextArc] = useState(0)

    const [typeFace, setTypeFace] = useState(listFonts[0] ? listFonts[0] : {title: "Default", id: 111})

    const [listDesignLayers, setListDesignLayers] = useState([])

    const [resizeOrScaleOrDrag, setResizeOrScaleOrDrag] = useState("scale")

    const [backGroundColorVisible, setBackGroundColorVisible] = useState(true)


    useEffect(() => {
        let result = []
        if (curSideLayer) {
            result = curSideLayer.layers
            result = _.orderBy(result, ["layerIndex"], ["desc"])
        }
        setListDesignLayers(result)
        setCurrentNumberArtworks(result.length)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curSideLayer, curSideLayer && curSideLayer.layers.length])


    useEffect(() => {
        if (curProduct) {
            setCurSideLayer(curProduct.sideLayers.find((s) => s.side.id === designState.currentSideId))
        }
    }, [designState.currentSideId, curProduct])

    useEffect(() => {
        if (curSideLayer) {
            setCurLayer(curSideLayer.layers.find((l) => l.layerIndex === designState.currentLayerIndex))
        }
    }, [designState.currentLayerIndex, curSideLayer])

    useEffect(() => {
        setCurProduct(product.userProducts[designState.currentProductIndex])
    }, [designState.currentProductIndex, product.userProducts])

    const updateLayer = () => {
        const curProduct = product.userProducts[designState.currentProductIndex]
        const curSideLayer = curProduct.sideLayers.find((s) => s.side.id === designState.currentSideId)
        const curLayer = curSideLayer.layers.find((l) => l.layerIndex === designState.currentLayerIndex)

        setCurProduct(curProduct)
        setCurSideLayer(curSideLayer)
        setCurLayer(curLayer)
    }
    const onChangeBGRColorVisible = () => {
        setBackGroundColorVisible(!backGroundColorVisible)
    }

    useEffect(() => {
        if (curLayer && curLayer.type === LAYER_TYPE.text) {
            if (curLayer && curLayer.textPreview) setTextPreview(curLayer.textPreview)
            if (curLayer.textPreview === "") setTextPreview("")
            setTextSize(curLayer.textStyle.currentFontSize)
            setTextLetterSpacing(curLayer.textStyle.letterSpacing)
            if (curLayer.textStyle.typeFace !== "") {
                setTypeFace(curLayer.textStyle.typeFace)
            } else {
                if (listFonts[0]) {
                    setTypeFace(listFonts[0])
                    curLayer.textStyle.typeFace = listFonts[0]
                } else {
                    curLayer.textStyle.typeFace = typeFace
                }
            }
            setTextArc(curLayer.textStyle.arc)
            setResizeOrScaleOrDrag(curLayer.scaleOrDrag)
            DesignTextLayer(curLayer, frameScale)
            setBackGroundColorVisible(false)
        } else {
            setBackGroundColorVisible(true)
        }
        (curLayer && curLayer.rotate) ? setRotateValue(curLayer.rotate) : setRotateValue(0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curLayer, listDesignLayers, designState.currentLayerIndex, frameScale, typeFace])

    useEffect(() => {
        let result = []
        if (curSideLayer) {
            result = curSideLayer.layers
            result = _.orderBy(result, ["layerIndex"], ["desc"])
        }
        setListDesignLayers(result)
        setCurrentNumberArtworks(result.length)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curSideLayer, curSideLayer && curSideLayer.layers.length])

    const pushNewRotateValue = (value) => {
        setRotateValue(parseFloat(value))
        positionArtwork(PRE_POSITION.ROTATION)
    }

    const onChangeRotateValue = (e) => {
        const value = e.target.value
        const v = parseFloat(value)
        if (!isNaN(v)) {
            pushNewRotateValue(v)
        } else {
            pushNewRotateValue(0)
        }
    }

    const onClickMinus = () => {
        const futureValue = rotateValue - ROTATE_STEP
        if (rotateValue > -MAX_ROTATE_ALLOW && futureValue > -MAX_ROTATE_ALLOW) {
            pushNewRotateValue(futureValue)
        } else pushNewRotateValue(-MAX_ROTATE_ALLOW)
    }

    const onClickPlus = () => {
        const futureValue = rotateValue + ROTATE_STEP
        if (rotateValue < MAX_ROTATE_ALLOW && futureValue < MAX_ROTATE_ALLOW) {
            pushNewRotateValue(futureValue)
        } else pushNewRotateValue(MAX_ROTATE_ALLOW)
    }

    const onChangeTextColor = (value) => {
        setTextColor(value)
        curLayer.textStyle.textColor = value
        curLayer.textColor = value
        DesignTextLayer(curLayer, frameScale)
        curProduct.previewUpdated = false
    }

    const onChangeTextSizeTargetValue = (e) => {
        const value = e.target.value
        onChangeTextSizeValue(value)
        // curLayer.textStyle.currentFontSize=e.target.value
    }

    const onChangeTextSizeValue = (value) => {
        if (!isNaN(value) && value >= 1 && value <= 500) {
            // console.log("value",value)
            // const proportion = value / curLayer.textStyle.defaultFontSize
            setTextSize(value)
            // curLayer.scale = [proportion, proportion]
            curLayer.textStyle.currentFontSize = value
            DesignTextLayer(curLayer, frameScale)
            curProduct.previewUpdated = false
        }
    }

    const onClickTextSizeMinus = () => {
        if (textSize >= 2) {
            // const proportion = (textSize - 1) / curLayer.textStyle.defaultFontSize
            setTextSize(textSize - 1)
            // curLayer.scale = [proportion, proportion]
            curLayer.textStyle.currentFontSize = curLayer.textStyle.currentFontSize - 1
            DesignTextLayer(curLayer, frameScale)
            curProduct.previewUpdated = false
        }
    }
    const onClickTextSizePlus = () => {
        if (textSize < 500) {
            // const proportion = (textSize -1 +2) / curLayer.textStyle.defaultFontSize
            setTextSize(textSize - 1 + 2)
            // curLayer.scale = [proportion, proportion]
            curLayer.textStyle.currentFontSize = curLayer.textStyle.currentFontSize - 1 + 2
            DesignTextLayer(curLayer, frameScale)
            curProduct.previewUpdated = false
        }
    }

    const onChangeTextLetterSpacingValue = (e) => {
        if (!isNaN(e.target.value) && e.target.value >= 0 && e.target.value <= 20) {
            setTextLetterSpacing(e.target.value)
            curLayer.textStyle.letterSpacing = e.target.value
            DesignTextLayer(curLayer, frameScale)
            curProduct.previewUpdated = false
        }
    }

    const onClickTextLetterSpacingPlus = () => {
        if (textLetterSpacing < 20) {
            setTextLetterSpacing(textLetterSpacing - 1 + 2)
            curLayer.textStyle.letterSpacing = curLayer.textStyle.letterSpacing - 1 + 2
            DesignTextLayer(curLayer, frameScale)
            curProduct.previewUpdated = false
        }
    }
    const onClickTextLetterSpacingMinus = () => {
        if (textLetterSpacing > 0) {
            setTextLetterSpacing(textLetterSpacing - 1)
            curLayer.textStyle.letterSpacing = curLayer.textStyle.letterSpacing - 1
            DesignTextLayer(curLayer, frameScale)
            curProduct.previewUpdated = false
        }
    }

    const changeArcLayer = (value) => {
        if (curLayer) {
            curLayer.textStyle.arc = value
            DesignTextLayer(curLayer, frameScale)
        }
        setCurLayer(curLayer)
        curProduct.previewUpdated = false
        setWaitLoadingArc(false)
    }


    const positionArtwork = (pos) => {
        if (curLayer) {
            setPrePosition([pos])
        }
    }

    const onChangeTextArc = (value) => {
        if (value === "0") {
            setTextArc(0)
            curLayer.textStyle.arc = 0
            DesignTextLayer(curLayer, frameScale)
            curProduct.previewUpdated = false
        } else {
            if (value <= 360 && value >= -360) {
                setTextArc(value)
                curLayer.textStyle.arc = value
                DesignTextLayer(curLayer, frameScale)
                curProduct.previewUpdated = false
            }
        }
    }

    const onChangeTextTypeFace = (value) => {
        if (value) {
            const font = listFonts.find(font => font.id === value)
            if (curLayer) {
                setTypeFace(font)
                curLayer.textStyle.typeFace = font
                curLayer.displayText = validCharacter(curLayer.textPreview, font)
                DesignTextLayer(curLayer, frameScale, true)
            }
            setCurLayer(curLayer)
            curProduct.previewUpdated = false
        }
    }

    // const changeTextPreviewArtworkEditor=(e)=>{
    //     const currentProduct = product.userProducts[designState.currentProductIndex]
    //     if (currentProduct) {
    //         const listProduct = currentProduct.artworks.filter((art) => art.side === designState.currentSideId)
    //         if (listProduct.length > 0) {
    //             const currentLayer = listProduct.find((layer) => layer.layerIndex === designState.currentLayerIndex)
    //             if (currentLayer) {
    //                 setTextPreviewLayer(e)
    //                 currentLayer.textPreview=e
    //             }
    //         }
    //     }
    // }

    const changeTextPreviewLayer = (e) => {
        if (curLayer) {
            curLayer.textPreview = e
            curLayer.displayText = validCharacter(e, curLayer.textStyle.typeFace)
            DesignTextLayer(curLayer, frameScale)
        }
        setCurLayer(curLayer)
        curProduct.previewUpdated = false
        setWaitLoadingText(false)
    }

    const changeTextPreview = (e) => {
        let result = e
        // console.log("text1234",e,/^[\\x01-\\x7F]*$/.test(e))
        setWaitLoadingText(true)
        clearTimeout(previewTextTimeout)
        result = result.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
        if (curLayer) {
            setTextPreview(result)
        }
        const timeout = setTimeout(() => {
            changeTextPreviewLayer(result)
        }, TIME_DELAY)
        setPreviewTextTimeout(timeout)
    }

    const handleTabChange = (selectedTabIndex) => {
        setViewState(VIEW_STATE.DESIGN)
        const side = product.abstract.sides[selectedTabIndex]
        setSelectedSide(selectedTabIndex)
        setDesignState({currentSideId: side.id})
        // setStepTut(stepTut + 1)
    }

    // const handleViewChange = (view) => {
    //     setViewState(view)
    // }

    useEffect(() => {
        if (product.userProducts.length === 0) {
            setViewState(VIEW_STATE.DESIGN)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product])


    useEffect(() => {
        setViewState(VIEW_STATE.DESIGN)
        const side = product.abstract.sides.filter(e => e.id === designState.currentSideId)
        setSelectedSide(product.abstract.sides.indexOf(side[0]))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [designState.currentSideId, designState.currentProductIndex, product.abstract.sides])

    // const changeView = (e) => {
    //     setViewState(e.target.value)
    // }
    //
    // const changeDesignView = (e) => {
    //     setViewState(VIEW_STATE.DESIGN)
    //     setDesignState({currentSideId: e.target.value})
    //     setStepTut(stepTut + 1)
    // }

    const renderDesignSection = () => <DesignView/>

    const mockupInfo = getMockupInfo(product.abstract, designState.currentVariant)
    const hasErrorToPreview = currentProductIsAbleToPreview()

    const [prevLayerIndex, setPrevLayerIndex] = useState(-1)
    const [maxHighLayerList, setMaxHighLayerList] = useState(550)


    const getHighLayerList = () => {
        const sideTabs = document.querySelector("#side-tabs")
        const designTabs = document.querySelector("#design-tabs")
        const instructionCard = document.querySelector("#instruction-card")
        const addLayer = document.querySelector("#add-layer-div")
        if (sideTabs) {
            const highDesignTabs = designTabs ? designTabs.offsetHeight : 0
            const highInstructionCard = instructionCard ? instructionCard.offsetHeight : 0
            const highAddLayer = addLayer ? addLayer.offsetHeight : 0
            const highSideTabs = sideTabs ? sideTabs.offsetHeight : 0
            setMaxHighLayerList(highSideTabs - highAddLayer - highInstructionCard - highDesignTabs - 60)
        } else {
            setMaxHighLayerList(550)
        }
    }

    useEffect(() => {
        setTimeout(() => {
            getHighLayerList()
        }, 500)
        window.addEventListener("resize", () => {
            getHighLayerList()
        })
    }, [])

    const [previewTextTimeout, setPreviewTextTimeout] = useState(null)
    const [waitLoadingText, setWaitLoadingText] = useState(false)
    const [waitLoadingArc, setWaitLoadingArc] = useState(false)
    // const [arcTimeout, setArcTimeout] = useState(null)


    const handleRangeSliderTextArcChange = useCallback((value) => {
        setWaitLoadingArc(false)
        // clearTimeout(arcTimeout)
        if (curLayer) {
            setTextArc(value)
        }
        changeArcLayer(value)

        // const timeout = setTimeout(() => {
        //     changeArcLayer(value)
        // }, TIME_DELAY)
        // setArcTimeout(timeout)

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curLayer, frameScale, curProduct, changeArcLayer])

    const [DivFont, setDivFont] = useState(styled.div``)
    const [DivFirstFont, setDivFirstFont] = useState(styled.div``)

    const generateListFont = () => {
        let result = ""
        listFonts.forEach((font) => {
            result += generateFont(font)
        })
        return result
    }

    useEffect(() => {
        if (listFonts[0]) {
            setDivFirstFont(styled.div`${generateFont(listFonts[0])}`)
        }
        setDivFont(styled.div`${generateListFont()}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listFonts])


    const generateFont = (font) => {
        return `
            @font-face{
                font-family: '${font.title}';
                src: url(${font.font_url}) format('truetype');
            }
        `
    }


    if ((hasErrorToPreview && viewState === VIEW_STATE.PREVIEW)) {
        setViewState(VIEW_STATE.DESIGN)
        return <div/>
    }


    const sideTabs = product.abstract.sides.map(side => {
        return {
            id: side.id,
            content: (<div className={'choose-side-btn'}
                           id={`tab-side-${side.type.replaceAll(" ", "-").toLowerCase()}`}>{side.type.toUpperCase()}</div>),
            accessibilityLabel: side.type,
            body: renderDesignSection(),
            panelID: side.type,
        }
    })

    const enableFunctionButton = product.userProducts && product.userProducts.length > 0
    const enableArtWork = enableFunctionButton && curLayer && curLayer.type === LAYER_TYPE.artwork
    const enableTextPersonalize = enableFunctionButton && curLayer && curLayer.type === LAYER_TYPE.text
    const hasColorAttribute = !!product.attributes.Color

    const designSectionClass = viewState === VIEW_STATE.DESIGN ? "design-section-design-view design-section" : "design-section"

    const handleClickChangeLayer = (layerIndex, change = true) => {
        if (change) {
            setDesignState({currentLayerIndex: layerIndex})
        } else {
            setDesignState({currentLayerIndex: designState.currentLayerIndex})
        }
    }

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list)
        const [removed] = result.splice(startIndex, 1)
        result.splice(endIndex, 0, removed)
        result.forEach((item, index) => {
            item.layerIndex = result.length - 1 - index
        })
        return result
    }


    const onDragStart = (start) => {
        setDesignState({currentLayerIndex: -1})
        setPrevLayerIndex(designState.currentLayerIndex)
    }

    const onDragEnd = (result) => {
        if (result.destination && result.destination.index !== result.source.index) {
            const currentLayer = listDesignLayers[result.source.index]
            const list = reorder(
                listDesignLayers,
                result.source.index,
                result.destination.index
            )
            product.userProducts[designState.currentProductIndex].previewUpdated = false
            setDesignState({currentLayerIndex: currentLayer.layerIndex})
            setListDesignLayers(list)
            setProduct(product)
        } else {
            setDesignState({currentLayerIndex: prevLayerIndex})
        }
        setPrevLayerIndex(-1)
    }

    const handleRemoveArtwork = (layerIndex) => {
        const lengthArtworkLayer = removeArtwork(designState.currentSideId, designState.currentProductIndex, layerIndex)
        const currentProduct = product.userProducts[designState.currentProductIndex]
        if (!currentProduct) {
            setDesignState({currentProductIndex: designState.currentProductIndex - 1})
        } else {
            if (designState.currentLayerIndex > lengthArtworkLayer) {
                setDesignState({currentLayerIndex: lengthArtworkLayer})
            } else if (designState.currentLayerIndex > 1) {
                setDesignState({currentLayerIndex: designState.currentLayerIndex - 1})
            }
        }
        updateLayer()
    }

    const handleCloneLayer = (layerIndex) => {
        if (currentNumberArtworks < MAX_LAYER) {
            const lastLayerIndex = duplicateLayer(designState.currentProductIndex, designState.currentSideId, layerIndex)
            const currentProduct = product.userProducts[designState.currentProductIndex]
            if (currentProduct) {
                setDesignState({currentLayerIndex: lastLayerIndex})
            }
        } else {
            errorLimitLayer(MAX_LAYER, currentNumberArtworks, true)
        }
    }

    const imageDesignGroupButton = () => {
        return (
            // <div className="row px-3 design-button-group display-none"
            <div className="row px-3 design-button-group"
                 style={{position: "relative"}}>
                <NotAllowDiv
                    isDisable={viewState === VIEW_STATE.PREVIEW}
                    message={"Please change to design"}
                />
                <hr/>
                {/*<div className="col-12 mb-2">*/}
                {/*<strong style={{fontSize: "14px"}}>Position</strong>*/}
                {/*</div>*/}
                <div className="col-lg-3 px-2">
                    <ShadowIconButton
                        onClick={() => positionArtwork(PRE_POSITION.VERTICAL)}
                        icon={faGripLinesVertical}
                        tooltip={PRE_POSITION.VERTICAL}
                        placement={"top"}
                        id={"btn-vertical"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-3 px-2">
                    <ShadowIconButton
                        onClick={() => positionArtwork(PRE_POSITION.HORIZON)}
                        icon={faGripLines}
                        tooltip={PRE_POSITION.HORIZON}
                        placement={"top"}
                        id={"btn-horizon"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-3 px-2">
                    <ShadowIconButton
                        onClick={() => positionArtwork(PRE_POSITION.LEFT)}
                        icon={faArrowLeft}
                        tooltip={PRE_POSITION.LEFT}
                        placement={"top"}
                        id={"btn-left"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-3 px-2">
                    <ShadowIconButton
                        onClick={() => positionArtwork(PRE_POSITION.RIGHT)}
                        icon={faArrowRight}
                        tooltip={PRE_POSITION.RIGHT}
                        placement={"top"}
                        id={"btn-right"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-3 px-2">
                    <ShadowIconButton
                        onClick={() => positionArtwork(PRE_POSITION.TOP)}
                        icon={faArrowUp}
                        tooltip={PRE_POSITION.TOP}
                        placement={"top"}
                        id={"btn-top"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-3 px-2">
                    <ShadowIconButton
                        onClick={() => positionArtwork(PRE_POSITION.BOTTOM)}
                        icon={faArrowDown}
                        tooltip={PRE_POSITION.BOTTOM}
                        placement={"top"}
                        id={"btn-bottom"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-3 px-2">
                    <ShadowIconButton
                        onClick={() => positionArtwork(PRE_POSITION.FILL)}
                        icon={faArrowsAltH}
                        tooltip={PRE_POSITION.FILL}
                        placement={"top"}
                        id={"btn-fill"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-3 px-2">
                    <ShadowIconButton
                        onClick={() => positionArtwork(PRE_POSITION.FIT)}
                        icon={faArrowsAltV}
                        tooltip={PRE_POSITION.FIT}
                        placement={"top"}
                        id={"btn-fit"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-3 px-2">
                    <ShadowIconButton
                        onClick={() => positionArtwork(PRE_POSITION.RESET)}
                        icon={faSync}
                        tooltip={PRE_POSITION.RESET}
                        placement={"bottom"}
                        id={"btn-reset"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-6 px-2">
                    <div className="row">
                        {/*<div className="col-12 mb-2">*/}
                        {/*<strong style={{fontSize: "14px"}}>Rotate</strong>*/}
                        {/*</div>*/}
                        <div className="col-12">
                            <NumberFormButton
                                id={"rotation"}
                                value={rotateValue}
                                onChangeInput={onChangeRotateValue}
                                onClickMinus={onClickMinus}
                                onClickPlus={onClickPlus}
                                tooltip={"Rotate this artwork"}
                                defaultIcon={false}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 px-2 col-half-left">
                    <ShadowIconButton
                        onClick={() => positionArtwork(PRE_POSITION.REMOVE)}
                        icon={faTrash}
                        tooltip={PRE_POSITION.REMOVE}
                        placement={"bottom"}
                        id={"btn-remove"}
                        // isDisable={!(enableFunctionButton)}
                        //               status={BUTTON_CONFIGS.DANGER.name}
                    />
                </div>

            </div>
        )
    }

    const imageTextDesignGroupButton = () => {
        return (
            // <div className="row px-3 design-button-group display-none"
            <div className="row px-3 design-button-group"
                 style={{position: "relative"}}>
                <NotAllowDiv
                    isDisable={viewState === VIEW_STATE.PREVIEW}
                    message={"Please change to design"}
                />
                <hr/>
                {/*<div className="col-12 mb-2">*/}
                {/*<strong style={{fontSize: "14px"}}>Position</strong>*/}
                {/*</div>*/}
                <div className="col-lg-6 px-2">
                    <ShadowIconButton onClick={() => positionArtwork(PRE_POSITION.VERTICAL)}
                                      icon={faGripLinesVertical}
                                      tooltip={PRE_POSITION.VERTICAL}
                                      placement={"top"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-6 px-2">
                    <ShadowIconButton onClick={() => positionArtwork(PRE_POSITION.HORIZON)}
                                      icon={faGripLines}
                                      tooltip={PRE_POSITION.HORIZON}
                                      placement={"top"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-3 px-2">
                    <ShadowIconButton onClick={() => positionArtwork(PRE_POSITION.LEFT)}
                                      icon={faArrowLeft}
                                      tooltip={PRE_POSITION.LEFT}
                                      placement={"top"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-3 px-2">
                    <ShadowIconButton onClick={() => positionArtwork(PRE_POSITION.RIGHT)}
                                      icon={faArrowRight}
                                      tooltip={PRE_POSITION.RIGHT}
                                      placement={"top"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-3 px-2">
                    <ShadowIconButton onClick={() => positionArtwork(PRE_POSITION.TOP)}
                                      icon={faArrowUp}
                                      tooltip={PRE_POSITION.TOP}
                                      placement={"top"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-3 px-2">
                    <ShadowIconButton onClick={() => positionArtwork(PRE_POSITION.BOTTOM)}
                                      icon={faArrowDown}
                                      tooltip={PRE_POSITION.BOTTOM}
                                      placement={"top"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                {/*<div className="col-lg-3 px-2">*/}
                {/*    <ShadowIconButton onClick={() => positionArtwork(PRE_POSITION.FILL)}*/}
                {/*                      icon={faArrowsAltH}*/}
                {/*                      tooltip={PRE_POSITION.FILL}*/}
                {/*                      placement={"top"}*/}
                {/*        // isDisable={!(enableFunctionButton)}*/}
                {/*    />*/}
                {/*</div>*/}
                {/*<div className="col-lg-3 px-2">*/}
                {/*    <ShadowIconButton onClick={() => positionArtwork(PRE_POSITION.FIT)}*/}
                {/*                      icon={faArrowsAltV}*/}
                {/*                      tooltip={PRE_POSITION.FIT}*/}
                {/*                      placement={"top"}*/}

                {/*        // isDisable={!(enableFunctionButton)}*/}
                {/*    />*/}
                {/*</div>*/}
                <div className="col-lg-3 px-2">
                    <ShadowIconButton onClick={() => positionArtwork(PRE_POSITION.RESET)}
                                      icon={faSync}
                                      tooltip={PRE_POSITION.RESET}
                                      placement={"bottom"}
                        // isDisable={!(enableFunctionButton)}
                    />
                </div>
                <div className="col-lg-6 px-2">
                    <div className="row">
                        {/*<div className="col-12 mb-2">*/}
                        {/*<strong style={{fontSize: "14px"}}>Rotate</strong>*/}
                        {/*</div>*/}
                        <div className="col-12">
                            <NumberFormButton
                                value={rotateValue}
                                onChangeInput={onChangeRotateValue}
                                onClickMinus={onClickMinus}
                                onClickPlus={onClickPlus}
                                tooltip={"Rotate this artwork"}
                                defaultIcon={false}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 px-2 col-half-left">
                    <ShadowIconButton onClick={() => positionArtwork(PRE_POSITION.REMOVE)}
                                      icon={faTrash}
                                      tooltip={PRE_POSITION.REMOVE}
                                      placement={"bottom"}
                        // isDisable={!(enableFunctionButton)}
                        //               status={BUTTON_CONFIGS.DANGER.name}
                    />
                </div>
            </div>
        )
    }

    const preloadFont = () => {
        return (
            <DivFont>
                <div style={{opacity: 0, fontFamily: typeFace.title}}>
                    design mockup
                </div>
            </DivFont>
        )
    }

    const textDesignGroupButton = () => {
        return (
            <div className="row px-3 design-button-group" style={{position: "relative"}}>
                {/*<div className="col-lg-12 px-2 mb10">*/}
                {/*    <TextField label="Placeholder name" value={"Placeholder name"}/>*/}
                {/*</div>*/}
                <NotAllowDiv
                    isDisable={viewState === VIEW_STATE.PREVIEW}
                    message={"Please change to design"}
                />
                <div className="col-lg-12 px-2 mb10">
                    <div className="flex-horizontal mb5" style={{height: 25}}>
                        <div>Text</div>
                        {(waitLoadingText || waitLoadingArc) && <Spin size={"small"}/>}
                    </div>
                    <TextField
                        id="preview_text"
                        label="Text"
                        disabled={viewState === VIEW_STATE.PREVIEW}
                        maxLength={50}
                        labelHidden={true}
                        value={textPreview}
                        multiline={false}
                        onChange={changeTextPreview}
                    />
                </div>
                <div className="col-lg-12 px-2 mb10">
                    <div className="row">
                        <div className="col-12 flex-horizontal mb5">

                            <div>Typeface</div>
                            <div className="d-none">
                                <Button
                                    primary={true}
                                    size={"slim"}
                                    icon={<FontAwesomeIcon icon={faCloudUploadAlt}/>}
                                >
                                    Upload font
                                </Button>
                            </div>
                        </div>
                        <div className="col-12">
                            <TextTypeFaceSelector
                                typeFace={typeFace}
                                onChangeTextTypeFace={onChangeTextTypeFace}
                                listFonts={listFonts}
                            />
                        </div>
                        {/*<div className="col-12 d-lg-none mt-2">*/}
                        {/*    <Button*/}
                        {/*        primary={true}*/}
                        {/*        size={"slim"}*/}
                        {/*        icon={<FontAwesomeIcon icon={faCloudUploadAlt}/>}*/}
                        {/*        fullWidth={true}*/}
                        {/*    >*/}
                        {/*        Upload font*/}
                        {/*    </Button>*/}
                        {/*</div>*/}
                    </div>
                </div>
                <div className="col-lg-6 px-2">
                    <div className="row">
                        <div className="col-12">
                            <DesignLabel text={"Text color"}/>
                        </div>
                        <div className="col-12">
                            <TextColorSelector sideArtworkTextColor={curLayer.textStyle.textColor}
                                               changeTextColor={onChangeTextColor}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6 px-2">
                    <div className="row">
                        <div className="col-12">
                            <DesignLabel text={"Text size"}/>
                        </div>
                        <div className="col-12">
                            <NumberFormButton
                                value={textSize}
                                onClickMinus={onClickTextSizeMinus}
                                onClickPlus={onClickTextSizePlus}
                                onChangeInput={onChangeTextSizeTargetValue}
                                tooltip={"Resize text"}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-lg-12 px-2 mb10">
                    <div className="row">
                        <div className="col-12 flex-horizontal">
                            <DesignLabel text={"Arc"}/>
                        </div>
                        <div className="col-12 flex-horizontal">
                            <div style={{flex: "0 1 80%"}}>
                                <RangeSlider
                                    output
                                    label="Arc"
                                    labelHidden={true}
                                    min={-360}
                                    max={360}
                                    value={textArc}
                                    onChange={handleRangeSliderTextArcChange}
                                />
                            </div>
                            <div style={{width: 60}}>
                                <TextField
                                    label={"arc"}
                                    labelHidden={true}
                                    type={"number"}
                                    value={textArc.toString()}
                                    align={"center"}
                                    onChange={onChangeTextArc}
                                    disabled={viewState === VIEW_STATE.PREVIEW}
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <DesignLabel text={"Spacing"}/>
                        </div>
                        <div className="col-12">
                            <NumberFormButton
                                value={textLetterSpacing}
                                onClickMinus={onClickTextLetterSpacingMinus}
                                onClickPlus={onClickTextLetterSpacingPlus}
                                onChangeInput={onChangeTextLetterSpacingValue}
                                tooltip={"Set letter spacing"}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="view-container w-100">
            <div className="mockup-container p1em">
                <DivFirstFont>
                    {
                        listFonts[0]
                        && (
                            <div style={{fontFamily: `"${listFonts[0].title}"`, opacity: 0, position: "absolute"}}>
                                render
                            </div>
                        )
                    }
                </DivFirstFont>
                <Row>
                    <Col span={24}>
                        <Row>
                            <Col span={4} className="mockup-background-area" style={{paddingRight: "0em"}}>
                                {
                                    hasColorAttribute &&
                                    <ColorSelector multiple={true} mockupInfo={mockupInfo}/>
                                }
                                {
                                    (sideData && sideData.enable_background_color) &&
                                    <BackgroundColorSelector
                                        isDisable={viewState === VIEW_STATE.PREVIEW}
                                        visible={backGroundColorVisible}
                                        onChangeBGRColorVisible={onChangeBGRColorVisible}
                                    />
                                }
                                {
                                    enableTextPersonalize && textDesignGroupButton()
                                }
                                {
                                    enableArtWork && imageDesignGroupButton()
                                }
                                {
                                    enableTextPersonalize && imageTextDesignGroupButton()
                                }
                            </Col>
                            <Col span={14} className="px-4 mockup-design-area">
                                {
                                    viewState === VIEW_STATE.DESIGN && (
                                        <div className="design-card" id="side-tabs">
                                            <Card>
                                                <Tabs tabs={sideTabs} selected={selectedSide}
                                                      onSelect={handleTabChange}
                                                      fitted>
                                                    <div className={designSectionClass}
                                                         style={{
                                                             padding: "1.25em",
                                                             minHeight: DESIGN_SECTION_SQUARE_SIZE
                                                         }}>
                                                        <DesignView
                                                            prePosition={prePosition} rotation={rotateValue}
                                                            setRotation={setRotateValue}
                                                            textPreview={textPreview}
                                                            resizeorScaleOrDragTextPreview={resizeOrScaleOrDrag}
                                                            changeTextPreviewArtwork={changeTextPreview}
                                                            changeTextSize={onChangeTextSizeValue}
                                                            textColor={textColor}
                                                            textTypeFace={typeFace.title}
                                                            textArc={textArc}
                                                            textLetterSpacing={textLetterSpacing}
                                                            textLoading={waitLoadingText || waitLoadingArc}
                                                        />
                                                    </div>
                                                </Tabs>
                                            </Card>
                                        </div>
                                    )
                                }
                                {
                                    viewState === VIEW_STATE.PREVIEW && <MockupPreviewTabContent product={product}/>
                                }
                            </Col>
                            <Col span={6} className="mockup-tool-area" style={{padding: "0 0 0 0em"}}>

                                <div className="design-button-tabs" id="design-tabs">
                                    {/*<ButtonGroup fullWidth={true} segmented={true}>*/}
                                    {/*    <VerticalIconButton*/}
                                    {/*        onClick={() => handleViewChange(VIEW_STATE.DESIGN)}*/}
                                    {/*        isActive={viewState === VIEW_STATE.DESIGN}*/}
                                    {/*        isDisable={false}*/}
                                    {/*        text={"DESIGN"}*/}
                                    {/*        tooltip={"Design"}*/}
                                    {/*        id={"btn-design"}*/}
                                    {/*    />*/}
                                    {/*    {*/}
                                    {/*        (mockupInfo && mockupInfo.preview_meta.enable_preview === 1) && (*/}
                                    {/*            <VerticalIconButton*/}
                                    {/*                id={"btn-preview"}*/}
                                    {/*                onClick={() => handleViewChange(VIEW_STATE.PREVIEW)}*/}
                                    {/*                isActive={viewState === VIEW_STATE.PREVIEW}*/}
                                    {/*                isDisable={!(mockupInfo && mockupInfo.preview_meta.enable_preview) || hasErrorToPreview}*/}
                                    {/*                text={"PREVIEW"}*/}
                                    {/*                tooltip={hasErrorToPreview || "Preview your mockups"}*/}
                                    {/*            />*/}
                                    {/*        )*/}
                                    {/*    }*/}
                                    {/*</ButtonGroup>*/}

                                </div>

                                {
                                    enableFunctionButton
                                    &&
                                    <div>
                                        <Row id="instruction-card">
                                            <Card
                                                title="Artwork instructions"
                                                status="info"
                                            >
                                                <div style={{padding: "1.25rem"}}>
                                                    <p className={"mb-1"}>Minimum DPI: <b>{minimumDPI}</b></p>
                                                    {
                                                        sideFusionSize &&
                                                        <p className={"mb-1"}>Print
                                                            area: <b>{sideFusionSize.width}x{sideFusionSize.height}px</b>
                                                        </p>
                                                    }
                                                    <p>Color mode: <b>CMYK</b></p>
                                                </div>

                                            </Card>
                                        </Row>
                                        <AddLayer isDisable={viewState === VIEW_STATE.PREVIEW}/>
                                        {
                                            currentNumberArtworks > 0
                                            && (
                                                <div>
                                                    <DragDropContext
                                                        onDragStart={onDragStart}
                                                        onDragEnd={onDragEnd}
                                                    >
                                                        <Droppable droppableId="droppable">
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    {...provided.droppableProps}
                                                                    ref={provided.innerRef}
                                                                    style={{position: "relative"}}
                                                                >
                                                                    <NotAllowDiv
                                                                        isDisable={viewState === VIEW_STATE.PREVIEW}
                                                                        message={"Please change to design"}
                                                                        placement={"leftTop"}
                                                                    />
                                                                    <div
                                                                        className="step-drag-layer"
                                                                        style={{
                                                                            height: `${maxHighLayerList}px`,
                                                                            overflowY: "auto",
                                                                            paddingLeft: 4,
                                                                            paddingRight: 4
                                                                        }}
                                                                    >
                                                                        {
                                                                            listDesignLayers.map((artwork, index) => {
                                                                                let upload = null;
                                                                                if (artwork.uploadID) {
                                                                                    upload = uploadManager.find(upload => upload.id === artwork.uploadID)
                                                                                }
                                                                                const artworkErrorCode = checkLayerSideConstraints(artwork, sideData, upload)
                                                                                return (
                                                                                    <Draggable key={index}
                                                                                               draggableId={`${artwork.id}_${index}`}
                                                                                               index={index}>
                                                                                        {(provided, snapshot) => (
                                                                                            <div
                                                                                                ref={provided.innerRef}
                                                                                                {...provided.draggableProps}
                                                                                                {...provided.dragHandleProps}
                                                                                                className={`fullWidth mt-2 ${artwork.layerIndex === designState.currentLayerIndex ? "active" : ""} `}>
                                                                                                <LayerElement
                                                                                                    artwork={artwork}
                                                                                                    onRemove={() => handleRemoveArtwork(artwork.layerIndex)}
                                                                                                    onClone={() => handleCloneLayer(artwork.layerIndex)}
                                                                                                    onClick={(change = true) => handleClickChangeLayer(artwork.layerIndex, change)}
                                                                                                    artworkErrorCode={artworkErrorCode}
                                                                                                    side={sideData}
                                                                                                    dpi={getArtworkDPI(artwork, sideData)}
                                                                                                    minDpi={minimumDPI}
                                                                                                    setProduct={setProduct}
                                                                                                    product={product}
                                                                                                    currentProductIndex={designState.currentProductIndex}
                                                                                                />
                                                                                            </div>
                                                                                        )}
                                                                                    </Draggable>
                                                                                )
                                                                            })
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    </DragDropContext>
                                                    <div className="mt-3">
                                                        <b>Layer: </b>{currentNumberArtworks}/{MAX_LAYER}
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                }
                            </Col>
                        </Row>
                    </Col>
                    <Col span={24}>
                        <Row>
                            <Col span={24} className={'mt-4'}>
                                {/*<ProductDescription/>*/}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
            {preloadFont()}
        </div>
    )
}

export default DesignContainer
