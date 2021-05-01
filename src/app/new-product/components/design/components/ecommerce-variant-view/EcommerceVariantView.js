import React from 'react'
import ColorSelector from "../product-info-view/ColorSelector"
import SizeSelector from "./SizeSelector"

const EcommerceVariantView = (props) => {
    return (
        <>
            <div className="flex-shrink ph1em">
                <ColorSelector mutiple={false}/>
            </div>
            <div className="flex-shrink ph1em">
                <SizeSelector/>
            </div>
        </>
    )
}

export default EcommerceVariantView