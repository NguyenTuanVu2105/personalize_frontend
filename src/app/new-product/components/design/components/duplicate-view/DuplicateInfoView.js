import React, {useContext} from 'react'
import {Button, Link, Tooltip} from "@shopify/polaris"
import Paths from "../../../../../../routes/Paths"
import NewProductContext from "../../../../context/NewProductContext"

const DuplicateInfoView = (props) => {
    const {submitProduct, canMoveStep, product, modeData,highLightError} = useContext(NewProductContext)
    const moveNextStepError = canMoveStep(product)
    return (
        <div className="flex-middle full-height justify-content-center flex-column">
            <div onClick={highLightError} onMouseEnter={highLightError}>
                <Tooltip content={moveNextStepError ? moveNextStepError.description : 'Submit your products'}>
                    <Button primary className="nav-step-button" type="primary" size="large"
                            onClick={submitProduct}
                            disabled={moveNextStepError}>
                        Add Product
                    </Button>
                </Tooltip>
            </div>
            <span className="my-2">View <Link url={Paths.ProductDetail(modeData.productId)}
                                              external>original product</Link></span>
        </div>
    )
}

export default DuplicateInfoView