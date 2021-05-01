import React from 'react'
import './CurrentDPICard.scss'
import {Banner} from "@shopify/polaris"


const CurrentDPICard = ({dpi, minDpi}) => {
    return isNaN(dpi) ? <div/> : (
        <div className='current-dpi-card w-100'>
            <Banner
                title={`DPI ${dpi}`}
                status={dpi >= minDpi ? 'success' : 'critical'}
            />
        </div>
    )
}

export default CurrentDPICard