import React from "react"
import {StepIcon, StepIconColor, StepStatus} from "../../../../shared/steps"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"

const NewProductStepper = ({currentStep, nextStep, highlight}) => {

    const stepClassName = () => {
        const className = []
        className.push("steps-container")
        if (currentStep.status === StepStatus.FINISH) {
            className.push("step-done")
            if (nextStep) {
                if (nextStep.status !== StepStatus.FINISH && nextStep.status !== StepStatus.WAIT) {
                    className.push("next-step-process")
                }
            }
        }
        return className.join(" ")
    }

    return (
        <div className={stepClassName()}>
            <div className={`steps-icon ${nextStep !== null ? "" : "no-tail"}`}>
                <div className="icon-content">
                    <FontAwesomeIcon
                        color={StepIconColor[currentStep.status]}
                        icon={StepIcon[currentStep.status]}
                    />
                </div>
                <div className="steps-tail">
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                            borderRadius: 4,
                            height: "100%"
                        }}
                    />
                </div>
            </div>

            <div className={`steps-title text-center ${(highlight && currentStep.status !== StepStatus.FINISH) ? "high-light-text" : ""}`}>
                {currentStep.title}
            </div>

        </div>
    )
}

export default NewProductStepper