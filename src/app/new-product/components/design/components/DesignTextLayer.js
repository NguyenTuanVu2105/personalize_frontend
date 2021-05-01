import {createCanvas, createTextSvg} from "../../../helper/createText";


const DesignTextLayer = (sideArtwork, frameScale, isChangeFont) => {
    frameScale = 1

    // let fontUrlBase64=''
    // if (sideArtwork.textStyle.fontUrlBase64==='' || isChangeFont===true) {
    //     fontUrlBase64 = base64Encode(getBinary(sideArtwork.textStyle.typeFace.font_url))
    //     sideArtwork.textStyle.fontUrlBase64=fontUrlBase64
    // }
    // else fontUrlBase64=sideArtwork.textStyle.fontUrlBase64
    const fontUrlBase64 = base64Encode(getBinary(sideArtwork.textStyle.typeFace.font_url))

    function getBinary(file) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", file, false);
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.send(null);
        return xhr.responseText;
    }

    function base64Encode(str) {
        let CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let out = "", i = 0, len = str.length, c1, c2, c3;
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i === len) {
                out += CHARS.charAt(c1 >> 2);
                out += CHARS.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i === len) {
                out += CHARS.charAt(c1 >> 2);
                out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += CHARS.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += CHARS.charAt(c3 & 0x3F);
        }
        return out;
    }

    const calculateArc = (width, height, frameScale) => {
        let dx, dy, angle, radius
        // let defaultHeight = ((sideArtwork.textStyle.currentFontSize - sideArtwork.textStyle.defaultFontSize) + 45) * frameScale
        let defaultHeight = (height) * frameScale
        if (Math.abs(sideArtwork.textStyle.arc) === 0) {
            dx = 0
            dy = 0
            radius = 0
            angle = 0
            // target.style.height = 45 * frameScale
            sideArtwork.height = defaultHeight
            // target.style.top = (FRAME_HEIGHT - (45 * frameScale)) / 2
        } else {
            if (Math.abs(sideArtwork.textStyle.arc) < 360) {
                // const [width] = createWidth(sideArtwork, frameScale, fontUrlBase64)
                radius = (width) * 360 / Math.abs(sideArtwork.textStyle.arc) / 2 / Math.PI
                dy = (radius - radius * Math.cos((Math.abs(sideArtwork.textStyle.arc) / 180 * Math.PI) / 2)) / 2
                dx = ((width) - 2 * radius * Math.sin((Math.abs(sideArtwork.textStyle.arc) / 180 * Math.PI) / 2)) / 2
                angle = sideArtwork.textStyle.arc
                sideArtwork.height = defaultHeight + 3.5 * dy
                // target.style.height = 45 * frameScale + 3 * dy
                // target.style.top = (FRAME_HEIGHT - (45 * frameScale + 3 * dy)) / 2
            } else {
                // const [width] = createWidth(sideArtwork, frameScale, fontUrlBase64)
                radius = (width) * 360 / (Math.abs(sideArtwork.textStyle.arc) - 0.1) / 2 / Math.PI
                dy = (radius - radius * Math.cos(((Math.abs(sideArtwork.textStyle.arc) - 0.1) / 180 * Math.PI) / 2)) / 2
                dx = ((width) - 2 * radius * Math.sin(((Math.abs(sideArtwork.textStyle.arc) - 0.1) / 180 * Math.PI) / 2)) / 2
                angle = sideArtwork.textStyle.arc
                sideArtwork.height = defaultHeight + 3.5 * dy
                // target.style.height = 45 * frameScale + 3 * dy
                // target.style.top = (FRAME_HEIGHT - (45 * frameScale + 3 * dy)) / 2

            }

        }
        return [radius, dx, dy, angle]
    }

    const hiddenField = document.getElementById(`hidden`)

    // const [width] = createCanvas(sideArtwork, frameScale,fontUrlBase64)
    let [width, height] = createCanvas(sideArtwork, frameScale, fontUrlBase64)
    // if (sideArtwork.textStyle.arc < 0) {
    //     width = width + 2 * sideArtwork.textStyle.currentFontSize * sideArtwork.textStyle.arc / -360
    // }

    let [radius, dx, dy, angle] = calculateArc(width, height, frameScale)
    createTextSvg(sideArtwork, width, frameScale, angle, radius, dx, dy, sideArtwork.displayText, fontUrlBase64)
    let svg = hiddenField.firstChild
    let xml = new XMLSerializer().serializeToString(svg)
    const svg64 = btoa(unescape(encodeURIComponent(xml)))
    const b64Start = `data:image/svg+xml;base64,${svg64}`
    // return b64Start
    sideArtwork.data = b64Start
    sideArtwork.width = width + 36 * frameScale
    sideArtwork.originWidth = width + 36 * frameScale
    sideArtwork.originHeight = sideArtwork.height
    hiddenField.removeChild(svg)

    createTextSvg(sideArtwork, width, frameScale, angle, radius, dx, dy, sideArtwork.displayText)
    svg = hiddenField.firstChild
    xml = new XMLSerializer().serializeToString(svg)
    xml = xml.replaceAll("xmlns:ns1=\"http://www.w3.org/1999/xlink\" ns1:href", "xlink:href")
    // return b64Start
    sideArtwork.xml = xml
    hiddenField.removeChild(svg)

    // const [widthData, heightData] = createWidth(sideArtwork, 1, fontUrlBase64);
    // [radius, dx, dy, angle] = calculateArc(widthData, heightData, 1)
    //
    // createTextSvg(sideArtwork, widthData, 1, angle, radius, dx, dy, fontUrlBase64)
    // const svgData = hiddenField.firstChild
    // const xmlData = new XMLSerializer().serializeToString(svgData)
    // sideArtwork.originWidth = widthData
    // sideArtwork.originHeight = sideArtwork.height
    // sideArtwork.xml = xmlData
    // hiddenField.removeChild(svgData)
    // sideArtwork.height = sideArtwork.height * frameScale


    if (sideArtwork.firstRender) {
        const imageRatio = sideArtwork.height / sideArtwork.width
        const bg = document.getElementById("backgroundImage")
        let scale
        if (imageRatio < 1) {
            scale = sideArtwork.width / bg.offsetWidth
        } else {
            scale = sideArtwork.height / bg.offsetHeight
        }
        sideArtwork.scale = [scale, scale]
        sideArtwork.firstRender = false
    }
}

export default DesignTextLayer
