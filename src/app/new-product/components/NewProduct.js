import React, {useContext, useEffect} from 'react'
import NewProductContext from '../context/NewProductContext'
import './NewProduct.scss'
import {withRouter} from 'react-router-dom'
import ProductDesignContainer from './design/ProductDesignContainer'
import SubmitModal from './choose-shop/SubmitModal'

const NewProduct = (props) => {
    const {isSubmit, setIsSubmit} = useContext(NewProductContext)

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


    return (
        <div className="new-product-container">
            {
                <ProductDesignContainer/>
            }
            {/*<SubmitModal visible={isSubmit} setVisible={setIsSubmit}/>*/}
        </div>
    )
}

export default withRouter(NewProduct)
