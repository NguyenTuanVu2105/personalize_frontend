import React from 'react'

const OrderInfoItem = (props) => {
    return (
        <div className="space-between">
            <span style={{fontSize: '14px', lineHeight: '28px'}} className="d-flex flex-space-between w-100">
                <span style={{fontWeight: 400}}>{props.title}:</span>
                &nbsp;
                <span style={{color: "#202223"}}>{props.value}</span>
            </span>
        </div>
    )
}

export default OrderInfoItem
