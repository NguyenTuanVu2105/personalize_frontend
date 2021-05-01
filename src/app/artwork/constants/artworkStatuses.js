// export const ARTWORK_STATUSES = {
//     "ACTIVE": "active",
//     "INACTIVE": "inactive",
//     "UPLOADED": "uploaded",
//     "ERROR": "error"
// }

export const ARTWORK_STATUS_CODES = {
    "ACTIVE": "1",
    "INACTIVE": "2",
    "UPLOADED": "4",
    "ERROR": "3"
}

export const ALL_QUERY_INDEX = "0"
export const SERVER_ALL_QUERY_INDEX = "-1"
export const ARTWORK_REVERSED_STATUSES = {
    [ALL_QUERY_INDEX]: "All",
    "1": "Active",
    "2": "Inactive",
}