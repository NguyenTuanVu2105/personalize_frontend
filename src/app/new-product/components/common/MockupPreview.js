import React, {useContext, useEffect, useState} from 'react'
import './MockupPreview.scss'
import {parseMockupInfo} from '../../helper/parseMockupInfo'
import UploadArtwork from '../design/components/artwork-view/upload-artwork/UploadArtwork'
import MockupEditor from './MockupEditor'
import {DEFAULT_BACKGROUND_COLOR, DESIGN_SECTION_SQUARE_SIZE, LAYER_TYPE, PRE_POSITION} from '../../constants/constants'
import NewProductContext from '../../context/NewProductContext'
import {getMockupInfo} from "../../helper/getMockupInfo"
import NewProductDesignContext from "../design/context/NewProductDesignContext"
import MockupTextEditor from "./MockupTextEditor";

const BASE_IMAGE_Z_INDEX = 2

const MockUpPreview = (props) => {
    const {
        id,
        color,
        width,
        artworkInfo,
        onClick,
        unit,
        mockupInfo,
        constraints,
        sideId,
        onFinishUploadArtwork,
        startTriggerRerendering,
        clearTriggerRerendering,
        isDesign,
        preview_meta,
        currentProductIndex,
        prePosition,
        rotation,
        setRotation,
        // textPreview,
        resizeorScaleOrDragTextPreview,
        changeTextPreviewArtwork,
        changeTextSize,
        textColor,
        textTypeFace,
        textArc,
        textLetterSpacing
    } = props
    const mockup = parseMockupInfo(mockupInfo)
    const {designState, setFrameScale} = useContext(NewProductDesignContext)
    const {product, hasColorAttribute} = useContext(NewProductContext)
    let scale = width / mockup.imageWidth
    const frameRatio = mockup.frameWidth / mockup.frameHeight

    // console.log("mockup ",mockup)

    const scaleFrameWidth = width * (mockup.frameWidth / mockup.imageWidth)
    const scaleFrameHeight = width * (mockup.frameHeight / mockup.imageHeight)
    const scaleFrameTop = scale * (mockup.frameCenterY - mockup.frameHeight / 2)
    const scaleFrameLeft = scale * (mockup.frameCenterX - mockup.frameWidth / 2)
    const productMockupInfo = getMockupInfo(product.abstract, designState.currentVariant)
    const colorAttrInteractive = productMockupInfo && productMockupInfo.preview_meta.color_attr_interactive === 1

    const frame = (
        <div className="artwork-wrapper frame-wrapper"
             style={{
                 left: `${scaleFrameLeft}${unit}`,
                 top: `${scaleFrameTop}${unit}`,
                 width: `${scaleFrameWidth}${unit}`,
                 height: unit === '%' && (scaleFrameHeight >= 100) ? `100%` : `${scaleFrameHeight}${unit}`,
                 zIndex: 10,
                 overflow: 'hidden',
                 pointerEvents: 'none'
             }}>
            <div className={'print-area-note'}>Artwork must cover this area</div>
        </div>
    )

    const [backgroundColor, setBackgroundColor] = useState(null)

    useEffect(() => {
        fetchColor()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [designState.currentProductIndex, designState.currentSideId, product])

    const fetchColor = () => {
        const defaultMaterialColor = product.defaultBackgroundColor
        const currentProduct = product.userProducts[designState.currentProductIndex]
        let sideLayer = null
        if (currentProduct) {
            sideLayer = currentProduct.sideLayers.find((s) => s.side.id === designState.currentSideId)
        }
        const sideBackgroundColor = sideLayer ? sideLayer.backgroundColor : defaultMaterialColor ? defaultMaterialColor.toUpperCase() : null
        const backgroundColor = sideBackgroundColor ? sideBackgroundColor : DEFAULT_BACKGROUND_COLOR
        setBackgroundColor(backgroundColor)
    }

    const artwork = (!!artworkInfo[0] && artworkInfo[0].data) ? (
        <div id={`moveableWrapper-${id}`} className="artwork-wrapper"
             style={{
                 // left: `${scaleFrameLeft}${unit}`,
                 top: `${scaleFrameTop}${unit}`,
                 height: unit === '%' && (scaleFrameHeight >= 100) ? `100%` : `${scaleFrameHeight}${unit}`,
                 textAlign: 'left',
                 zIndex: preview_meta.z_index || 0,
                 overflow: 'visible'
             }}>
            {
                artworkInfo.map((info, index) => {
                    if (info.type === LAYER_TYPE.text) {
                        return <MockupTextEditor
                            key={index}
                            id={id}
                            width={`${scaleFrameWidth}${unit}`}
                            left={`${scaleFrameLeft}${unit}`}
                            sideArtwork={info || {}}
                            elements={[{
                                id: BASE_IMAGE_Z_INDEX + index,
                                artworkInfo: info
                            }]}
                            mockup={mockup}
                            frameRatio={frameRatio}
                            isDesign={isDesign}
                            prePosition={prePosition || ['']}
                            rotation={rotation || 0}
                            setRotation={setRotation}
                            resizeorScaleOrDragTextPreview={resizeorScaleOrDragTextPreview}
                            prePositionConst={PRE_POSITION}
                            sideId={sideId}
                            sides={product.abstract.sides}
                            currentProductIndex={currentProductIndex}
                            currentLayerIndex={designState.currentLayerIndex}
                            changeTextPreviewArtwork={changeTextPreviewArtwork}
                            changeTextSize={changeTextSize}
                            textColor={textColor}
                            textTypeFace={textTypeFace}
                            textArc={textArc}
                            textLetterSpacing={textLetterSpacing}
                        />
                    } else {
                        return <MockupEditor
                            key={index}
                            id={id}
                            width={`${scaleFrameWidth}${unit}`}
                            left={`${scaleFrameLeft}${unit}`}
                            sideArtwork={info || {}}
                            elements={[{
                                id: BASE_IMAGE_Z_INDEX + index,
                                artworkInfo: info
                            }]}
                            frameRatio={frameRatio}
                            isDesign={isDesign}
                            prePosition={prePosition || ['']}
                            rotation={rotation || 0}
                            setRotation={setRotation}
                            prePositionConst={PRE_POSITION}
                            sideId={sideId}
                            currentProductIndex={currentProductIndex}
                            currentLayerIndex={designState.currentLayerIndex}
                        />
                    }
                })


            }
        </div>
    ) : <div className="artwork-wrapper step-1"
             style={{
                 top: `${scaleFrameTop}${unit}`,
                 height: unit === '%' && (scaleFrameHeight >= 100) ? `100%` : `${scaleFrameHeight}${unit}`,
                 left: `${scaleFrameLeft}${unit}`,
                 width: `${scaleFrameWidth}${unit}`,
                 right: 0,
                 bottom: 0,
                 zIndex: 2,
                 overflow: 'visible'
             }}
    >
        <UploadArtwork constraints={constraints}
                       onFinishUpload={(artworks) => onFinishUploadArtwork(artworks, sideId)}
                       startTriggerRerendering={startTriggerRerendering}
                       clearTriggerRerendering={clearTriggerRerendering}
                       preview={true}
                       style={{
                           top: `${scaleFrameTop + scaleFrameHeight / 6}${unit}`,
                           left: `${scaleFrameLeft + scaleFrameWidth / 6}${unit}`,
                           width: `${scaleFrameWidth * 2 / 3}${unit}`,
                           position: 'absolute',
                       }}
                       sideId={sideId}
        />
    </div>

    const renderBackgroundImage = () => {
        const element = document.querySelector(".design-section-design-view")
        const ratio = mockup.imageHeight / mockup.imageWidth
        let overWidth = false
        if (element) {
            //Padding 1.25rem = 17.5px
            const currentWidth = element.offsetWidth - 17.5 * 2
            if ((DESIGN_SECTION_SQUARE_SIZE / ratio) > currentWidth) {
                overWidth = true
            }
        }

        const style = {
            width: ratio > 1 ? (overWidth ? `${width}${unit}` : "unset") : `${width}${unit}`,
            height: ratio > 1 ? (overWidth ? "unset" : DESIGN_SECTION_SQUARE_SIZE) : "unset",
            position: 'relative',
            zIndex: 2,
            pointerEvents: 'none',
        }
        return <img
            id="backgroundImage"
            src={`${mockup.imagePath}`}
            alt='preview-mockup'
            onClick={onClick}
            style={style}/>
    }


    const calculateFrameScale = () => {
        let interval = null
        const getContainer = () => {
            const container = document.querySelector("#backgroundImage")
            if (container && container.offsetHeight && container.offsetWidth) {
                const ratio = mockup.imageHeight / mockup.imageWidth
                if (ratio > 1) {
                    setFrameScale(container.offsetHeight / DESIGN_SECTION_SQUARE_SIZE)
                } else {
                    setFrameScale(container.offsetWidth / DESIGN_SECTION_SQUARE_SIZE)
                }
                clearInterval(interval)
                return true
            } else {
                return false
            }
        }
        if (!getContainer()) interval = setInterval(getContainer, 100)
    }

    useEffect(() => {
        calculateFrameScale()
        window.addEventListener("resize", calculateFrameScale)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <div className="mockup-image-preview" style={{
            background: `${hasColorAttribute() && colorAttrInteractive ? color : backgroundColor}`,
            width: `${width}${unit}`,
        }}>
            {frame}<div id={`hidden1`}/>
            {renderBackgroundImage()}
            {artwork}
        </div>
    )
}

export default MockUpPreview
