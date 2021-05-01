import {Button, Tooltip} from "@shopify/polaris"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSyncAlt} from "@fortawesome/free-solid-svg-icons"
import React, {useState} from "react"
import {reSyncProduct} from "../../../../services/api/shops"
import {notification} from "antd"

export const ReSyncProductButton = ({userProductId, shop, refresh, displayText = true, displayTooltip = true}) => {
    const [buttonDisable, setButtonDisable] = useState(false)

    const handleReSyncClick = async () => {
        setButtonDisable(true)
        const respone = await reSyncProduct(userProductId, {shop_id: shop.id})
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
        <div>
            <span className={''}>
                {
                    displayTooltip ? (
                        <Tooltip content="Resync product in this shop">
                            <Button disabled={buttonDisable} plain onClick={handleReSyncClick}>
                                <FontAwesomeIcon icon={faSyncAlt}/>{displayText ? " Resync" : ""}
                            </Button>
                        </Tooltip>
                    ) : (
                        <Button disabled={buttonDisable} plain onClick={handleReSyncClick}>
                            <FontAwesomeIcon icon={faSyncAlt}/>{displayText ? " Resync" : ""}
                        </Button>
                    )
                }
            </span>
        </div>
    )
}