import PropTypes from "prop-types"
import React from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {convertDatetime} from "../../../../../services/util/datetime"
import {StepIcon, StepIconColor, StepStatus} from "../../../../../shared/steps"

const OrderStepper = (props) => {
    const {currentStep, nextStep, highlight} = props

    const simpleDateFormat = (time) => {
        return convertDatetime(time).format("DD/MM/YYYY")
    }

    const title = (step) => {
        return (
            <div style={{fontWeight: "inherit"}}>
                <p style={{fontWeight: "inherit"}}>
                    {step.title}
                </p>
                {
                    step.date
                    && (
                        <p>
                            <span>
                                {simpleDateFormat(step.date)}
                            </span>
                        </p>
                    )
                }
            </div>
        )
    }

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

    const progressClassName = () => {
        const className = []
        className.push("progress-bar")
        if (nextStep) {
            if (nextStep.status !== StepStatus.FINISH && nextStep.status !== StepStatus.WAIT) {
                className.push("progress-bar-striped")
                className.push("progress-bar-animated")
            }
        }
        return className.join(" ")
    }

    return (
        <div className={stepClassName()}>
            <div className="steps-sub-title flex-center text-center">
                {nextStep && currentStep.status !== StepStatus.FINISH && currentStep.estimate}
            </div>
            <div className="steps-icon">
                <div className="icon-content">
                    <FontAwesomeIcon
                        color={StepIconColor[currentStep.status]}
                        icon={StepIcon[currentStep.status]}
                    />
                </div>
                <div className="steps-tail">
                    <div
                        className={progressClassName()}
                        role="progressbar"
                        style={{
                            borderRadius: 4,
                            height: "100%"
                        }}
                    />
                </div>
            </div>
            <div
                className={`steps-title text-center ${(highlight && currentStep.status === StepStatus.PROCESS) ? "high-light-text" : ""}`}>
                {title(currentStep)}
            </div>
        </div>
    )
}

OrderStepper.propTypes = {
    currentStep: PropTypes.shape({
        status: PropTypes.string.isRequired,
        date: PropTypes.string,
        title: PropTypes.string.isRequired,
        estimate: PropTypes.string
    }).isRequired,
    nextStep: PropTypes.shape({
        status: PropTypes.string.isRequired,
        date: PropTypes.string,
        title: PropTypes.string.isRequired,
        estimate: PropTypes.string
    }),
    highlight: PropTypes.bool
}


export default OrderStepper