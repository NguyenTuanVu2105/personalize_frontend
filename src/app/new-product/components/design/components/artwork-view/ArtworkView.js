import React, {useContext, useEffect, useState} from 'react'
import ProductArtworkList from './ProductArtworkList'
import ChangeStepContainer from '../../../common/ChangeStepContainer'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons'
import {Checkbox} from 'antd'
import NewProductContext from '../../../../context/NewProductContext'

const ArtworkView = (props) => {
    const context = useContext(NewProductContext)
    const [legalChecked, setLegalChecked] = useState(context.product.userAgreeLegal || false)


    const handleLegalCheckboxChange = (newChecked) => {
        const checked = newChecked.target.checked
        changeLegal(checked)
    }
    const changeLegal = (checked) => {
        setLegalChecked(checked)
        document.querySelector('#legal').classList.remove('importantError')
        context.setProduct({userAgreeLegal: checked})
    }
    const isRequiredArtwork = () => {
        try {
            const sidesData = context.product.abstract.sides
            if (sidesData) {
                for (let i = 0; i < sidesData.length; i++) {
                    if (sidesData[i].constraints.required === true)
                        return true
                }
                return false
            }
            return false
        } catch (e) {
            return true
        }
    }
    const [isArtworkRequired,] = useState(isRequiredArtwork())
    const hideLegal = context.product.userProducts.every((userProduct) => {
        const layers = []
        userProduct.sideLayers.forEach((s) => {
            layers.push(...s.layers)
        })
        return layers.length === 0
    })

    const allArtworkAcceptedLegal = context.product.userProducts.every(userProduct => {
        const layers = []
        userProduct.sideLayers.forEach((s) => {
            layers.push(...s.layers)
        })
        return layers.length > 0 && layers.every(artwork => artwork.isLegalAccepted)
    })

    useEffect(() => {
        setLegalChecked(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hideLegal])

    useEffect(() => {
        context.setProduct({userAgreeLegal: legalChecked})
        // console.log("context.product.userAgreeLegal", context.product.userAgreeLegal)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [legalChecked])

    const renderLegal = (allArtworkAcceptedLegal, isArtworkRequired, hideLegal) => {
        if (!allArtworkAcceptedLegal) {
            if (isArtworkRequired || (!isArtworkRequired && !hideLegal)) {
                return (
                    <div id={"legal"} className={'p-2 mt-3'} style={{margin: '0 1rem'}}>
                        <div style={{display: 'flex', width: 'fit-content'}}>
                            <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                style={{fontSize: '1.5rem', color: "#F49342", marginRight: '1rem'}}
                            />
                            <h1 style={{cursor: 'context-menu'}}>LEGAL</h1>
                        </div>
                        <Checkbox
                            checked={legalChecked}
                            onChange={handleLegalCheckboxChange}
                            id={"checkbox-notice-legal"}
                        >
                            <span style={{color: "#454f5b"}}>I certify that I own rights to all images I am uploading for this product. I hereby forever release PrintHolo from any and all trademark or copyright infringement claims.</span>
                        </Checkbox>
                    </div>
                )
            } else if (hideLegal && !isArtworkRequired) {
                return (
                    <div id={"legal"} className={'p-2 mt-3'} style={{margin: '0 1rem'}}>
                        <div style={{display: 'flex', width: 'fit-content'}}>
                            <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                style={{fontSize: '1.5rem', color: "#F49342", marginRight: '1rem'}}
                            />
                            <h1 style={{cursor: 'context-menu'}}>NOTICE</h1>
                        </div>
                        <Checkbox
                            checked={legalChecked}
                            onChange={handleLegalCheckboxChange}
                            id={"checkbox-notice-legal"}
                        >
                            <span style={{color: "#454f5b"}}>I certify that I want to create products without any artwork</span>
                        </Checkbox>
                    </div>
                )
            }
        }

    }

    return (
        <div className="view-container full-height" style={{display: 'flex'}}>
            <div className="flex-shrink ph1em">
                <ChangeStepContainer/>
            </div>
            {renderLegal(allArtworkAcceptedLegal, isArtworkRequired, hideLegal)}
            <hr className={'w-100'}/>
            <div className="flex-middle full-height">
                <ProductArtworkList/>
            </div>
        </div>
    )
}


export default ArtworkView
