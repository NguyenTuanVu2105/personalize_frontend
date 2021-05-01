import React, { useRef } from 'react'
import Chart from 'chart.js'
import { useEffect } from 'react'
import { findMaxAbsoluteOrder } from '../../helper/chartDataHandling'

function Chartjs({ data, title }) {
    const chartRef = useRef()
    const chartCanvasRef = useRef()

    useEffect(() => {
        buildChart()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])
    //console.log(data)
    const buildChart = () => {
        if (typeof chartRef.current !== "undefined") chartRef.current.destroy();

        const context = chartCanvasRef.current.getContext("2d")
        // console.log(title)
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
                scales: {
                    yAxes: [{
                        id: 'y-axis-1',
                        ticks: {
                            beginAtZero: true,
                            callback: (value) => { if (value % 1 === 0 && value >= 0) { return value; } },
                            min: 0,
                            max: findMaxAbsoluteOrder(data),
                        },
                        gridLines: {
                            drawOnChartArea: true
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Order'
                        }
                    }]
                },
                tooltips: {
                    // Custom tooltip
                    callbacks: {
                        label: (item, data) => {
                            var datasetLabel = data.datasets[item.datasetIndex].label || ''
                            // var dataPoint = data.datasets[item.datasetIndex].data[item.index]

                            return datasetLabel === "Estimated Profit" ? datasetLabel + ': $' + item.yLabel
                                : datasetLabel + ': ' + item.yLabel;
                        }
                    }
                }
            }
        });
    }

    return (
        <canvas id="chartCanvas" ref={chartCanvasRef} style={{ height: "500px" }} />
    )
}

export default Chartjs