import {StepStatus} from "../../../../../shared/steps"

export const InitializationOrderSteps = [
    {
        status: StepStatus.PROCESS,
        title: "Order Created",
        date: null,
        estimate: null
    },
    {
        status: StepStatus.WAIT,
        title: "Paid",
        date: null,
        estimate: null
    },
    {
        status: StepStatus.WAIT,
        title: "In Production",
        date: null,
        estimate: "Estimation: 6 BDs"
    },
    {
        status: StepStatus.WAIT,
        title: "Shipping",
        date: null,
        estimate: "Estimation: 15 BDs"
    },
    {
        status: StepStatus.WAIT,
        title: "Delivered",
        date: null,
        estimate: null
    }
]
