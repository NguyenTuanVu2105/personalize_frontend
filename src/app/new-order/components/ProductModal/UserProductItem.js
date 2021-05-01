import React from 'react'
import "./UserProductItem.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faChevronRight} from "@fortawesome/free-solid-svg-icons"

// const MAX_TITLE_LENGTH_TO_SHOW = 26

const UserProductItem = ({product_id, selectedVariantAmount, product_preview, product_name, onClick}) => {
    const renderTitle = (title) => {
        // return title.length > MAX_TITLE_LENGTH_TO_SHOW ? title.substring(0, MAX_TITLE_LENGTH_TO_SHOW).concat("...") : title
        return title
    }

    const onClickItem = () => onClick(product_id, product_preview, product_name)

    const renderCaption = () => {
        return selectedVariantAmount > 0 ? (
            <p className={'user-product-caption selected-variant'}>Selected variants: {selectedVariantAmount}</p>
        ) : (
            <p className={'user-product-caption'}>No selected variant</p>
        )
    }

    return (
        <div className={"row user-product-item-container mx-0 mt-4 flex-center"} onClick={onClickItem}>
            <div className='col-1 user-product-preview pl-0'>
                <img src={product_preview} alt={`${product_name}'s preview`} className={"img-thumbnail w-100"}/>
            </div>
            <div className='col-10 pl-0 user-product-details'>
                <strong className={'user-product-title'}>{renderTitle(product_name)}</strong>
                {renderCaption()}
            </div>
            <div className="col-1 flex-end">
                <FontAwesomeIcon className={"next-icon"} style={{fontSize: "18px"}}
                                 icon={faChevronRight}
                                 color={'#8e8e8e'}/>
            </div>
        </div>
    )
}

export default UserProductItem