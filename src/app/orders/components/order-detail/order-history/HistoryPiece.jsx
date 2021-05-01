import React from 'react'
import { Typography } from 'antd'

function HistoryPiece({ title, description }) {
    return (
        <>
            <Typography.Title style={{ fontSize: "14px" }}>{title}</Typography.Title>
            <Typography.Text className="ml-3">{description}</Typography.Text>
        </>
    )
}

export default HistoryPiece