import {StepStatus} from "../../../shared/steps"

export const InitializationTrackingSteps = [
    {
        status: StepStatus.WAIT,
        title: "Pre-transit",
    },
    {
        status: StepStatus.WAIT,
        title: "In transit",
    },
    {
        status: StepStatus.WAIT,
        title: "Out for Delivery",
    },
    {
        status: StepStatus.WAIT,
        title: "Delivered",
    }
]
