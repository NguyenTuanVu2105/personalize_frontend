import React, {useContext, useEffect, useRef, useState} from 'react'
import NewProductContext from '../../../context/NewProductContext'
import NewProductDesignContext from '../context/NewProductDesignContext'
import MockUpPreview from '../../common/MockupPreview'
import {getMockupInfo, getMockupInfoSide} from '../../../helper/getMockupInfo'
import {getVariantColor} from '../../../helper/getVariantColor'
import _ from "lodash"

const DesignView = (props) => {
    const {
        prePosition,
        rotation,
        setRotation,
        textPreview,
        resizeorScaleOrDragTextPreview,
        changeTextPreviewArtwork,
        changeTextSize,
        textColor,
        textTypeFace,
        textArc,
        textLetterSpacing,
        textLoading
    } = props
    const {product, setProduct, appendArtworkToSide} = useContext(NewProductContext)
    const {designState, setDesignState} = useContext(NewProductDesignContext)
    const interval = useRef()
    const mockupInfo = getMockupInfoSide(product.abstract, designState.currentSideId, designState.currentVariant)
    const preview_meta = getMockupInfo(product.abstract, designState.currentVariant)
        ? getMockupInfo(product.abstract, designState.currentVariant).preview_meta : true

    const [listArtWorks, setListArtworks] = useState([])

    const [curProduct, setCurProduct] = useState(null)
    const [curSideLayer, setCurSideLayer] = useState(null)


    useEffect(() => {
        if (curProduct) {
            setCurSideLayer(curProduct.sideLayers.find((s) => s.side.id === designState.currentSideId))
        }
    }, [designState.currentSideId, curProduct])

    useEffect(() => {
        setCurProduct(product.userProducts[designState.currentProductIndex])
    }, [designState.currentProductIndex, product.userProducts])


    useEffect(() => {
        let result = []
        if (curSideLayer) {
            result = curSideLayer.layers
            result = _.orderBy(result, ["layerIndex"], ["asc"])
        }
        setListArtworks(result)
        // setDesignState({currentLayerIndex: result.length})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curSideLayer, designState.currentLayerIndex, curSideLayer && curSideLayer.layers.length, textTypeFace, textArc, textLetterSpacing, textLoading])
    if (!mockupInfo) return (<div/>)

    const constraints = product.abstract.sides.find(item => item.side = designState.currentSideId).constraints

    const setDesignViewState = (sideId, productIndex, layerIndex) => {
        setDesignState({currentSideId: sideId, currentProductIndex: productIndex, currentLayerIndex: layerIndex})
    }

    const startTriggerRerendering = () => {
        interval.current = setInterval(() => {
            // console.log("Rerendering")
            setDesignState({updating: true})
            setProduct({updating: true})
        }, 200)
    }

    const clearTriggerRerendering = () => {
        setTimeout(() => {
            clearInterval(interval.current)
            setDesignState({updating: false})
            setProduct({updating: false})
        }, 200)
    }

    const onFinishUploadArtwork = (artworks, sideId) => {
        const lastLayerIndex = appendArtworkToSide(artworks, sideId, designState.currentProductIndex)
        setDesignViewState(sideId, designState.currentProductIndex, lastLayerIndex)
    }

    const currentColor = getVariantColor(designState.currentVariant)

    return (
        <div className="design-container">
            <div className="row no-gutters flex-center flex-middle mx-0">
                <div className="no-gutters" style={{width: "100%"}}>
                    <MockUpPreview
                        color={currentColor}
                        width="100"
                        artworkInfo={listArtWorks}
                        unit="%"
                        mockupInfo={mockupInfo}
                        showFrame={true}
                        sideId={designState.currentSideId}
                        constraints={constraints}
                        onFinishUploadArtwork={onFinishUploadArtwork}
                        startTriggerRerendering={startTriggerRerendering}
                        clearTriggerRerendering={clearTriggerRerendering}
                        isDesign={true}
                        preview_meta={preview_meta}
                        id={'design'}
                        currentProductIndex={designState.currentProductIndex}
                        prePosition={prePosition}
                        rotation={rotation}
                        setRotation={setRotation}
                        textPreview={textPreview}
                        resizeorScaleOrDragTextPreview={resizeorScaleOrDragTextPreview}
                        changeTextPreviewArtwork={changeTextPreviewArtwork}
                        changeTextSize={changeTextSize}
                        textColor={textColor}
                        textTypeFace={textTypeFace}
                        textArc={textArc}
                        textLetterSpacing={textLetterSpacing}
                    />
                </div>
            </div>
        </div>
    )
}

export default DesignView
