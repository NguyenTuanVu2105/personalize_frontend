import React, {useContext, useEffect, useState} from 'react'
import DocTitle from '../../shared/DocTitle'
import FulfillCardContainer from './FulfillCardContainer'
import FinancialCardContainer from './FinancialCardContainer'
import ChartContainer from './ChartContainer'
import TimeSelector from './TimeSelector'
import {getAnalytics, getBillingAnalytics} from '../../../services/api/dashboard'
import {Card, Checkbox, Input, Spin} from 'antd'
import UserPageContext from '../../userpage/context/UserPageContext'
import {DisplayText, Heading, TextContainer} from '@shopify/polaris'
import {produceChartjsData} from '../helper/chartDataHandling'
import {getDateOptionByTitle, getDefaultDateOption} from '../static/dateOptions'
import moment from 'moment-timezone'
import {COOKIE_KEY} from '../../../services/storage/sessionStorage'
import {DEFAULT_TIMEZONE, TIMEZONES} from '../../user-settings/constants/timezones'
import {getLocalStorage} from '../../../services/storage/localStorage'
import AppContext from "../../../AppContext"


function DashboardContainer() {
    const [loading, setLoadingState] = useState(true)

    const [timeRange, setTimeRange] = useState(getDefaultDateOption())

    const timezone = getLocalStorage(COOKIE_KEY.TIMEZONE, DEFAULT_TIMEZONE)

    const {setNameMap} = useContext(UserPageContext)
    const {setLoading} = useContext(AppContext)

    const [timeRangeTitle, setTimeRangeTitle] = useState({})
    const [fulfillCardData, setFulfillCardData] = useState({
        pending: 0,
        fulfilled: 0,
        inProduction: 0,
        requested: 0,
        rejected: 0,
        profit: 0,
        canceled: 0
    })

    const [financialCardData, setFinancialCardData] = useState({
        paid: 0,
        unpaid: 0,
        canceled: 0,
        failed: 0,
        refund: 0,
        printed_cost: 0,
    })

    const [chartData, setChartData] = useState({})


    useEffect(() => {
        setNameMap({})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [startDate, setStartDate] = useState(null)
    const [firstRender, setFirstRender] = useState(true)

    useEffect(() => {
        fetchStatisticData(firstRender)
        if (firstRender){
            setFirstRender(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRange])


    const fetchStatisticData = async (save = false) => {
        setLoadingState(true)
        let startDate = timeRange.startDate ? timeRange.startDate.format() : ""
        let endDate = timeRange.endDate ? timeRange.endDate.subtract(1, "seconds").format() : ""
        let result = null
        let billingResult = null

        await Promise.all([
            getAnalytics(startDate, endDate).then(value => {
                result = value
            }),
            getBillingAnalytics(startDate, endDate).then(value => {
                billingResult = value
            })
        ])

        let allStatistics = result.data.statistics.order.all
        let allBillingStatistic = billingResult.data.statistics.billing.all

        setFulfillCardData({
            pending: allStatistics.count.fulfill_status.unfulfilled,
            fulfilled: allStatistics.count.fulfill_status.fulfilled,
            requested: allStatistics.count.fulfill_status.requested,
            inProduction: allStatistics.count.fulfill_status.in_production,
            rejected: allStatistics.count.fulfill_status.rejected,
            canceled: allStatistics.count.fulfill_status.canceled
        })

        setFinancialCardData({
            paid: allStatistics.count.financial_status.paid,
            unpaid: allStatistics.count.financial_status.unpaid,
            canceled: allStatistics.count.financial_status.cancelled,
            failed: allStatistics.count.financial_status.failed,
            refund: allBillingStatistic.total.profit.refund,
            printed_cost: allBillingStatistic.total.profit.revenue,
        })
        setTimeRangeTitle({
            startDate: result.data.statistics.order.start_datetime,
            endDate: result.data.statistics.order.end_datetime
        })
        setChartData(produceChartjsData(result.data.statistics.order.scopes, result.data.statistics.order.unit, billingResult.data.statistics.billing.scopes))
        setLoadingState(false)
        setLoading(false)
        if (save){
            setStartDate(result.data.statistics.order.start_datetime)
        }
    }

    const handleTimeRangeChange = (startDate, endDate, rangeTitle) => {
        // console.log(startDate, endDate)
        // let temp = rangeTitle || `${moment(startDate).format("DD/MM/YY")} - ${moment(endDate).format("DD/MM/YY")}`
        if (rangeTitle) {
            setTimeRange(getDateOptionByTitle(rangeTitle))
        } else {
            let customTimeRange = {
                rangeTitle: 'Custom',
                startDate: moment(startDate).startOf('day'),
                endDate: moment(endDate).startOf('day').add(1, 'days'),
                format: "DD/MM",
                singleTimeRange: false,
                enable: true
            }
            if (customTimeRange.startDate.year() !== customTimeRange.endDate.year()) {
                customTimeRange.format = "DD/MM/YYYY"
            }
                setTimeRange(customTimeRange)
        }
    }

    return (
        <div className="dashboard-container">
            <DocTitle title="Dashboard"/>
            <div>
                <div className="d-flex flex-column">
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <TextContainer spacing="tight">
                            <DisplayText element="h3" size="large">Dashboard</DisplayText>
                            <p>
                                All statistics are listed below
                            </p>
                        </TextContainer>
                        <div className={'mt-3'}>
                            <TimeSelector
                                applyRanges={handleTimeRangeChange}
                                reloadFunction={fetchStatisticData}
                                isLoading={loading}
                                startDate={startDate}
                            />
                        </div>
                    </div>
                    <Spin spinning={loading} wrapperClassName={"page-main-content"}>
                        <Card title={<b>Personalize Design</b>} className={'m10'}>
                            <div className={"p10 m5"}>
                                <span style={{fontSize: '1.5rem'}}> Allow to  push personalize design to Shopify</span>&nbsp;
                                <Checkbox></Checkbox>
                            </div>
                            <div className={"p10 m5"}>
                                <span style={{fontSize: '1.5rem'}}> Price for sell increase each product</span> &nbsp;
                                <Input defaultValue="50" style={{width: '75px'}} suffix="%" />
                            </div>
                        </Card>
                        <TextContainer>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Heading>Fulfillment status</Heading>
                                <h4>Timezone: {TIMEZONES[timezone]}</h4>
                            </div>
                            <FulfillCardContainer {...fulfillCardData} />
                        </TextContainer>
                        <TextContainer>
                            <Heading>Financial status</Heading>
                            <FinancialCardContainer {...financialCardData} />
                        </TextContainer>
                        <TextContainer>
                            <Heading>Fulfillment and cost</Heading>
                            <ChartContainer
                                {...timeRange}
                                timeRangeTitle={timeRangeTitle}
                                data={chartData}
                            />
                        </TextContainer>
                    </Spin>
                </div>
            </div>

        </div>
    )
}

export default DashboardContainer
