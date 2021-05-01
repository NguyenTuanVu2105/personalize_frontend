const RESIZE_MIN_SIZE = 512

export const readInfoImage = (file) => {
    return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = function (event) {
            const image = new Image()
            image.onload = function () {

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
                resolve([canvas.toDataURL('image/png'), image.width, image.height])
            }
            image.src = event.target.result
        }
        reader.readAsDataURL(file)
    })
}

export const getBase64FromUrl = async (url) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            const base64data = reader.result;
            resolve(base64data);
        }
    });
}