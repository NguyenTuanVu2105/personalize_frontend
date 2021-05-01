import React, {useContext, useEffect} from 'react'
import NewProductContext from '../context/NewProductContext'
import './NewProduct.scss'
import {withRouter} from 'react-router-dom'
import ProductDesignContainer from './design/ProductDesignContainer'
import {NORMAL_STEPS, SAMPLE_PRODUCT_CUSTOM_STEPS} from '../static/steps'
import SubmitModal from './choose-shop/SubmitModal'
import {DUPLICATE, SAMPLE_PRODUCT_CUSTOM} from "../constants/newproductMode"

const NewProduct = (props) => {
    const {isSubmit, setIsSubmit, modeData} = useContext(NewProductContext)

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown, false);

        return () => {
            document.removeEventListener("keydown", handleKeyDown, false);
        };
    }, []);

    const handleKeyDown = (e) => {
        e.stopPropagation()
        const nextArrow = document.querySelector(".preview-container .arrow.arrow-right")
        const backArrow = document.querySelector(".preview-container .arrow.arrow-left")
        const polarisBackdrop = document.querySelector(".Polaris-Backdrop")
        if (!polarisBackdrop) {
            if (e.keyCode === 37) {
                if (backArrow) {
                    backArrow.click()
                }
            } else if (e.keyCode === 39) {
                if (nextArrow) {
                    nextArrow.click()
                }
            }
        }
    }

    const {step} = useContext(NewProductContext)

    // const

    const renderStepContent = () => {
        switch (modeData.mode) {
            case DUPLICATE:
                return (
                    <div className="steps-content">
                        <ProductDesignContainer/>
                    </div>
                )
            case SAMPLE_PRODUCT_CUSTOM:
                return (
                    <div className="steps-content">{SAMPLE_PRODUCT_CUSTOM_STEPS[step].content}</div>
                )
            default:
                return (
                    <div className="steps-content">{NORMAL_STEPS[step].content}</div>
                )
        }
    }

    return (
        <div className="new-product-container">
            {
                renderStepContent()
            }
            <SubmitModal visible={isSubmit} setVisible={setIsSubmit}/>
        </div>
    )
}

export default withRouter(NewProduct)
