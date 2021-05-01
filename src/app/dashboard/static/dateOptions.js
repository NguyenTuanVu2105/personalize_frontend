import moment from 'moment-timezone'

const dateOptions = [
    {
        rangeTitle: "Today",
        startDate: moment().startOf('day'),
        endDate: moment().startOf('day').add(1, "days"),
        format: "DD/MM",
        enabled: true,
        singleTimeRange: true,
        default: false,
    },
    {
        rangeTitle: "Yesterday",
        startDate: moment().startOf('day').subtract(1, "days"),
        endDate: moment().startOf('day'),
        format: "DD/MM",
        singleTimeRange: true,
        enabled: true,
    },
    {
        rangeTitle: "Same day last week",
        startDate: moment().startOf('day').subtract(7, "days"),
        endDate: moment().startOf('day').subtract(6, "days"),
        format: "DD/MM",
        singleTimeRange: true,
        enabled: true,
    },
    {
        rangeTitle: "Last 7 days",
        startDate: moment().startOf('day').subtract(7, 'days'),
        endDate: moment().startOf('day').add(1, 'days'),
        format: "DD/MM",
        singleTimeRange: false,
        enabled: true,
    },
    {
        rangeTitle: "Last 30 days",
        startDate: moment().startOf('day').subtract(30, 'days'),
        endDate: moment().startOf('day').add(1, 'days'),
        format: "DD/MM",
        singleTimeRange: false,
        enabled: true,
    },
    {
        rangeTitle: "Last 12 months",
        startDate: moment().startOf('day').subtract(12, 'months'),
        endDate: moment().startOf('day').add(1, 'days'),
        format: "MM/YYYY",
        singleTimeRange: false,
        enabled: true,
    },
    {
        rangeTitle: "All time",
        startDate: null,
        endDate: null,
        format: "MM/YYYY",
        singleTimeRange: false,
        enabled: true,
        default: true
    }
]

const getDefaultDateOption = () => {
    let defaultOption

    dateOptions.forEach(option => {
        if (option.default) defaultOption = option
    })

    return defaultOption
}

const getDateOptionByTitle = (title) => {
    let result = {}

    dateOptions.forEach(option => {
        if (option.rangeTitle === title) result = option
    })

    return result
}

export { dateOptions, getDefaultDateOption, getDateOptionByTitle }
