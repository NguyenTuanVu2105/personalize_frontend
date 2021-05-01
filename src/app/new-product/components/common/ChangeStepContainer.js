// import {Button} from 'antd'
import {Button} from '@shopify/polaris'
import {Tooltip} from 'antd'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faAngleLeft, faAngleRight, faCloudUploadAlt} from '@fortawesome/free-solid-svg-icons'
import React, {useContext, useState} from 'react'
import NewProductContext from '../../context/NewProductContext'
import Paths from '../../../../routes/Paths'
import {withRouter} from 'react-router-dom'
import {removeSessionStorage, SESSION_KEY} from "../../../../services/storage/sessionStorage"
import {SAMPLE_PRODUCT_CUSTOM} from "../../constants/newproductMode"

// const STEP_TITLES = [
//     {
//         index: 0,
//         title: 'Choose Product',
//     },
//     {
//         index: 1,
//         title: 'Variant & Design',
//     },
//     {
//         index: 2,
//         title: 'Pricing',
//     }
// ]

const ChangeStepContainer = (props) => {
    const {prevStep, nextStep, step, canMoveStep, product, submitProduct, modeData, highLightError, hasContainer} = useContext(NewProductContext)
    const [activeTooltip, setActiveToolTip] = useState(false)
    const moveNextStepError = canMoveStep(product)
    const STEP_TITLES = modeData.stepTitle

    const backToHome = () => {
        removeSessionStorage(SESSION_KEY.NEW_PRODUCT)
        return modeData.mode === SAMPLE_PRODUCT_CUSTOM ? props.history.push(Paths.Dashboard) : props.history.push(Paths.ListProducts)
    }

    let handleTurnOffToolTip = null

    if (hasContainer === true) {
        return <div/>
    } else {
        return (
            <div className="flex-shrink">
                <div className="row no-gutters pt-4 pb-2">
                    <div className="col-6 flex-start">
                        {step > 0 ? (<Button className="nav-step-button" onClick={prevStep}
                                             icon={<FontAwesomeIcon icon={faAngleLeft}/>}>
                                {STEP_TITLES[step - 1].title}
                            </Button>)
                            : (<Button className="nav-step-button" onClick={backToHome}
                                       icon={<FontAwesomeIcon icon={faAngleLeft}/>}>
                                Back
                            </Button>)}
                    </div>
                    <div className="col-6 flex-end">
                        <div
                            onMouseEnter={() => {
                                if (handleTurnOffToolTip != null) {
                                    clearTimeout(handleTurnOffToolTip)
                                }
                                setActiveToolTip(true)
                                highLightError()
                            }}

                            onMouseLeave={() => {
                                handleTurnOffToolTip = setTimeout(() => setActiveToolTip(false), 100)
                            }}

                            onClick={() => {
                                if (moveNextStepError) {
                                    if (activeTooltip === false) {
                                        setActiveToolTip(true)
                                        setTimeout(() => setActiveToolTip(false), 2000)
                                    }
                                    highLightError()
                                }
                            }}
                        >
                            {step < STEP_TITLES.length - 1 ?
                                (
                                    <Tooltip
                                        title={moveNextStepError ? moveNextStepError.description : STEP_TITLES[step + 1].title}
                                        visible={activeTooltip}
                                        placement={"bottomRight"}
                                        arrowPointAtCenter={true}
                                    >
                                        <Button
                                            primary
                                            className="nav-step-button"
                                            onClick={nextStep}
                                            disabled={moveNextStepError}
                                        >
                                            {STEP_TITLES[step + 1].title} &nbsp;
                                            <FontAwesomeIcon icon={faAngleRight}/>
                                        </Button>
                                    </Tooltip>
                                )
                                :
                                (
                                    <Tooltip
                                        title={moveNextStepError ? moveNextStepError.description : 'Publish Product'}
                                        visible={activeTooltip}
                                        placement={"bottomRight"}
                                        arrowPointAtCenter={true}
                                    >
                                        <Button primary className="nav-step-button" onClick={submitProduct}
                                                disabled={moveNextStepError}>
                                            Publish &nbsp;
                                            <FontAwesomeIcon icon={faCloudUploadAlt}/>
                                        </Button>
                                    </Tooltip>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(ChangeStepContainer)
