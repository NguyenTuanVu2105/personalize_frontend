export const getBase64 = (file) => {
    return new Promise(resolve => {
        var reader = new FileReader()
        reader.onload = function (event) {
            resolve(event.target.result)
        }

        reader.readAsDataURL(file)
    })
}

const RESIZE_MIN_SIZE = 512

export const getResizedBase64 = (file) => {
    return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = function (event) {
            const image = new Image()
            image.onload = function () {
                // Resize the image
                const canvas = document.createElement('canvas')

                let width = image.width
                let height = image.height
                if (width > height) {
                    if (height > RESIZE_MIN_SIZE) {
                        width *= RESIZE_MIN_SIZE / height
                        height = RESIZE_MIN_SIZE
                    }
                } else {
                    if (width > RESIZE_MIN_SIZE) {
                        height *= RESIZE_MIN_SIZE / width
                        width = RESIZE_MIN_SIZE
                    }
                }
                canvas.width = width
                canvas.height = height
                canvas.getContext('2d').drawImage(image, 0, 0, width, height)
                resolve([canvas.toDataURL('image/png'), width, height, image.width, image.height])
                canvas.remove()
            }
            image.src = event.target.result
        }

        reader.readAsDataURL(file)
    })
}
