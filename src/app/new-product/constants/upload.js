import {faCheck, faCloudUploadAlt, faHistory, faObjectGroup, faTimes} from "@fortawesome/free-solid-svg-icons"

export const UploadStatus = {
    PENDING: 1,
    UPLOADING: 2,
    MERGING: 3,
    COMPLETED: 4,
    ERROR: 5,
    CANCELED: 6,
}

export const IconUpload = {
    1: faHistory,
    2: faCloudUploadAlt,
    3: faObjectGroup,
    4: faCheck,
    5: faTimes
}

export const IconUploadColor = {
    1: "rgb(255, 212, 59)",
    2: "rgb(16, 142, 233)",
    3: "rgb(16,142,233)",
    4: "rgb(135, 208, 104)",
    5: "rgb(250, 82, 82)"
}