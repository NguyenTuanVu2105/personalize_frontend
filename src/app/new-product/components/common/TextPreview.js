import React from "react"
// import {createTextSvg} from "../../helper/createText";
//import {createTextSvg} from "../../helper/createText"

const TextPreview = ({
                         step,
                         top,
                         left,
                         width,
                         id,
                         height,
                         idTextPreview,
                         textWidth,
                         artworkInfo,
                         proportion,
                         dx,
                         dy,
                         radius,
                         angle,
                         moveableRef,
                         frameScale
                     }) => {
    //
    // const img=document.getElementById("test1")
    // const svg=document.getElementById("test")
    // if(svg) {
    //     let xml= new XMLSerializer().serializeToString(svg)
    //     const xml1=createTextSvg(id,artworkInfo,textWidth,frameScale,angle,radius,dx,dy)
    //     const svg64 = btoa(xml)
    //     const b64Start = `data:image/svg+xml;base64,${svg64}`
    //     const src = b64Start
    //     // img.onload =()=>{
    //     //     const canvas= document.createElement("canvas")
    //     //     const pdf=canvas.getContext("2d")
    //     //     pdf.drawImage(img,0,0)
    //     // }
    //     img.src = src
    //     console.log("xml", xml)
    //     console.log("xml1", xml1)
    //     console.log("src", svg64)
    //     console.log("img", img)
    // }

    return (
        <svg
            className={`moveable moveable-${step}-${id}`}
            ref={moveableRef}
            xmlns={"http://www.w3.org/2000/svg"}
            //width={`${textWidth}px`}
            width={`${textWidth + 24 *frameScale}px`}
            // version1 : svg just a line
            height={`${artworkInfo.height*frameScale}px`}
            //
            //viewBox={` 0 0 ${textWidth+40} ${elements[0].artworkInfo.height*3}`}
            style={{
                position: "absolute",
                top: `${top}px`,
                left: `${left}px`,
                overflow: 'visible',
                zIndex: `${id}`,
            }}
        >
            <defs>
                <path
                    d={`M ${(12*frameScale + dx)},${((height + 21*frameScale) / 2 + 1*dy -7*frameScale*(angle/360))} A ${radius} ${radius} 0
                                       ${angle <= 180 ? 0 : 1}  1 ${(textWidth + 12*frameScale - dx)},${((height + 21*frameScale) / 2 + 1*dy -7*frameScale*(angle/360))} Z`}
                    id={`textPreview-${id}`}
                />
            </defs>

            <text>
                <textPath
                    id={`textPathPreview-${id}`}
                    xlinkHref={`#textPreview-${id}`}
                    fill={`${artworkInfo.textStyle.textColor}`}
                    method={"stretch"}
                    // textLength={`${document.getElementById(`textPreview-${id}`) ?
                    //     document.getElementById(`textPreview-${id}`).getTotalLength() - idTextPreview.offsetWidth+2*dx
                    //     : idTextPreview.offsetWidth
                    // }`}
                    textLength={textWidth}
                    lengthAdjust={"spacing"}
                    spacing={"auto"}
                    //startOffset={`${artworkInfo.textStyle.letterSpacing*artworkInfo.textStyle.arc/360*frameScale/(0.8+0.001*artworkInfo.textStyle.arc)}px`}
                    style={{
                        fontSize: 30 * frameScale,
                        letterSpacing: artworkInfo.textStyle.letterSpacing * frameScale,
                        fontFamily: `${artworkInfo.textStyle.typeFace ? artworkInfo.textStyle.typeFace.title : "San Francisco"}`,
                    }}
                >
                    {artworkInfo.textPreview}
                </textPath>
            </text>
        </svg>

    )
}

export default TextPreview
