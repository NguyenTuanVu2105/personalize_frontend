import Lightbox from 'react-image-lightbox'
import React, {useEffect} from "react"
import 'react-image-lightbox/style.css'

export const LightboxPreview = ({imageList, currentIndex, closeImageView, setCurrentIndex}) => {
    useEffect(() => {
            document.addEventListener("keydown", handleKeyDown, false)
            return () => document.removeEventListener("keydown", handleKeyDown, false)
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [currentIndex]
    )

    const handleOpen = () => {
        const scrollY = window.scrollY
        const root = document.getElementById('root')
        root.style.position = 'fixed'
        root.style.width = '100%'
        root.style.top = `-${scrollY}px`
    }

    const handleClose = () => {
        const root = document.getElementById('root')
        const scrollY = root.style.top
        root.style.position = ''
        root.style.top = ''
        root.style.width = ''
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
        closeImageView()
    }

    const handleKeyDown = (e) => {
        if (e.keyCode === 37) {
            setCurrentIndex((currentIndex + imageList.length - 1) % imageList.length)
        } else if (e.keyCode === 39) {
            setCurrentIndex((currentIndex + 1) % imageList.length)
        } else if (e.keyCode === 27) {
            handleClose()
        }
    }


    return (
        <div onKeyDown={handleKeyDown}>
            <Lightbox
                mainSrc={imageList[currentIndex]}
                nextSrc={imageList[(currentIndex + 1) % imageList.length]}
                prevSrc={imageList[(currentIndex + imageList.length - 1) % imageList.length]}
                onCloseRequest={handleClose}
                onMovePrevRequest={() =>
                    setCurrentIndex((currentIndex + imageList.length - 1) % imageList.length)
                }
                onAfterOpen={handleOpen}
                onMoveNextRequest={() =>
                    setCurrentIndex((currentIndex + 1) % imageList.length)
                }
                imagePadding={50}
            />
        </div>
    )
}