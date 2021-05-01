import moment from 'moment-timezone'
import {COOKIE_KEY} from "../storage/sessionStorage"
import {DEFAULT_TIMEZONE} from "../../app/user-settings/constants/timezones"
import {getLocalStorage} from '../storage/localStorage'

// export const getLocalMoment = (strDatetime) => {
//     return moment.utc(strDatetime).local()
// }

export const convertDatetime = (strDatetime) => {
    const timezone = getLocalStorage(COOKIE_KEY.TIMEZONE, DEFAULT_TIMEZONE)
    return moment.tz(strDatetime, timezone)
}

export const convertDatetimeWithoutTimezone = (strDatetime) => {
    return moment(strDatetime)
}

export const formatDatetime = (strDatetime) => {
    return convertDatetime(strDatetime).format('hh:mm A DD/MM/YY')
}

export const formatShortDatetime = (strDatetime) => {
    return convertDatetime(strDatetime).format('HH:mm DD/MM/YY')
}

export const formatVerboseDatetime = (strDatetime) => {
    return convertDatetime(strDatetime).format('DD-MM-YYYY [at] h:mm A')
}

export const formatShortDate = (datetime) => {
    const dateArray = datetime.toDateString().split(" ")
    return `${dateArray[1]} ${dateArray[2]}, ${dateArray[3]}`
}

export const parseDuration = (duration) => {
    const RE_DURATION = /(?<days>\d*)[ ]?(?<hours>\d+):(?<minutes>\d+):(?<seconds>\d+)/
    const matchObj = RE_DURATION.exec(duration)
    let groups = matchObj.groups
    if (!groups.days) {
        groups.days = "0"
    }
    return groups
}

export const convertToSeconds = (days, hours, minutes, seconds) => {
    // console.log(days * 24 + hours)
    return ((parseInt(days) * 24 + parseInt(hours)) * 60 + parseInt(minutes)) * 60 + parseInt(seconds)
}

export const parseDurationToSecond = (duration) => {
    return moment.duration(duration).asSeconds()
}