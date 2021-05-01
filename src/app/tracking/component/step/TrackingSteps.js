import React, {useEffect, useState} from "react"
import {StepStatus} from "../../../../shared/steps"
import TrackingStepper from "./TrackingStepper"
import "./TrackingSteps.scss"
import {InitializationTrackingSteps} from "../../constant/steps"

const TrackingSteps = ({histories}) => {

    // const InitializationSteps = modeData.mode === NEW_PRODUCT ? InitializationNewProductSteps : modeData.mode === SAMPLE_PRODUCT_CUSTOM ? InitializationSampleProductCopySteps : InitializationDuplicateProductSteps

    const [steps, setSteps] = useState([...InitializationTrackingSteps])


    useEffect(() => {
        let steps = []
        InitializationTrackingSteps.forEach(step => {
            steps.push({...step})
        })
        if (histories) {
            const tmpHistory = [...histories]
            for (const h of tmpHistory) {
                steps = changeHistory(steps, h)
            }
        }
        setSteps(steps)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [histories])

    const getHighlightIndex = () => {
        const waitStep = steps.find(step => step.status === StepStatus.WAIT)
        if (waitStep) {
            const waitIndex = steps.indexOf(waitStep)
            return waitIndex > 1 ? waitIndex - 1 : 0
        } else {
            return steps.length - 1
        }
    }

    const changeStep = (steps, index, status) => {
        let result = []

        steps.forEach(step => {
            result.push({...step})
        })

        for (let i = 0; i < index; i++) {
            result[i].status = StepStatus.FINISH
        }

        result[index].status = status
        return result
    }

    const changeHistory = (steps, history) => {
        let result = []

        steps.forEach(step => {
            result.push({...step})
        })

        switch (history.status) {
            case "pre_transit":
                result = changeStep(result, 1, StepStatus.PROCESS)
                break
            case "in_transit":
                result = changeStep(result, 2, StepStatus.PROCESS)
                break
            case "out_for_delivery":
                result = changeStep(result, 3, StepStatus.PROCESS)
                break
            case "delivered":
                result = changeStep(result, 3, StepStatus.FINISH)
                break
            default:
                break
        }
        return result
    }

    const highlightIndex = getHighlightIndex()


    return (
        <div className={'row tracking-step-container flex-center mx-0'} style={{width: "100%"}}>
            <div className="col-lg-12 flex-center">
                <div className="p-t-10" style={{width: "90%"}}>
                    <div className="container-steps-horizontal">
                        {
                            steps.map((step, index) => {
                                return (
                                    <TrackingStepper
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
            {/*<div className="col-lg-1"/>*/}
        </div>
    )
}

export default TrackingSteps