import {faCheckCircle, faDotCircle, faTimesCircle} from "@fortawesome/free-solid-svg-icons"

export const StepStatus = {
    WAIT: "WAIT",
    PROCESS: "PROCESS",
    FINISH: "FINISH",
    WARNING: "WARNING",
}

export const StepIcon = {
    "WAIT": faDotCircle,
    "PROCESS": faDotCircle,
    "FINISH": faCheckCircle,
    "WARNING": faTimesCircle,
}

export const StepIconColor = {
    "WAIT": "rgb(160, 162, 164)",
    "PROCESS": "rgb(53,148,251)",
    "FINISH": "rgb(0,128,0)",
    "WARNING": "rgb(255,234,138)",
}