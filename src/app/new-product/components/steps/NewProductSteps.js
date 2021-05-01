import React, {useContext, useEffect, useState} from "react"
import NewProductStepper from "./NewProductStepper"
import "./NewProductStep.scss"
import {StepStatus} from "../../../../shared/steps"
import NewProductContext from "../../context/NewProductContext"
import {NEW_PRODUCT, SAMPLE_PRODUCT_CUSTOM} from "../../constants/newproductMode"
import {
    InitializationDuplicateProductSteps,
    InitializationNewProductSteps,
    InitializationSampleProductCopySteps
} from "./constant"
import HomeButton from "../common/HomeButton"
import {isInFrame} from "../../../../services/util/windowUtil"


const NewProductSteps = () => {
    const {step, modeData, stepPublish} = useContext(NewProductContext)

    const InitializationSteps = modeData.mode === NEW_PRODUCT ? InitializationNewProductSteps : modeData.mode === SAMPLE_PRODUCT_CUSTOM ? InitializationSampleProductCopySteps : InitializationDuplicateProductSteps

    const [steps, setSteps] = useState([...InitializationSteps])


    useEffect(() => {
        let steps = []
        InitializationSteps.forEach(step => {
            steps.push({...step})
        })
        let index = modeData.mode === NEW_PRODUCT ? step : step + 1
        for (let i = 0; i < index; i++) {
            steps[i].status = StepStatus.FINISH
            steps[i + 1].status = StepStatus.PROCESS
        }

        if (index + 1 === InitializationSteps.length - 1) {
            if (stepPublish !== StepStatus.WAIT) {
                steps[index].status = StepStatus.FINISH
                steps[index + 1].status = stepPublish
            }
        }

        setSteps(steps)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, stepPublish])

    const getHighlightIndex = () => {
        const waitStep = steps.find(step => step.status === StepStatus.WAIT)
        if (waitStep) {
            const waitIndex = steps.indexOf(waitStep)
            return waitIndex > 1 ? waitIndex - 1 : 0
        } else {
            return steps.length - 1
        }
    }

    const highlightIndex = getHighlightIndex()


    return (
        <div className={'row new-product-step-container flex-center mx-0'} style={{width: "100%"}}>
            <div className="col-lg-1">
                {isInFrame() ? <div/> :<HomeButton/>}
            </div>
            <div className="col-lg-10 flex-center">
                <div className="p-t-10" style={{width: "90%"}}>
                    <div className="container-steps-horizontal new-product-steps">
                        {
                            steps.map((step, index) => {
                                return (
                                    <NewProductStepper
                                        key={index}
                                        currentStep={step}
                                        nextStep={(index < steps.length - 1) ? steps[index + 1] : null}
                                        highlight={index === highlightIndex}
                                    />
                                )
                            })
                        }
                    </div>
                </div>
            </div>
            <div className="col-lg-1"/>
        </div>
    )
}

export default NewProductSteps