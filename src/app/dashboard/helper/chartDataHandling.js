import moment from 'moment-timezone'
import {FULFILLMENT_STATUS_COLOR} from '../constant/colors.js'

const produceChartjsData = (allData, timeUnit, billingData) => {
    let timeFormat
    switch (timeUnit) {
        case "quarter":
            break
        case "month":
            timeFormat = "MM/YYYY"
            break
        case "hour":
            timeFormat = "HH:mm"
            break
        default:
            timeFormat = "DD-MM"
            break
    }

    let timeLabels = []
    let totalOrders = []

    allData.forEach((data, index) => {
        let timeLabel = data.time.at
        let quarter_matches = data.time.at.match(/Q\d{1}/g)
        if (quarter_matches == null) {
            timeLabel = moment(data.time.at).format(timeFormat)
        } else {
            let year = data.time.at.match(/20\d{2}/g)[0]
            timeLabel = `${quarter_matches[0]}-${year}`
        }
        timeLabels.push(timeLabel)
        totalOrders.push(data.count.total ? data.count.total : 0)
    })

    let datasets = [
        {
            type: 'line',
            label: 'Total Order',
            fill: false,
            data: totalOrders,
            lineTension: 0.1,
            yAxisID: 'y-axis-1',
            backgroundColor: 'transparent',
            borderColor: FULFILLMENT_STATUS_COLOR.total_orders
        }

    ]

    return {
        labels: timeLabels,
        datasets: datasets
    }
}

const findMaxAbsoluteOrder = (data) => {
    // console.log(data);

    let orderDataset = data.datasets

    let orderArr = orderDataset && orderDataset.map(item => item.data).flat()

    let maxAbsOrder = orderArr && scaleMax(Math.max(...orderArr))

    return maxAbsOrder || 5
}

const scaleMax = (num) => {
    return Math.ceil(num * 1.1)
}


const produceGoogleChartData = (allData) => {
    return allData.map((data) => [
        moment(data.time.at).format("D-MMM-YY"),
        handleGoogleChartColumnData(data.count.fulfill_status.unfulfilled),
        handleGoogleChartColumnData(data.count.fulfill_status.fulfilled),
        handleGoogleChartColumnData(data.count.fulfill_status.in_production),
        handleGoogleChartColumnData(data.count.fulfill_status.rejected),
        data.est_profit.amount
    ])
}

// Show tiny bar if column value = 0
const handleGoogleChartColumnData = (number) => {
    return parseInt(number) !== 0 ? number : {v: 0.1, f: '0'}
}

export {produceGoogleChartData, produceChartjsData, findMaxAbsoluteOrder}
