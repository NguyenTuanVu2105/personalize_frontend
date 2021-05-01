import React, {useContext, useEffect, useRef, useState} from 'react'
import NewProductContext from '../../../../context/NewProductContext'
import UploadArtwork from './upload-artwork/UploadArtwork'
import DraggableArtworkItem from './artwork-item/DraggableArtworkItem'
import ArtworkItemContainer from './artwork-item/ArtworkItemContainer'
import NewProductDesignContext from '../../context/NewProductDesignContext'
import {Element} from 'react-scroll'
import {Button, Tooltip} from 'antd'
import MultiSideUploadArtwork from './multi-side-upload-artwork/MultiSideUploadArtwork'
import {
    layerErrorToString,
    checkLayerSideConstraints,
    getArtworkDPI
} from '../../../../helper/checkArtworkConstraints'
import {Banner, Heading, Modal, TextContainer} from '@shopify/polaris'
import {getSessionStorage, SESSION_KEY, setSessionStorage} from '../../../../../../services/storage/sessionStorage'
import './ProductArtworkList.scss'
import {getLocalStorage, setLocalStorage} from '../../../../../../services/storage/localStorage'
import Paragraph from 'antd/lib/typography/Paragraph'
import {
    ARTWORK_ERROR_CODES,
    DEFAULT_DRAG,
    ERROR_DRAG,
    LAYER_ERRORS,
    SIZE_NOT_SIMILAR,
    VIEW_STATE
} from "../../../../constants/constants"
import UploadInfo from "../../../common/UploadInfo"
import {faPlus, faTimes} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import _ from "lodash"

const getProductElementId = (index) => `product-${index}`

const DEFAULT_REPLACE_INFO = {srcSideId: null, srcProductIndex: null, destSideId: null, destProductIndex: null}

