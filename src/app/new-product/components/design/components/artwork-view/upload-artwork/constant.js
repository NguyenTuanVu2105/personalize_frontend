import {notification} from "antd"
import React from "react"

export const errorLimitLayer = (MAX_LAYER, currentNumberArtworks, duplicate = false) => {
    notification.error({
        message: "Limited number layer",
        description: (
            <div>
                <p>The number layer limited: {MAX_LAYER}</p>
                <p>You just have: {currentNumberArtworks} layers</p>
                {
                    duplicate
                        ? <p>You can't duplicate more</p>
                        : <p>You can choose: {MAX_LAYER - currentNumberArtworks} layers</p>
                }

            </div>
        )
    })
}