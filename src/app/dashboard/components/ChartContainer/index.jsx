import React from 'react'
import {Card} from '@shopify/polaris'
import Chartjs from './Chartjs';
import moment from 'moment-timezone'

function ChartContainer({rangeTitle, singleTimeRange, timeRangeTitle, data, format}) {
    const {startDate, endDate} = timeRangeTitle
    // const loadingContainer = (
    //     <SkeletonBodyText lines={20} />
    // )

    // console.log(data)
    const renderChartjs = () => {
        return <Chartjs data={data} title={singleTimeRange ?
            `${rangeTitle} (${moment(startDate).format(format)})` :
            `${rangeTitle} (${moment(startDate).format(format)} - ${moment(endDate).format(format)})`
        }/>
    }

    return (
        <Card sectioned>
            {renderChartjs()}
        </Card>
    )
}

export default ChartContainer
