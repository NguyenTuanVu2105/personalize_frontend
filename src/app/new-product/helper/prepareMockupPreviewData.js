import {MIN_PREVIEW_ARTWORK_SIDE} from "../constants/constants"
import {dataURItoBlob} from "../../../services/util/blob"

export const prepareMockupPreviewData = (backgroundColor, artworks, side, target) => {
    return new Promise(async (resolve, reject) => {
        // Create canvas
        const canvas = document.createElement('canvas')
        const frameProperties = side.fusion_size.artwork_fusion_size
        const frameRatio = frameProperties.width / frameProperties.height
        canvas.width = frameRatio < 1 ? MIN_PREVIEW_ARTWORK_SIDE : MIN_PREVIEW_ARTWORK_SIDE * frameRatio


        canvas.height = canvas.width / frameRatio

        const ctx = canvas.getContext('2d')

        // draw color
        if (side.enable_background_color && backgroundColor) {
            ctx.fillStyle = backgroundColor
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.globalCompositeOperation = "source-atop"
        }

        for (const artwork of artworks) {
            if (!!artwork.visible) {
                await drawImage(artwork, reject, frameRatio, canvas)
            }
        }

        target[side.type] = {
            blob: dataURItoBlob(canvas.toDataURL('image/png')),
            preference: 'fit'
        }
        // console.log(canvas.toDataURL('image/png'))
        resolve()
    })
}

const drawImage = (artwork, reject, frameRatio, canvas) => {
    return new Promise((resolve, err) => {
        const ctx = canvas.getContext('2d')
        const image = new Image()
        image.crossOrigin = "anonymous"
        try {
            image.src = artwork.data
            image.onerror = (e) => {
                console.log(e)
                reject(e)
            }
            image.onload = () => {

                let imageRatio = artwork.originWidth / artwork.originHeight

                // canvas.height = frameRatio > 1 ? MIN_PREVIEW_ARTWORK_SIDE : MIN_PREVIEW_ARTWORK_SIDE * frameRatio

                let imageDefaultWidth
                let imageDefaultHeight
                if (imageRatio > frameRatio) {
                    imageDefaultWidth = canvas.width
                    imageDefaultHeight = imageDefaultWidth / imageRatio
                } else {
                    imageDefaultHeight = canvas.height
                    imageDefaultWidth = imageDefaultHeight * imageRatio
                }

                let [translateRatioX, translateRatioY] = artwork.translateRatio || [0, 0]
                let [scaleX, scaleY] = artwork.scale || [1, 1]
                let rotate = -artwork.rotate || 0

                let translateX = translateRatioX * canvas.width
                let translateY = translateRatioY * canvas.height

                let imageTrueWidth = imageDefaultWidth * scaleX
                let imageTrueHeight = imageDefaultHeight * scaleY

                const frameEdgeToArtworkEdgeX = translateX + (canvas.width - imageTrueWidth) * 0.5
                const frameEdgeToArtworkEdgeY = translateY + (canvas.height - imageTrueHeight) * 0.5

                //translate canvas origin to the top left point of image (drawing point)
                // ctx.translate((canvas.width - imageTrueWidth) * 0.5 + translateX, (canvas.height - imageTrueHeight) * 0.5 + translateY)
                ctx.translate(frameEdgeToArtworkEdgeX, frameEdgeToArtworkEdgeY)
                //save current canvas position
                ctx.save()


                //translate canvas origin to image center point
                ctx.translate(imageTrueWidth * 0.5, imageTrueHeight * 0.5)

                //perform rotation(***)
                ctx.rotate(-1 * rotate * Math.PI / 180)
                //translate canvas origin back to drawing point
                ctx.translate(imageTrueWidth * -0.5, imageTrueHeight * -0.5)


                //draw image
                ctx.drawImage(image, 0, 0, imageTrueWidth, imageTrueHeight)
                //restore last canvas position - this will perform canvas rotation back from last rotation(***)
                ctx.restore()
                ctx.translate(-frameEdgeToArtworkEdgeX, -frameEdgeToArtworkEdgeY)
                ctx.save()
                resolve()
            }
        } catch (e) {
            console.log(e)
            err()
            reject(e)
        }
    })
}