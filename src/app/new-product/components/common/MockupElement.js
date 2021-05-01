import React, {useContext, useEffect, useState} from "react"
import NewProductDesignContext from "../design/context/NewProductDesignContext"

const MockupElement = ({left, width, sideArtwork, frameRatio, zIndex}) => {
    const [rotate, setRotate] = useState(sideArtwork.rotate || 0)
    const [scale, setScale] = useState(sideArtwork.scale || [1, 1])
    const [translate, setTranslate] = useState(sideArtwork.translate || [0, 0])
    const [container, setContainer] = useState(null)
    const [position, setPosition] = useState({width: "unset", height: "unset", left: 0, top: 0})
    const {setDesignState} = useContext(NewProductDesignContext)

    const transform = () => {
        return `translateX(${translate[0]}px) translateY(${translate[1]}px) rotate(${rotate}deg) scale(${scale[0]}, ${scale[1]})`
    }

    useEffect(() => {
        let imageRatio = (sideArtwork && sideArtwork.width / sideArtwork.height) || 1
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
        setPosition({width: width, height: height, left: left, top: top})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [container, sideArtwork])

    useEffect(() => {
        setTimeout(() => {
            setContainer(document.querySelector(`#layer-${sideArtwork.id}`))
        }, 300)
    }, [sideArtwork.id])

    useEffect(() => {
        if (container) {
            setRotate(sideArtwork.rotate || 0)
            setScale(sideArtwork.scale || [1, 1])
            let frameWidth = container.clientWidth
            let frameHeight = container.clientHeight
            let translateRatio = sideArtwork.translateRatio
            const translate = (translateRatio && [translateRatio[0] * frameWidth, translateRatio[1] * frameHeight])
                || [0, 0]
            setTranslate(sideArtwork.translate || translate)
        }
    }, [sideArtwork, container])

    return (
        <div
            id={`layer-${sideArtwork.id}`}
            style={{
                position: 'absolute',
                left: left,
                width: width,
                height: '100%',
                overflow: 'hidden',
            }}
        >
            <img src={sideArtwork.data} alt={sideArtwork.id}
                 style={{
                     position: "absolute",
                     width: `${position.width}%`,
                     height: `${position.height}%`,
                     left: `${position.left}%`,
                     top: `${position.top}%`,
                     transform: transform(),
                     zIndex: zIndex
                 }}
                 onClick={() => {
                     setDesignState({currentLayerIndex: sideArtwork.layerIndex})
                 }}
            />
        </div>
    )
}

export default MockupElement