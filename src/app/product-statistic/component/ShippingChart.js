import React, {useEffect, useRef} from "react"
import {getShippingAnalysis} from "../../../services/api/productStatistic"
import Chart from "chart.js"
import {convertDatetime} from "../../../services/util/datetime"

export const ShippingChart = () => {
    const chartRef = useRef()
    const chartCanvasRef = useRef()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const response = await getShippingAnalysis()
        const dataShipping = response.data
        const labels = []
        const dataSource = []

        let max = 0
        let timeFrom = ''
        let timeTo = ''
        if (dataShipping && dataShipping.length > 0) {
            timeFrom = dataShipping[0].point
            timeTo = dataShipping[0].point
            dataShipping.forEach(value => {
                labels.push(convertDatetime(value.point).format("DD/MM"))
                if (max < parseFloat(value.average_time)) {
                    max = parseFloat(value.average_time)
                }
                if (timeTo < value.point) {
                    timeTo = value.point
                }
                if (timeFrom > value.point) {
                    timeFrom = value.point
                }
                dataSource.push(value.average_time)
            })
        }


        const data = {
            labels,
            datasets: [{
                type: 'line',
                label: 'Average (business days)',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: dataSource,
                fill: false
            }]
        }
        if (dataShipping && dataShipping.length > 0) {
            const startTime = convertDatetime(timeFrom)
            const endTime = convertDatetime(timeTo)
            let title = endTime.from(startTime)
            title = title.replace("in ", "") + " (" + startTime.format("DD/MM") + "-" + endTime.format("DD/MM") + ")"

            if (typeof chartRef.current !== "undefined") chartRef.current.destroy()

            if (chartCanvasRef.current) {
                const context = chartCanvasRef.current.getContext("2d")
                chartRef.current = new Chart(context, {
                    type: "line",
                    data: data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        title: {
                            display: true,
                            text: title
                        },
                        elements: {
                            line: {
                                tension: 0
                            }
                        },
                        scales: {
                            yAxes: [
                                {
                                    id: 'averageTime',
                                    ticks: {
                                        beginAtZero: true,
                                        callback: (value) => {
                                            if (value % 1 === 0 && value >= 0) {
                                                return value;
                                            }
                                        },
                                        min: 0,
                                        max: max + 2,
                                    },
                                    gridLines: {
                                        drawOnChartArea: true
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Average shipping time (business days)'
                                    }
                                }
                            ],
                            xAxes: [
                                {
                                    id: 'time',
                                    gridLines: {
                                        drawOnChartArea: true
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Time'
                                    }
                                }
                            ]
                        },
                        tooltips: {
                            // Custom tooltip
                            callbacks: {
                                label: (item, data) => {
                                    let datasetLabel = data.datasets[item.datasetIndex].label || ''
                                    return datasetLabel + ': ' + item.yLabel + " days";
                                }
                            }
                        }
                    }
                })
            }
        }

    }

    return (
        <div style={{height: 500}}>
            <canvas id="chartCanvas" ref={chartCanvasRef}/>
        </div>
    )
}

export default ShippingChart