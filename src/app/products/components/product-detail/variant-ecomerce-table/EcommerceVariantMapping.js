import React from 'react'
import './EcommerceVariant.scss'

const EcommerceVariantMapping = function (props) {
    const {variant} = props
    const abstract_product = variant.user_variant_mapping.abstract_variant.product
    const side_artworks = variant.user_variant_mapping.side_artworks
    return <div className="variant-mapping">
        <div className="artwork-cell">
            <strong>Abstract Product</strong>
            <img src={abstract_product.preview_image_url} alt={abstract_product.id} height={150}/>
        </div>

        {side_artworks.map(side_artwork => {
            return (<div className="artwork-cell">
                <strong>{side_artwork.side}</strong>
                {side_artwork.fused_artwork.artwork_set.map(artwork => {
                    return(<img src={artwork.file_url} alt={artwork.id} height={150}/>)
                })
                }
            </div>)
        })
        }
    </div>
}

export default EcommerceVariantMapping
