import React, {useContext, useEffect, useRef, useState} from 'react'
import Moveable from "react-moveable"
import './MockupEditor.scss'
import NewProductContext from '../../context/NewProductContext'
import {MAX_DRAG_RATIO, SCALE_DECIMAL_PLACES} from "../../constants/constants"
import {standardFloatNumber} from "../../helper/standardFloatNumberProps"
import NewProductDesignContext from "../design/context/NewProductDesignContext"


const MockupEditor = ({
                          id,
                          width,
                          left,
                          elements,
                          frameRatio,
                          sideArtwork,
                          isDesign,
                          sideId,
                          currentProductIndex,
                          currentLayerIndex,
                          prePosition,
                          rotation,
                          setRotation,
                          prePositionConst
                      }) => {
    const {product, setProduct, removeArtwork} = useContext(NewProductContext)
    const {setDesignState,frameScale} = useContext(NewProductDesignContext)

    const [target, setTarget] = useState(null)
    const [wrapper, setWrapper] = useState(null)
    const [container, setContainer] = useState(null)
    const [rotate, setRotate] = useState(sideArtwork.rotate || 0)
    const [scale, setScale] = useState(sideArtwork.scale || [1, 1])
    const [translate, setTranslate] = useState(sideArtwork.translate || [0, 0])
    const [verticalGuidelines, setVerticalGuidelines] = useState([])
    const [horizontalGuidelines, setHorizontalGuidelines] = useState([])
    const [loading, setLoading] = useState(true)
    const moveableContainerRef = useRef(null)
    const moveableControllerRef = useRef(null)
    const moveableRef = useRef(null)
    const noRenderingRef = useRef(false)
    const renderTimeoutRef = useRef()

    useEffect(() => {
    }, [moveableControllerRef])

    const updateMoveableRect = () => {
        if (moveableControllerRef && moveableControllerRef.current) {
            moveableControllerRef.current.updateRect()
        }
    }

    const updateMoveableContainer = (_rotate, _scale, _translate) => {
        // setTimeout(()=>{
        //     if (target) {
        //         target.style.transform = `translateX(${_translate[0]}px) translateY(${_translate[1]}px) rotate(${_rotate}deg) scale(${_scale[0]}, ${_scale[1]})`
        //         updateMoveableRect()
        //     }
        // },[1000])
        if (target) {
            target.style.transform = `translateX(${_translate[0]}px) translateY(${_translate[1]}px) rotate(${_rotate}deg) scale(${_scale[0]}, ${_scale[1]})`
            updateMoveableRect()
        }
    }

    const nonRotate = () => {
        setRotation(0)
        setRotate(0)
        sideArtwork.rotate = 0
    }

    // console.log("MockupEditor - sideArtwork", sideArtwork)

    useEffect(() => {
        let firstRender = false
        const [prePos] = prePosition

        if (container) {
            if (currentLayerIndex === sideArtwork.layerIndex) {
                const frameClientWidth = container.clientWidth
                const frameClientHeight = container.clientHeight
                let [imageCurrentWidth, imageCurrentHeight] = calculateCurrentImagekSize()
                let imageRatio = standardFloatNumber(target.clientWidth / target.clientHeight, SCALE_DECIMAL_PLACES)
                let _rotate = rotate
                switch (prePos) {
                    case prePositionConst.VERTICAL:
                        translate[0] = 0
                        break
                    case prePositionConst.HORIZON:
                        translate[1] = 0
                        break
                    case prePositionConst.TOP:
                        translate[1] = (imageCurrentHeight - frameClientHeight) / 2
                        break
                    case prePositionConst.BOTTOM:
                        translate[1] = (frameClientHeight - imageCurrentHeight) / 2
                        break
                    case prePositionConst.LEFT:
                        translate[0] = (imageCurrentWidth - frameClientWidth) / 2
                        break
                    case prePositionConst.RIGHT:
                        translate[0] = (frameClientWidth - imageCurrentWidth) / 2
                        break
                    case prePositionConst.FIT:
                        _rotate = 0
                        nonRotate()
                        translate[0] = 0
                        translate[1] = 0
                        scale[0] = 1
                        scale[1] = 1
                        break
                    case prePositionConst.FILL:
                        _rotate = 0
                        nonRotate()
                        translate[0] = 0
                        translate[1] = 0
                        if (imageRatio > frameRatio) {
                            let _scale = standardFloatNumber(imageRatio / frameRatio, SCALE_DECIMAL_PLACES)
                            scale[0] = _scale
                            scale[1] = _scale
                        } else {
                            let _scale = standardFloatNumber(frameRatio / imageRatio, SCALE_DECIMAL_PLACES)
                            scale[0] = _scale
                            scale[1] = _scale
                        }
                        break
                    case prePositionConst.ROTATION:
                        _rotate = rotation
                        sideArtwork.rotate = rotation
                        // setRotate(rotation)
                        break
                    case prePositionConst.REMOVE:
                        const lengthArtworkLayer = removeArtwork(sideId, currentProductIndex, sideArtwork.layerIndex)
                        if (sideArtwork.layerIndex >= lengthArtworkLayer) {
                            setDesignState({currentLayerIndex: lengthArtworkLayer})
                        }
                        _rotate = 0
                        nonRotate()
                        translate[0] = 0
                        translate[1] = 0
                        scale[0] = 1
                        scale[1] = 1
                        return
                    case prePositionConst.RESET:
                        // if (sideArtwork) {
                        //     _rotate = sideArtwork.rotate || 0
                        //     translate[0] = (sideArtwork.translateRatio && sideArtwork.translateRatio[0]) || 0
                        //     translate[1] = (sideArtwork.translateRatio && sideArtwork.translateRatio[1]) || 0
                        //     scale[0] = (sideArtwork.scale && sideArtwork.scale[0]) || 1
                        //     scale[1] = (sideArtwork.scale && sideArtwork.scale[1]) || 1
                        // } else {
                        _rotate = 0
                        nonRotate()
                        translate[0] = 0
                        translate[1] = 0
                        scale[0] = 1
                        scale[1] = 1
                        // }
                        break

                    default:
                        firstRender = true
                }

                if (!firstRender) {
                    setTranslate(translate)
                    setScale(scale)
                    sideArtwork.scale = scale
                    setRotate(_rotate)
                    updateMoveableContainer(_rotate, scale, translate)
                    finishArtworkDrag()
                }
            }
        }

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prePosition])


    useEffect(() => {
        window.addEventListener('resize', () => {
            updateMoveableRect()
            updateSnappableGuidelines()
        })
        return () => {
            window.removeEventListener('resize', updateMoveableRect)
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target])


    useEffect(() => {
        setTarget(document.querySelector(`.moveable-${id}-${elements.length > 0 ? elements[elements.length - 1].id : 0}`))
        setWrapper(document.querySelector(`#moveableWrapper-${id}`))
        let interval = null

        const getContainer = () => {
            let container = document.querySelector(`#moveableContainer-${id}-${sideArtwork.layerIndex}`)
            if (container && container.clientWidth > 0) {
                setContainer(container)
                clearInterval(interval)
                return true
            } else {
                return false
            }
        }
        if (!getContainer()) interval = setInterval(getContainer, 100)
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, elements])

    const updateDisplay = () => {
        // setRotate(sideArtwork.rotate || 0)
        // setScale(sideArtwork.scale || [1, 1])
        if (sideArtwork && target && container) {
            const _rotate = sideArtwork.rotate || 0
            const _scale = sideArtwork.scale || [1, 1]
            let frameWidth = container.clientWidth
            let frameHeight = container.clientHeight
            let translateRatio = sideArtwork.translateRatio
            const _translate = (translateRatio && [translateRatio[0] * frameWidth, translateRatio[1] * frameHeight]) || sideArtwork.translate
                || [0, 0]
            // const translate = sideArtwork.translate || [0, 0]
            setRotate(_rotate)
            setScale(_scale)
            setTranslate(_translate)
            updateMoveableContainer(_rotate, _scale, _translate)
        }
        updateMoveableRect()
        updateSnappableGuidelines()
    }

    useEffect(() => {
        updateDisplay()
        window.addEventListener("resize", updateDisplay)
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sideArtwork, target, container])

    const updateSnappableGuidelines = () => {
        if (container && wrapper) {
            let moveableWrapperClientWidth = wrapper.clientWidth
            let frameClientWidth = container.clientWidth
            let start = moveableWrapperClientWidth * parseFloat(left) / 100
            let end = start + frameClientWidth
            setVerticalGuidelines([start, (start + end) / 2, end])

            let frameClientHeight = wrapper.clientHeight
            setHorizontalGuidelines([0, frameClientHeight / 2, frameClientHeight])
        } else {
            setVerticalGuidelines([])
            setHorizontalGuidelines([])
        }
    }

    const rerenderNewProductView = () => {
        product.userProducts[currentProductIndex].previewUpdated = false
        setProduct({userProducts: product.userProducts})
    }

    const calculateCurrentImagekSize = () => {
        // console.log("rotate",rotate)
        // console.log("scale",scale)
        // console.log("targetw",target.clientWidth)
        // console.log("targeth",target.clientHeight)
        const rotateRadian = rotate * Math.PI / 180
        const imageCurrentWidth = scale[0] * (Math.abs(target.clientWidth * Math.cos(rotateRadian)) + Math.abs(target.clientHeight * Math.sin(rotateRadian)))
        const imageCurrentHeight = scale[0] * (Math.abs(target.clientWidth * Math.sin(rotateRadian)) + Math.abs(target.clientHeight * Math.cos(rotateRadian)))

        return [imageCurrentWidth, imageCurrentHeight]
    }

    const updateArtworkDragPosition = (currentTranslate, delta) => {
        let translateX = currentTranslate[0] + delta[0]
        let translateY = currentTranslate[1] + delta[1]

        const frameClientWidth = container.clientWidth
        const frameClientHeight = container.clientHeight

        let [imageCurrentWidth, imageCurrentHeight] = calculateCurrentImagekSize()

        let maxDragX = Math.floor(0.5 * (frameClientWidth + imageCurrentWidth) - (1 - MAX_DRAG_RATIO) * imageCurrentWidth)
        let maxDragY = Math.floor(0.5 * (frameClientHeight + imageCurrentHeight) - (1 - MAX_DRAG_RATIO) * imageCurrentHeight)

        if (Math.abs(translateX) < maxDragX) {
            currentTranslate[0] = translateX
        } else if ((translateX < 0 && delta[0] > 0) || (translateX > 0 && delta[0] < 0)) {
            currentTranslate[0] = translateX
        }

        if (Math.abs(translateY) < maxDragY) {
            currentTranslate[1] = translateY
        } else if ((translateY < 0 && delta[1] > 0) || (translateY > 0 && delta[1] < 0)) {
            currentTranslate[1] = translateY
        }
    }

    const finishArtworkDrag = () => {
        sideArtwork.translate = translate
        let frameClientWidth = document.getElementById(`moveableContainer-${id}-${sideArtwork.layerIndex}`).clientWidth
        let frameClientHeight = document.getElementById(`moveableContainer-${id}-${sideArtwork.layerIndex}`).clientHeight
        sideArtwork.translateRatio = [translate[0] / frameClientWidth, translate[1] / frameClientHeight]
        rerenderNewProductView()
    }
    useEffect(() => {
        if (sideArtwork && target && container) {
            const _rotate = sideArtwork.rotate || 0
            const _scale = sideArtwork.scale || [1, 1]
            let frameWidth = container.clientWidth
            let frameHeight = container.clientHeight
            let translateRatio = sideArtwork.translateRatio
            const _translate = sideArtwork.translate || (translateRatio && [translateRatio[0] * frameWidth, translateRatio[1] * frameHeight])
                || [0, 0]
            // const translate = sideArtwork.translate || [0, 0]

            setRotate(_rotate)
            setScale(_scale)
            setTranslate(_translate)
            updateMoveableContainer(_rotate, _scale, _translate)
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elements[0].artworkInfo.textStyle.arc, sideArtwork.textPreview, elements[0].artworkInfo.textStyle.letterSpacing, elements[0].artworkInfo.textStyle.typeFace, elements[0].artworkInfo.textStyle.currentFontSize,frameScale])


    return (
        <div
            style={{
                visibility: !!sideArtwork.visible ? "unset" : "hidden"
            }}
        >
            <div
                id={`moveableContainer-${id}-${sideArtwork.layerIndex}`}
                className={`moveable-container moveable-container-${id}-${sideArtwork.layerIndex}`}
                ref={moveableContainerRef}
                style={{position: 'absolute', left: left, width: width, height: '100%', overflow: 'hidden'}}
            >
                {
                    elements.map((ele, i) => {
                        // let FRAME_WIDTH
                        // let FRAME_HEIGHT
                        // if (document.getElementById(`moveableContainer-${id}-${sideArtwork.layerIndex}`)) {
                        //     FRAME_WIDTH = document.getElementById(`moveableContainer-${id}-${sideArtwork.layerIndex}`).clientWidth;
                        //     FRAME_HEIGHT = document.getElementById(`moveableContainer-${id}-${sideArtwork.layerIndex}`).clientHeight;
                        // }
                        let imageRatio = (ele.artworkInfo && ele.artworkInfo.width / ele.artworkInfo.height) || 1
                        // let width = ele.artworkInfo.width
                        // let height = ele.artworkInfo.height
                        // let left = (FRAME_WIDTH - width) / 2
                        // let top = (FRAME_HEIGHT - height) / 2
                        let width
                        let height
                        let top
                        let left
                        if (imageRatio > frameRatio) {
                            width = 100
                            height = width * frameRatio / imageRatio
                            top = (100 - height) / 2
                            left = 0
                        } else {
                            height = 100
                            width = height * imageRatio / frameRatio
                            top = 0
                            left = (100 - width) / 2
                        }
                        const _rotate = sideArtwork.rotate || 0
                        const _scale = sideArtwork.scale || [1, 1]
                        return (
                            <div
                                className={`moveable moveable-${id}-${ele.id}`}
                                ref={moveableRef}
                                style={
                                        {
                                            position: "absolute",
                                            width: `${width}%`,
                                            height: `${height}%`,
                                            top: `${top}%`,
                                            left: `${left}%`,
                                            overflow: 'visible',
                                            transform:`translateX(${translate[0]}px) translateY(${translate[1]}px) rotate(${_rotate}deg) scale(${_scale[0]}, ${_scale[1]})`,

                                            zIndex: `${ele.id}`
                                        }
                                }
                                onLoad={() => {
                                    setTarget(document.querySelector(`.moveable-${id}-${ele.id}`))
                                    setTimeout(() => setLoading(false), 100)
                                }}
                                key={i}
                            >
                                {
                                    <img src={ele.artworkInfo.data} alt={ele.artworkInfo.name}
                                         style={{
                                             width: '100%',
                                             height: '100%',
                                             position: "absolute"
                                         }}
                                         id={`${ele.id}-${sideArtwork.layerIndex}`}
                                         onClick={() => {
                                             setTarget(document.querySelector(`.moveable-${id}-${ele.id}`))
                                         }}
                                    />
                                }
                            </div>
                        )
                    })
                }
            </div>
            {
                loading && <div/>
            }
            {
                !loading && <Moveable
                    target={target}
                    container={null}
                    className={`${currentLayerIndex === sideArtwork.layerIndex ? "" : "invisible"} moveable-controller-${id}-${sideArtwork.layerIndex}`}
                    ref={moveableControllerRef}
                    // renderDirections={["n", "nw", "ne", "s", "se", "sw", "e", "w"]}
                    renderDirections={["ne", "se", "nw", "sw"]}
                    // edge={true} //scale via edges
                    origin={false}  //show origin dot
                    dragArea={true} //drag area on moveable-control
                    // resizable={true}
                    // throttleResize={0}
                    draggable={true}
                    throttleDrag={0}
                    rotatable={true}
                    throttleRotate={0}
                    scalable={true}
                    throttleScale={0}
                    keepRatio={true}
                    snappable={true}
                    snapCenter={true}

                    onResize={({target, width, height, dist}) => {
                        // console.log(width, height, dist);
                        target.style.width = width + "px";
                        target.style.height = height + "px";
                    }}
                    onDrag={({target, left, top, beforeDelta}) => {
                        // console.log("1",beforeDelta)
                        // console.log("2",left)
                        // console.log("3",top)
                        // console.log("4",target)

                        updateArtworkDragPosition(translate, beforeDelta)
                        setTranslate(translate)
                        updateMoveableContainer(rotate, scale, translate)

                    }}
                    onDragEnd={() => {
                        finishArtworkDrag()
                    }}

                    onDragStart={() => {
                        setDesignState({currentLayerIndex: sideArtwork.layerIndex})
                    }}

                    onRotate={({target, beforeDelta, delta}) => {
                        let current_rotate = parseFloat(rotate) + delta
                        // console.log("rotate", rotate)
                        // console.log("delta", delta)
                        // console.log(current_rotate)
                        setRotate(current_rotate)
                        updateMoveableContainer(current_rotate, scale, translate)
                    }}
                    onRotateEnd={() => {
                        const roundedRotate = Math.round(rotate * 100) / 100
                        setRotation(roundedRotate % 360)
                        sideArtwork.rotate = rotate
                        // setRotate(roundedRotate)
                        rerenderNewProductView()
                    }}
                    verticalGuidelines={verticalGuidelines}
                    horizontalGuidelines={horizontalGuidelines}
                    onScale={({target, delta}) => {
                        // console.log(target.style.transform)
                        scale[0] *= Math.abs(delta[0]);
                        scale[1] *= Math.abs(delta[1]);
                        // if (Math.abs(scale[0]) > MAX_SCALE_ALLOW && scale[0] > 0) setScale([MAX_SCALE_ALLOW, MAX_SCALE_ALLOW])
                        // else if (Math.abs(scale[0]) > MAX_SCALE_ALLOW && scale[0] < 0) setScale([-MAX_SCALE_ALLOW, -MAX_SCALE_ALLOW])
                        // else setScale(scale)
                        setScale(scale)
                        sideArtwork.scale = scale
                        updateMoveableContainer(rotate, scale, translate)
                        // console.log('Scaling')
                        if (!noRenderingRef.current) {
                            noRenderingRef.current = true
                            clearTimeout(renderTimeoutRef.current)
                            renderTimeoutRef.current = setTimeout(() => {
                                noRenderingRef.current = false
                            }, 100)
                            rerenderNewProductView()
                        }
                    }}
                    onScaleEnd={() => {
                        // sideArtwork.scale = scale
                        // if (scale[0] > MAX_SCALE_ALLOW) {
                        //     notification['warning']({
                        //         message: "TOO LARGE SCALE",
                        //         description: `This artwork is scaled too large (Maximum is ${MAX_SCALE_ALLOW})`,
                        //         duration: 1.5
                        //     })
                        //     setScale([MAX_SCALE_ALLOW, MAX_SCALE_ALLOW])
                        // }
                        // console.log(scale)
                        // else if(scale[0] < MIN_SCALE_ALLOW) {
                        //     notification['warning']({
                        //         message: "TOO SMALL SCALE",
                        //         description: `This artwork is scaled too small (Minimum is ${MIN_SCALE_ALLOW})`,
                        //         duration: 1.5
                        //     })
                        // }
                        rerenderNewProductView()
                    }}
                />}
        </div>
    );
}
export default MockupEditor;
