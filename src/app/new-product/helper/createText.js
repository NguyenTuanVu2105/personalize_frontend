export const createTextSvg = (artworkInfo, textWidth, frameScale, angle, radius, dx, dy, textPreview, fontUrlBase64) => {

    const hiddenField = document.getElementById(`hidden`)
    const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style")
    style.type = "text/css"
    // console.log("Awd",fontUrlBase64)
    const font_url = fontUrlBase64 ? `data:application/x-font-woff;charset=utf-8;base64,${fontUrlBase64}` : artworkInfo.textStyle.typeFace.font_url
    style.innerHTML = `
        @font-face {
            font-family: "${artworkInfo.textStyle.typeFace.title}";
            src: url("${font_url}") format("truetype");
        }
    `
    // console.log("www",frameScale )
    //   <style type="text/css">
    //   @font-face {
    //     font-family: Delicious;
    //     src: url('../fonts/font.woff');
    //   }
    // </style>
    //const testpath=document.createElement("PATH")
    defs.append(style)
    defs.append(path)
    svg.append(defs)
    // svg.style.top=`${top}px`
    // svg.style.left = `${left}px`
    // svg.style.zIndex = `${id}`
    svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xhtml")
    svg.setAttribute("width", `${textWidth + 36 * frameScale}px`)
    svg.setAttribute("height", `${artworkInfo.height}px`)

    // svg.style.overflow = 'visible'
    // svg.style.position = 'absolute'
    if (angle >= 0) path.setAttributeNS(null, "d", `M ${(18 * frameScale + dx)},${((artworkInfo.height / 2 + artworkInfo.textStyle.currentFontSize / 4 * frameScale) + dy - artworkInfo.textStyle.currentFontSize / 4 * (angle / 360) * frameScale)} A ${radius} ${radius} 0
    ${angle <= 180 ? 0 : 1}  1 ${(textWidth + 18 * frameScale - dx)},${((artworkInfo.height / 2 + artworkInfo.textStyle.currentFontSize / 4 * frameScale) + dy - artworkInfo.textStyle.currentFontSize / 4 * (angle / 360) * frameScale)} Z`)

    if (angle < 0) {
        angle = Math.abs(angle)
        path.setAttributeNS(null, "d", `M ${(18 * frameScale + dx)},${((artworkInfo.height / 2 + artworkInfo.textStyle.currentFontSize / 4 * frameScale) - dy - artworkInfo.textStyle.currentFontSize / 4 * (angle / 360) * frameScale)} A ${radius} ${radius} 0
    ${angle <= 180 ? 0 : 1}  0 ${(textWidth + 18 * frameScale - dx)},${((artworkInfo.height / 2 + artworkInfo.textStyle.currentFontSize / 4 * frameScale) - dy - artworkInfo.textStyle.currentFontSize / 4 * (angle / 360) * frameScale)} Z`)
    }
    path.setAttribute("id", "svg-text")
    defs.append(path)
    svg.append(defs)

    // svg.append(path)
    // svg.append(path)

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
    const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath")
    textPath.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xhtml")
    textPath.setAttribute("xlink:href", "#svg-text")
    textPath.setAttribute("lengthAdjust", "spacing")
    textPath.setAttribute("fill", `${artworkInfo.textStyle.textColor}`)
    textPath.setAttribute("method", "stretch")
    textPath.setAttribute("textLength", `${textWidth}`)
    textPath.setAttribute("spacing", "auto")
    textPath.setAttribute("xml:space", "preserve")

    // textPath.setAttribute("textLength", test.getTotalLength() - textWidth)
    textPath.style.fontSize = `${artworkInfo.textStyle.currentFontSize * frameScale}px`
    textPath.style.letterSpacing = `${artworkInfo.textStyle.letterSpacing}px`
    textPath.style.fontFamily = `"${artworkInfo.textStyle.typeFace.title}"`
    textPath.textContent = textPreview
    text.append(textPath)

    // svg.append(testpath)
    svg.append(text)
    let xml = new XMLSerializer().serializeToString(svg)

    if (hiddenField) {
        hiddenField.innerHTML = xml
        // hiddenField.innerHTML = ""
    }
}

