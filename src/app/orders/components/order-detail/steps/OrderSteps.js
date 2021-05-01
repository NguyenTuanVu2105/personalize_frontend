import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {Card} from "@shopify/polaris"
import OrderStepper from "./OrderStepper"
import "../../../../../scss/steps/Steps.scss"
import {InitializationOrderSteps} from "./constant"
import {StepStatus} from "../../../../../shared/steps"


const OrderSteps = (props) => {

    const {history, tracking_infos} = props
    const [steps, setSteps] = useState([...InitializationOrderSteps])

    useEffect(() => {
        let steps = []
        InitializationOrderSteps.forEach(step => {
            steps.push({...step})
        })
        if (history) {
            const tmpHistory = [...history]
            const reverseHistory = tmpHistory.reverse()
            for (const h of reverseHistory) {
                steps = changeHistory(steps, h)
            }
        }
        if (steps[4].status === StepStatus.PROCESS) {
            if (tracking_infos) {
                let delivered = true
                let date = null
                for (const track of tracking_infos) {
                    if (track.tracking_status !== "delivered") {
                        delivered = false
                        break
                    }
                    if (date) {
                        let time_1 = new Date(date)
                        let time_2 = new Date(track.update_time)
                        if (time_1.getTime() < time_2.getTime()) {
                            date = track.update_time
                        }
                    } else {
                        date = track.update_time
                    }
                }
                if (delivered) {
                    steps[4].status = StepStatus.FINISH
                    steps[4].date = date
                }
            }
        }
        setSteps(steps)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history])

    const changeStep = (steps, index, status, time) => {
        let result = []

        steps.forEach(step => {
            result.push({...step})
        })

        for (let i = 0; i < index; i++) {
            result[i].status = StepStatus.FINISH
        }

        if (index - 1 >= 0) {
            if (time) {
                result[index - 1].date = time
            }
        }

        result[index].status = status
        return result
    }


    const changeHistory = (steps, history) => {
        const warning = ["canceled", "rejected", "failed"]

        let result = []

        steps.forEach(step => {
            result.push({...step})
        })

        switch (history.verbose_type) {
            case "create_order":
                result = changeStep(result, 1, StepStatus.PROCESS, history.create_time)
                break
            case "update_order_financial_status":
                if (history.new_obj.financial_status === "paid") {
                    result = changeStep(result, 2, StepStatus.PROCESS, history.create_time)
                } else if (warning.includes(history.new_obj.financial_status)) {
                    result = changeStep(result, 1, StepStatus.WARNING)
                }
                break
            case "update_order_fulfill_status":
                if (history.new_obj.fulfill_status === "in_production" || history.new_obj.fulfill_status === "partially_fulfilled") {
                    result = changeStep(result, 3, StepStatus.PROCESS, history.create_time)
                } else if (warning.includes(history.new_obj.fulfill_status)) {
                    if (result[2].status === StepStatus.FINISH) {
                        result = changeStep(result, 2, StepStatus.WARNING)
                    }
                } else if (history.new_obj.fulfill_status === "fulfilled") {
                    result = changeStep(result, 4, StepStatus.PROCESS, history.create_time)
                }
                break
            default:
                break
        }
        return result
    }

    const getHighlightIndex = () => {
        if (steps) {
            const waitStep = steps.find(step => step.status === StepStatus.WAIT)
            if (waitStep) {
                const waitIndex = steps.indexOf(waitStep)
                return waitIndex > 1 ? waitIndex - 1 : 0
            } else {
                return steps.length - 1
            }
        } else {
            return 0
        }
    }

    const highlightIndex = getHighlightIndex()

    if (steps && steps.length > 0) {
        return (
            <div className="mb-4">
                <Card>
                    <div className="p-t-15">
                        <div className={"container-steps-horizontal"}>
                            {
                                steps
                                && steps.map((step, index) => {
                                    return (
                                        <OrderStepper
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
                    <div className={"text-right"} style={{padding: "0px 10px 10px 10px"}}><b>BD</b> stands for business
                        day
                    </div>
                </Card>
            </div>
        )
    } else {
        return <></>
    }

}

OrderSteps.propTypes = {
    history: PropTypes.array.isRequired,
    tracking_infos: PropTypes.array
}

export default OrderSteps
