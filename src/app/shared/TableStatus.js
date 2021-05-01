import React from 'react'
import {Button as PolarisButton} from "@shopify/polaris"

const TableStatus = function (props) {
    const {loading, amount, objectName, verboseObjectName} = props

    const renderStatus = () => {
        const subfix = amount > 2 ? verboseObjectName : objectName
        return amount !== 0 ? `Total ${amount} ${subfix}` : `No ${objectName} to show`
    }

    return (
        <PolarisButton disabled loading={loading}>{renderStatus()}</PolarisButton>
    )
}

export default TableStatus