const ProductArtworkList = (props) => {
    const {
        product,
        setProduct,
        uploadManager,
        appendArtworkToSide,
        replaceLayers,
        removeArtwork,
        removeAllArtworks,
        removeAllInvalidArtworks,
        addNewProduct,
        removeProduct
    } = useContext(NewProductContext)
    const {designState, setDesignState, reselectLayerIndex, setViewState} = useContext(NewProductDesignContext)
    const [removeAllProductConfirmModalDisplay, setRemoveAllProductConfirmModalDisplay] = useState(false)
    const [removeProductConfirmModalDisplay, setRemoveProductConfirmModalDisplay] = useState(false)
    const [replaceLayerConfirmModalDisplay, setReplaceLayerConfirmModalDisplay] = useState(false)
    const [replaceLayerInfo, setReplaceLayerInfo] = useState({...DEFAULT_REPLACE_INFO})
    const interval = useRef()

    const isMultipleUploadNoteVisible = getSessionStorage(SESSION_KEY.NEW_PRODUCT_MULTIPLE_UPLOAD_NOTE, null)
        && getLocalStorage(SESSION_KEY.NEW_PRODUCT_MULTIPLE_UPLOAD_NOTE, true)
    const [multipleUploadNoteVisible, _setMultipleUploadNoteVisible] = useState(isMultipleUploadNoteVisible)
    const [currentDrag, setCurrentDrag] = useState({...DEFAULT_DRAG})


    const dismissMultipleUploadNote = () => {
        _setMultipleUploadNoteVisible(false)
        setSessionStorage(SESSION_KEY.NEW_PRODUCT_MULTIPLE_UPLOAD_NOTE, false)
    }

    const dismissForeverMultipleUploadNote = () => {
        _setMultipleUploadNoteVisible(false)
        setLocalStorage(SESSION_KEY.NEW_PRODUCT_MULTIPLE_UPLOAD_NOTE, false)
    }

    useEffect(() => {
        return () => {
            clearInterval(interval.current)
        }
    }, [])


    // useEffect(() => {
    //  if(designState.currentProductIndex>=0){
    //      setTimeout(() => scroller.scrollTo(getProductElementId(designState.currentProductIndex), {
    //          duration: 800,
    //          delay: 0,
    //          containerId: 'user-product-list-container-scroll'
    //      }), 1000)
    //  }
    // }, [designState.currentProductIndex])

    // useEffect(() => {
    //     interval.current = setInterval(() => {
    //         setFooState({})
    //     }, 500)

    //     return () => {
    //         clearInterval(interval.current)
    //     }
    // }, [fooState])

    // const onFinishUploadArtwork = (artworks, sideId) => {
    //     // appendArtworkToSide(artworks, sideId)
    //     setDesignViewState(sideId, 0)
    // }

    const setDesignViewState = (sideId, productIndex, layerIndex) => {
        setViewState(VIEW_STATE.DESIGN)
        setDesignState({currentSideId: sideId, currentProductIndex: productIndex, currentLayerIndex: layerIndex})
    }

    const onDragged = (srcSideId, srcProductIndex) => {
        return (destSideId, destProductIndex) => {
            setCurrentDrag({...DEFAULT_DRAG})
            const checkValid = draggableSideLayerIsInvalid(srcSideId, srcProductIndex, destSideId, destProductIndex)
            if (checkValid.success) {
                replaceLayers(srcSideId, srcProductIndex, destSideId, destProductIndex)
                setDesignState({currentSideId: destSideId, currentProductIndex: destProductIndex})
                reselectLayerIndex()
            }
        }
    }

    const startDrag = (sideLayer, errorMessage, isProcessing) => {
        if (errorMessage || isProcessing) {
            setCurrentDrag({...ERROR_DRAG})
        } else {
            if (sideLayer) {
                const fusionSize = sideLayer.side.fusion_size.artwork_fusion_size
                setCurrentDrag({height: fusionSize.height, width: fusionSize.width})
            } else {
                setCurrentDrag({...ERROR_DRAG})
            }
        }
    }

    const failDrag = () => {
        setCurrentDrag({...DEFAULT_DRAG})
    }

    const draggableSideLayerIsInvalid = (srcSideId, srcProductIndex, destSideId, destProductIndex) => {
        const srcSideConstraint = product.abstract.sides.find(side => side.id === srcSideId)
        const srcSide = product.userProducts[srcProductIndex].sideLayers.find(side => side.side.id === srcSideId)
        const srcFusionSize = srcSideConstraint.fusion_size.artwork_fusion_size

        const destSideConstraint = product.abstract.sides.find(side => side.id === destSideId)
        const destSide = product.userProducts[destProductIndex].sideLayers.find(side => side.side.id === destSideId)

        const destFusionSize = destSideConstraint.fusion_size.artwork_fusion_size

        let result = {success: true, message: ""}

        if (srcFusionSize.width === destFusionSize.width && srcFusionSize.height === destFusionSize.height) {
            if (srcSide !== destSide) {
                if (destSide.layers.length <= 0 && destSide.backgroundColor === product.defaultBackgroundColor) {
                    for (const layer of srcSide.layers) {
                        let upload = null
                        if (layer.uploadID) {
                            upload = uploadManager.find(upload => upload.id === layer.uploadID)
                        }
                        const error = layerErrorToString(layer, srcSideConstraint, upload) || layerErrorToString(layer, destSideConstraint, upload)
                        if (error) {
                            result.message = error
                            result.success = false
                            break
                        }
                    }
                } else {
                    setReplaceLayerInfo({
                        destProductIndex: destProductIndex,
                        destSideId: destSideId,
                        srcProductIndex: srcProductIndex,
                        srcSideId: srcSideId
                    })
                    result.message = "Replace layer"
                    result.success = false
                    setReplaceLayerConfirmModalDisplay(true)
                }
            } else {
                result.message = "Same layer side"
                result.success = false
            }
        } else {
            result.message = SIZE_NOT_SIMILAR
            result.success = false
        }
        return result
    }

    const onClickArtwork = (sideId, userProductIndex, artwork, constraints) => {
        // console.log(sideId, userProductIndex)
        setDesignViewState(sideId, userProductIndex, artwork && artwork.layerIndex ? artwork.layerIndex : 0)
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

    const produceHoverMessage = (artwork, side) => {
        if (!artwork || !artwork.data) return 'Loading'
        let upload = null;
        if (artwork.uploadID) {
            upload = uploadManager.find(upload => upload.id === artwork.uploadID)
        }
        const artworkErrorCode = checkLayerSideConstraints(artwork, side, upload)
        if (artwork && artwork.data && artworkErrorCode) {
            if (artworkErrorCode === ARTWORK_ERROR_CODES.LOW_DPI) {
                return (
                    <div>
                        <div>Artwork <b>{artwork.name}</b> with <b>DPI {getArtworkDPI(artwork, side)}</b> is too low
                        </div>
                        <div>You can scale down artwork to increase DPI</div>
                        <br/>
                        <div>
                            <b>Minimum DPI:</b> {side.constraints.minimum_dpi}
                        </div>
                    </div>
                )
            } else return (
                <div>
                    {LAYER_ERRORS[artworkErrorCode](artwork, side)}
                </div>
            )
        }
        return 'Drag to copy/replace'
    }

    const confirmRemovingAllArtworks = () => {
        setRemoveAllProductConfirmModalDisplay(!removeAllProductConfirmModalDisplay)
    }

    const totalArtworks = product.userProducts.reduce((total, userProduct) => {
        const layers = []
        userProduct.sideLayers.forEach((s) => {
            layers.push(...s.layers)
        })
        return total + layers.length
    }, 0)

    const productSideLength = product.abstract ? product.abstract.sides.length : 0
    const userProductLength = product.userProducts ? product.userProducts.length : 0

    const [maxWidth, setMaxWidth] = useState(70)
    const [removeProductIndex, setRemoveProductIndex] = useState(null)

    const getMaxWidth = () => {
        const element = document.querySelector("#singleUpload")
        if (element) {
            setMaxWidth(element.offsetWidth / productSideLength - 10)
        }
    }

    useEffect(() => {
        getMaxWidth()
        window.addEventListener("resize", getMaxWidth)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleRemoveAllInvalid = () => {
        setDesignState({currentLayerIndex: -1})
        removeAllInvalidArtworks()
        reselectLayerIndex()
    }

    // const sideData = product.abstract.sides.find(side => side.id === designState.currentSideId)
    // const minimumDPI = sideData ? sideData.constraints.minimum_dpi : null
    //
    // const sideArtwork = (
    //     product.userProducts[designState.currentProductIndex] &&
    //     product.userProducts[designState.currentProductIndex].artworks.find((item) => item.side === designState.currentSideId)
    // )

    const handleClickRemoveProduct = (index) => {
        setRemoveProductIndex(index)
        setRemoveProductConfirmModalDisplay(true)
    }

    const handleConfirmRemoveProduct = () => {
        if (removeProductIndex !== null) {
            const lengthProducts = removeProduct(removeProductIndex)
            if (designState.currentProductIndex > lengthProducts - 1) {
                setDesignState({currentProductIndex: lengthProducts - 1})
            }
        }
        setRemoveProductIndex(null)
        setRemoveProductConfirmModalDisplay(false)
    }

    const handleCancelRemoveProduct = () => {
        setRemoveProductIndex(null)
        setRemoveProductConfirmModalDisplay(false)
    }

    const handleClickAddNewProduct = () => {
        const len = addNewProduct()
        const firstSide = product.abstract.sides[0]
        const firstSideId = firstSide.id
        setDesignState({currentSideId: firstSideId, currentProductIndex: len - 1})
    }

    const handleOnFinishUpload = (artworks, sideId, userProductIndex) => {
        const lastLayerIndex = appendArtworkToSide(artworks, sideId, userProductIndex)
        setDesignViewState(sideId, userProductIndex, lastLayerIndex)
    }

    return (
        <div className="full-height w-100 d-flex">
            <div className="row no-gutters p1em">
                <div className={`${productSideLength > 0 ? "col-8" : "col-12"} no-gutters`}>
                    <Heading>{product.abstract.title}</Heading>
                    <div className={"mt-3"}>
                        Products: <b>{product.userProducts.length}</b> &nbsp;
                        {
                            userProductLength > 0
                            && <Button
                                type="link" size="small"
                                className="text-danger no-padding"
                                onClick={confirmRemovingAllArtworks}
                            >
                                Clear artworks
                            </Button>
                        }
                    </div>
                    <div className={totalArtworks > 0 ? "" : "mt-3"}>
                        Artworks: <b>{totalArtworks}</b> &nbsp;
                        {
                            totalArtworks > 0
                            && <Button
                                type="link" size="small"
                                className="text-danger no-padding"
                                onClick={handleRemoveAllInvalid}
                            >
                                Clear invalid
                            </Button>
                        }
                    </div>

                </div>
                {
                    productSideLength > 1 && (
                        <div id="multipleUpload" className="col-4 flex-center step-upload-multi-sides no-gutters">
                            <MultiSideUploadArtwork
                                startTriggerRerendering={startTriggerRerendering}
                                clearTriggerRerendering={clearTriggerRerendering}/>
                        </div>
                    )
                }
            </div>
            <hr className={'w-100'}/>
            <div onClick={handleClickAddNewProduct} className="flex-center" style={{cursor: "pointer"}}>
                <FontAwesomeIcon icon={faPlus} color={"blue"}/>
                <span className="ml-2" style={{color: "blue"}}>New product</span>
            </div>
            <hr className={'w-100'}/>
            <div className="artwork-list-header-container w-100 flex-center pb-3">
                <div id="singleUpload" className="position-relative flex-center width-full flex-column">
                    <div className='flex-evenly step-upload-artwork w-100'>
                        {
                            product.abstract.sides.map((side) => {
                                const sideId = side.id
                                return (
                                    <div className="text-center flex-center" key={sideId} style={{width: "100%"}}>
                                        <div style={{maxWidth: maxWidth, margin: "0 5px"}}>{side.type}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
            <hr className="w-100 my-0"/>
            <div className="artwork-list-container w-100 full-height">
                <div className="flex-center full-height px-0">
                    <div className="full-height user-product-list-container w-100">
                        <Element id="user-product-list-container-scroll"
                                 className="user-product-list-sub-container no-wrap">
                            {
                                product.userProducts.map((userProduct, userProductIndex) => {
                                        const selectedProduct = designState.currentProductIndex === userProductIndex
                                        const firstSide = product.abstract.sides[0]
                                        const firstSideId = firstSide.id
                                        const firstSideLayer = userProduct.sideLayers.find((s) => s.side.id === firstSideId)
                                        let listFirstSideLayers = firstSideLayer ? [...firstSideLayer.layers] : []
                                        listFirstSideLayers = _.orderBy(listFirstSideLayers, ["layerIndex"], ["desc"])
                                        const firstSideArtwork = listFirstSideLayers[0]
                                        return (
                                            <div
                                                id={`user-product-${userProductIndex}`}
                                                key={userProductIndex}
                                                onClick={() => onClickArtwork(firstSideId, userProductIndex, firstSideArtwork, firstSide.constraints)}
                                                className={selectedProduct ? "user-product-artworks-group selected-product pb-3" : "user-product-artworks-group pb-3"}
                                            >

                                                <div className="d-flex flex-horizontal">
                                                    <Paragraph
                                                        style={{flex: "0 1 100%"}}
                                                        className="mb-0 pt-3 data-tut-title step-edit-title fullWidth px-3"
                                                        editable={{
                                                            onChange: (str) => {
                                                                if (str !== "") {
                                                                    product.userProducts[userProductIndex]['title'] = str
                                                                    setDesignState({currentProductIndex: userProductIndex})
                                                                    setProduct(product)
                                                                }
                                                            }
                                                        }}
                                                    >{userProduct.title}
                                                    </Paragraph>
                                                    <Tooltip title={"Remove"} placement={"topRight"}>
                                                        <FontAwesomeIcon
                                                            className="mx-3"
                                                            icon={faTimes}
                                                            color={"red"}
                                                            onClick={(event) => {
                                                                event.stopPropagation()
                                                                handleClickRemoveProduct(userProductIndex)
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </div>
                                                <Element
                                                    name={getProductElementId(userProductIndex)}
                                                    className={`product-artwork-item-container ${getProductElementId(userProductIndex)}`}
                                                    key={userProductIndex}
                                                    style={{
                                                        borderColor: userProductIndex % 2 === 0 ? '#aabbbb' : 'lightgrey',
                                                        borderRadius: 3
                                                    }}
                                                >
                                                    <div className={'row mx-0 no-wrap flex-evenly'}>
                                                        {
                                                            product.abstract.sides.map((side, index) => {
                                                                const sideId = side.id
                                                                const sideLayer = userProduct.sideLayers.find((s) => s.side.id === sideId)
                                                                let listLayers = sideLayer ? [...sideLayer.layers] : []
                                                                listLayers = _.orderBy(listLayers, ["layerIndex"], ["desc"])
                                                                const sideArtwork = listLayers[0]
                                                                let supported = null
                                                                let errorArtwork = null
                                                                let loading = false
                                                                for (const layer of listLayers) {
                                                                    let upload = null
                                                                    if (layer) {
                                                                        if (!layer.data) {
                                                                            loading = true
                                                                        }
                                                                        if (layer.uploadID) {
                                                                            upload = uploadManager.find(upload => upload.id === layer.uploadID)
                                                                        }
                                                                    }

                                                                    supported = layer && !layerErrorToString(layer, side, upload)
                                                                    if (!supported) {
                                                                        errorArtwork = layer
                                                                        break
                                                                    }
                                                                }

                                                                let isProcessing = listLayers.some(l => l.isProcessing === true)

                                                                let errorMessage = null
                                                                if (loading) {
                                                                    errorMessage = 'Loading'
                                                                } else {
                                                                    if (errorArtwork) {
                                                                        errorMessage = produceHoverMessage(errorArtwork, side)
                                                                    }
                                                                }

                                                                // console.log(sideArtwork);
                                                                return (
                                                                    <ArtworkItemContainer
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            onClickArtwork(sideId, userProductIndex, sideArtwork, side.constraints)
                                                                        }}
                                                                        sideId={sideId}
                                                                        userProductIndex={userProductIndex}
                                                                        isFocused={sideId === designState.currentSideId && userProductIndex === designState.currentProductIndex}
                                                                        isSupported={supported}
                                                                        isProcessing={!(sideArtwork && sideArtwork.data)}
                                                                        key={sideId}
                                                                        maxSize={maxWidth}
                                                                        constraints={side.fusion_size.artwork_fusion_size}
                                                                        currentDrag={currentDrag}
                                                                    >
                                                                        {
                                                                            sideArtwork
                                                                                ? <DraggableArtworkItem
                                                                                    artwork={sideArtwork}
                                                                                    sideId={sideId}
                                                                                    constraints={side.constraints}
                                                                                    userProductIndex={userProductIndex}
                                                                                    onDragged={onDragged(sideId, userProductIndex, isProcessing)}
                                                                                    onClickRemove={() => {
                                                                                        removeArtwork(sideId, userProductIndex)
                                                                                    }}
                                                                                    beginDrag={() => startDrag(sideLayer, errorMessage)}
                                                                                    id={`user-product-${userProductIndex}-side-${index}`}
                                                                                    failDrag={failDrag}
                                                                                    // dragDisabled={true}
                                                                                    errorMessage={errorMessage}
                                                                                />
                                                                                : (
                                                                                    <Tooltip title="Click to add artwork">
                                                                                        <UploadArtwork
                                                                                            id={`user-product-${userProductIndex}-side-${index}`}
                                                                                            constraints={side.constraints}
                                                                                            onFinishUpload={(artworks) => handleOnFinishUpload(artworks, sideId, userProductIndex)}
                                                                                            multiple={true}
                                                                                            startTriggerRerendering={startTriggerRerendering}
                                                                                            clearTriggerRerendering={clearTriggerRerendering}
                                                                                            side={side}
                                                                                            maxSize={maxWidth}
                                                                                        />
                                                                                    </Tooltip>
                                                                                )
                                                                        }
                                                                    </ArtworkItemContainer>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </Element>
                                            </div>
                                        )
                                    }
                                )
                            }
                        </Element>
                    </div>
                </div>
            </div>

            {
                multipleUploadNoteVisible && product.userProducts.length === 0 && (
                    <div className="width-100 p-t-10">
                        <Banner
                            title="Multiple artworks upload support"
                            status="info"
                            action={{content: 'Never show again', onAction: dismissForeverMultipleUploadNote}}
                            onDismiss={dismissMultipleUploadNote}
                            className="width-100">
                            <p>You can upload multiple artworks at the same time</p>
                        </Banner>
                    </div>
                )
            }

            <Modal
                open={removeProductConfirmModalDisplay}
                onClose={handleCancelRemoveProduct}
                title="Remove product"
                primaryAction={{
                    content: 'Confirm',
                    onAction: handleConfirmRemoveProduct,
                    destructive: true
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleCancelRemoveProduct,
                    },
                ]}
            >
                <Modal.Section>
                    <TextContainer>
                        <p>
                            This action cannot be undone
                        </p>
                    </TextContainer>
                </Modal.Section>
            </Modal>

            <Modal
                open={replaceLayerConfirmModalDisplay}
                onClose={() => setReplaceLayerConfirmModalDisplay(false)}
                title="Confirm"
                primaryAction={{
                    content: 'Yes, replace',
                    onAction: () => {
                        replaceLayers(replaceLayerInfo.srcSideId, replaceLayerInfo.srcProductIndex, replaceLayerInfo.destSideId, replaceLayerInfo.destProductIndex)
                        setReplaceLayerConfirmModalDisplay(false)
                        setDesignState({
                            currentSideId: replaceLayerInfo.destSideId,
                            currentProductIndex: replaceLayerInfo.destProductIndex
                        })
                        reselectLayerIndex()
                        setReplaceLayerInfo({...DEFAULT_REPLACE_INFO})
                    },
                    destructive: true
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => {
                            setReplaceLayerConfirmModalDisplay(false)
                            setReplaceLayerInfo({...DEFAULT_REPLACE_INFO})
                        },
                    },
                ]}
            >
                <Modal.Section>
                    <TextContainer>
                        <p>
                            Are you sure that you want to replace this design? By this action, all the layers on this site can't be backwards. It means that you can’t revert to the last version of the design for this side.
                        </p>
                    </TextContainer>
                </Modal.Section>
            </Modal>

            <Modal
                open={removeAllProductConfirmModalDisplay}
                onClose={() => setRemoveAllProductConfirmModalDisplay(!removeAllProductConfirmModalDisplay)}
                title="Clear all artworks"
                primaryAction={{
                    content: 'Yes, clear all artworks',
                    onAction: () => {
                        removeAllArtworks()
                        setRemoveAllProductConfirmModalDisplay(!removeAllProductConfirmModalDisplay)
                    },
                    destructive: true
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => setRemoveAllProductConfirmModalDisplay(!removeAllProductConfirmModalDisplay),
                    },
                ]}
            >
                <Modal.Section>
                    <TextContainer>
                        <p>
                            This action cannot be undone
                        </p>
                    </TextContainer>
                </Modal.Section>
            </Modal>
            {
                uploadManager.length > 0
                && (<UploadInfo/>)
            }
        </div>
    )
}

export default ProductArtworkList
