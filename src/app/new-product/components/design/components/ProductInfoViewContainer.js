import ProductDescription from './product-info-view/ProductDescription'
import React from 'react'
import ColorSelector from './product-info-view/ColorSelector'
import "./ProductInfoViewContainer.scss"

const ProductInfoViewContainer = () => {
    return (
        <div className={'full-height'}>
            <div className={"product-info-view-container"} style={{maxHeight:"100%"}}>
                <div className="flex-shrink ">
                    <ColorSelector multiple={true}/>
                </div>
                <div
                    className="flex-grow"
                    style={{
                        maxHeight: "100%",
                        display: 'flex',
                        width: '100%',
                        flexDirection: 'column'
                    }}
                >
                    <ProductDescription/>
                </div>

            </div>
        </div>
    )
}

export default ProductInfoViewContainer
