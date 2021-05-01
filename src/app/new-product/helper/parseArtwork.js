import {standardFloatNumber} from "./standardFloatNumberProps"
import {LAYER_TYPE, SCALE_DECIMAL_PLACES} from "../constants/constants"

export const parseArtwork = (product, sideLayers) => {
    const mockupInfoId = product.variants[0].abstract.mockup_info
    return sideLayers.map((sideLayer) => {
        const mockupInfo = product.abstract.mockup_infos.find(info => info.id === mockupInfoId).preview[sideLayer.side.type]
        const frameRatio = mockupInfo.frame_width / mockupInfo.frame_height

        const layers = [...sideLayer.layers]
        return {
            side: {
                name: (sideLayer.side && sideLayer.side.type) || '',
                id: sideLayer.side.id
            },
            backgroundColor: sideLayer.backgroundColor,
            layers: layers.map((layer, index) => {
                const imageRatio = layer.width / layer.height
                const fusion_size = sideLayer.side.fusion_size.artwork_fusion_size
                const imageOriginScale = (imageRatio > frameRatio)
                    ? (fusion_size.width / layer.originWidth)
                    : (fusion_size.height / layer.originHeight)

                if (layer.type !== LAYER_TYPE.text) {
                    const roundedRotate = (Math.round(layer.rotate * 100) / 100) % 360
                    return {
                        type: layer.type,
                        id: layer.id,
                        name: layer.name,
                        layerIndex: layer.layerIndex,
                        is_hidden: !layer.visible,
                        position: (layer.translateRatio && {
                            'x': layer.translateRatio[0] * fusion_size.width,
                            'y': layer.translateRatio[1] * fusion_size.height
                        }) || {
                            'x': 0,
                            'y': 0
                        },
                        scale: standardFloatNumber((layer.scale ? layer.scale[0] : 1) * imageOriginScale, SCALE_DECIMAL_PLACES),
                        dndScale: standardFloatNumber(layer.scale ? layer.scale[0] : 1, SCALE_DECIMAL_PLACES),
                        // imageOriginScale: imageOriginScale,
                        rotation: roundedRotate * -1 || 0,
                        meta: layer.meta,
                        // sideArtworkOriginWidth: sideArtwork.originWidth,
                        // sideArtworkOriginHeight: sideArtwork.originHeight
                    }
                } else {
                    const roundedRotate = (Math.round(layer.rotate * 100) / 100) % 360
                    return {
                        type: layer.type,
                        content: {
                            raw_svg: layer.xml,
                            text: layer.textPreview,
                            text_color: layer.textStyle.textColor,
                            font_family_id: layer.textStyle.typeFace.id,
                            text_size: layer.textStyle.currentFontSize,
                            text_spacing: layer.textStyle.letterSpacing,
                            arc: layer.textStyle.arc,
                            placeholder_label: "",
                            // outline_color: "#FBFBFB",
                            // outline_thickness: 10,
                            // shadow_color: "#FBFBFB",
                            // shadow_distance: 10,
                            // shadow_angle: 45,
                            // is_allow_customize: true
                        },
                        layerIndex: layer.layerIndex,
                        is_hidden: !layer.visible,
                        position: (layer.translateRatio && {
                            'x': layer.translateRatio[0] * fusion_size.width,
                            'y': layer.translateRatio[1] * fusion_size.height
                        }) || {
                            'x': 0,
                            'y': 0
                        },
                        scale: standardFloatNumber((layer.scale ? layer.scale[0] : 1) * imageOriginScale, SCALE_DECIMAL_PLACES),
                        dndScale: standardFloatNumber(layer.scale ? layer.scale[0] : 1, SCALE_DECIMAL_PLACES),
                        // imageOriginScale: imageOriginScale,
                        rotation: roundedRotate * -1 || 0,
                    }
                }


            })
        }
    })
}