export const createCanvas = (artwork, frameScale) => {
    let firstResult = document.fonts.check(`1em "${artwork.textStyle.typeFace.title}"`)
    if (!firstResult){
        const fontFace = new FontFace(artwork.textStyle.typeFace.title, `url(${artwork.textStyle.typeFace.font_url})`)
        document.fonts.add(fontFace)
        // document.fonts.load(`1em "${artwork.textStyle.typeFace.title}"`)
    }
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const fontSize = artwork.textStyle.currentFontSize * frameScale
    const fontFamily = artwork.textStyle.typeFace.title
    ctx.font = `${fontSize}px "${fontFamily}"`
    ctx.fillStyle = artwork.textStyle.textColor
    const text = artwork.displayText
    const letterSpacing = artwork.textStyle.letterSpacing * frameScale
    const measure = ctx.measureText(text)
    const actualHeight = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent
    let width, height
    // height = actualHeight + 5 * frameScale
    const measureHeight = measureTextHeight(`${fontSize}px "${fontFamily}"`)
    // console.log(measureHeight)
    height = measureHeight > 0 ? measureHeight * frameScale + 10 : actualHeight * frameScale + 15
    width = measure.width + Math.max((text.length - 1), 0) * letterSpacing
    return [width, height]

}
export const createWidth = (artwork, frameScale, fontUrlBase64) => {
    const hiddenField = document.getElementById(`hidden`)
    const div = document.createElement("div")

    // const style = document.createElement("style")
    // style.type = "text/css"
    // // console.log("Awd",fontUrlBase64)
    // const font_url = `data:application/x-font-woff;charset=utf-8;base64,${fontUrlBase64}`
    // style.innerHTML = `
    //     @font-face {
    //         font-family: "${artwork.textStyle.typeFace.title} create";
    //         src: url("${font_url}") format("truetype");
    //     }
    // `
    //
    // hiddenField.append(style)

    div.innerText = artwork.textPreview
    hiddenField.append(div)
    div.style.position = 'absolute'
    div.style.fontFamily = artwork.textStyle.typeFace.title
    div.style.letterSpacing = `${artwork.textStyle.letterSpacing * frameScale}px`
    div.style.fontSize = `${artwork.textStyle.currentFontSize * frameScale}px`
    div.style.lineHeight = "normal"
    // div.style.top=`60px`
    // div.style.left=`30px`
    div.style.paddingtop = `0px`
    div.style.paddingBottom = `0px`
    div.style.whiteSpace = 'nowrap'
    // return new Promise(function(resolve){
    //     setTimeout(()=>{
    //         resolve(div.offsetWidth)
    //     },0)
    // })
    let width = div.offsetWidth + 5 * frameScale
    let height = div.offsetHeight + 5 * frameScale
    return [width, height]
}

export const measureTextHeight = (fontSizeFace) => {
    let width = 1000
    let height = 60
    let canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    let ctx = canvas.getContext("2d")

    let text = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    ctx.save()
    ctx.font = fontSizeFace
    ctx.clearRect(0, 0, width, height)
    ctx.fillText(text, 0, 40)
    ctx.restore()

    let data = ctx.getImageData(0, 0, width, height).data,
        first = false,
        last = false,
        r = height,
        c = 0

    while (!last && r) {
        r--
        for (c = 0; c < width; c++) {
            if (data[r * width * 4 + c * 4 + 3]) {
                last = r
                break
            }
        }
    }
    while (r) {
        r--
        for (c = 0; c < width; c++) {
            if (data[r * width * 4 + c * 4 + 3]) {
                first = r
                break
            }
        }
        if (first !== r) return last - first
    }
    return 0
}

export const validCharacter = (str, typeface) => {
    const available_characters = typeface.available_characters
    let textPreview = "";
    for (let j = 0; j < str.length; j++)
        for (let i = 0; i < available_characters.length; i++)
            if (available_characters[i][1] !== null ?
                str.charCodeAt(j) >= available_characters[i][0] && str.charCodeAt(j) <= available_characters[i][1]
                : str.charCodeAt(j) === available_characters[i][0])
                textPreview = textPreview + str[j];
    return textPreview
}
