import React from 'react'
import {Tooltip} from '@shopify/polaris'

const ShippingZoneTag = (props) => {
    const {label, color, backgroundColor, tooltip} = props
    // console.log(props)
    return (<Tooltip content={tooltip}>
        <span style={{backgroundColor, color}} className="shipping-zone-tag">
            {label}
        </span>

    </Tooltip>)
}

export default ShippingZoneTag
