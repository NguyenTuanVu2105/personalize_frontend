import moment from 'moment-timezone'

const days = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
]

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

const CUSTOM_TIME_QUERY = '7'


const formattedTime = (timestamp) => {
    const d = new Date(timestamp);
    const year = d.getFullYear()
    const date = d.getDate()
    const monthName = months[d.getMonth()]
    const dayName = days[d.getDay()]
    return `${dayName}, ${date} ${monthName} ${year} ` + d.toLocaleTimeString();
}

const formatTimeSelect = (choice) =>{
    const today = new Date()
    const todayIsoString = today.toISOString()
    let since = null, until = null
    switch (choice) {
        case '1':
            since = todayIsoString
            until = todayIsoString
            break
        case '2':
            since = today
            since.setDate(today.getDate() - 1)
            since = since.toISOString()
            until = since
            break
        case '3':
            since = today
            since.setDate(today.getDate() - 7)
            since = since.toISOString()
            until = todayIsoString
            break
        case '4':
            since = today
            since.setDate(today.getDate() - 30)
            since = since.toISOString()
            until = todayIsoString
            break
        case '5':
            since = today
            since.setDate(today.getDate() - 90)
            since = since.toISOString()
            until = todayIsoString
            break
        case '6':
            since = today
            since.setDate(today.getDate() - 365)
            since = since.toISOString()
            until = todayIsoString
            break
        case CUSTOM_TIME_QUERY:
        default:
            break
    }

    since = moment(since).startOf("day").toISOString()
    until = moment(until).endOf("day").toISOString()
    return {since,until}
}


export {formattedTime, formatTimeSelect}
