import {Button, Tooltip} from "@shopify/polaris"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSyncAlt} from "@fortawesome/free-solid-svg-icons"
import React, {useState} from "react"
import {Button as AntButton, notification} from "antd"
import {bulkResyncProduct} from "../../../services/api/shops"

export const BulkResyncProductButton = ({isActive, userProductId, shopUserProducts, refresh, displayText = false, displayType = "list"}) => {
    const shop_ids = shopUserProducts.map((shopUserProduct) => shopUserProduct.shop.id)
    const [buttonDisable, setButtonDisable] = useState(false)

    const handleReSyncClick = async () => {
        setButtonDisable(true)
        const respone = await bulkResyncProduct(userProductId, {shop_ids: shop_ids})
        if (respone.success && respone.data.success) {
            // console.log(respone)
            refresh()
            notification.success({
                message: "Success",
                description: respone.data.message
            })
        } else notification.error({
            message: "Error",
            description: "Resync product is failed. Please try again!"
        })
        setButtonDisable(false)
    }

    return (
        <span className={''}>
            {
                !isActive && displayType === "list" && (
                    <Tooltip content="Resync this product" >
                        <AntButton disabled={buttonDisable} onClick={handleReSyncClick} className="ant-dropdown-link text-info" href="#"
                                   type="link">
                            <FontAwesomeIcon icon={faSyncAlt}/>
                        </AntButton>
                    </Tooltip>
                )
            }
            {
                !isActive && displayType === "detail" && (
                    <Tooltip content="Resync this product">
                        <Button disabled={buttonDisable} onClick={handleReSyncClick} primary>
                            Resync
                        </Button>
                    </Tooltip>
                )
            }
        </span>
    )
}