import React, {useContext, useEffect, useState} from "react"
import {Table} from "antd"
import {getProductStatistic} from "../../../services/api/productStatistic"
import UserPageContext from "../../userpage/context/UserPageContext"

const NA_VALUE = "N/A"

const StatisticTable = () => {
    const {scrollTable} = useContext(UserPageContext)
    const [isLoading, setIsLoading] = useState(false)
    const [dataSource, setDataSource] = useState([])


    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        const res = await getProductStatistic()
        if (res.success) {
            if (res.data) {
                const data = res.data
                const sources = []
                const hasValue = []
                const noValue = []
                data.forEach((item, index) => {
                    const data = {
                        ...item,
                        key: index,
                        est_production_time_default: parseFloat(item.est_production_time_default) > 0 ? parseFloat(item.est_production_time_default) : NA_VALUE,
                        production_time_default: parseFloat(item.production_time_default) > 0 ? parseFloat(item.production_time_default) : NA_VALUE
                    }
                    if (data.est_production_time_default !== NA_VALUE && data.production_time_default !== NA_VALUE) {
                        hasValue.push(data)
                    } else {
                        noValue.push(data)
                    }
                })
                sources.push(...hasValue, ...noValue)
                const results = []
                for (let i = 0; i < sources.length; i += 2) {
                    const item = {
                        first: sources[i] ? {
                            ...sources[i]
                        } : undefined,
                        second: sources[i + 1] ? {
                            ...sources[i + 1]
                        } : undefined
                    }
                    results.push({...item, key: i / 2,})
                }
                setDataSource(results)
            }
        }
        setIsLoading(false)
    }

    const renderProductionTime = (product) => {
        if (product) {
            if (product.production_time_default !== NA_VALUE && product.est_production_time_default !== NA_VALUE) {
                return (
                    <span className={product.production_time_default < product.est_production_time_default ? "time-positive" : "time-negative"}>
                        {product.production_time_default}/{product.est_production_time_default}
                    </span>
                )
            } else {
                return NA_VALUE
            }
        } else {
            return ""
        }
    }

    const columns = [
        {
            title: "Products",
            dataIndex: "first_ph_product_title",
            width: "25%",
            render: (text, record) => record.first ? record.first.ph_product_title : ""
        },
        {
            title: (
                <div className="d-flex flex-column">
                    <span>Production time</span>
                    <span className="text-black-50">Average/Estimation<br/>(Business days)</span>
                </div>
            ),
            className: "border-right",
            dataIndex: "first_production_time",
            width: "25%",
            align: "center",
            render: (text, record) => renderProductionTime(record.first)
        },
        {
            title: "Products",
            dataIndex: "second_ph_product_title",
            width: "25%",
            render: (text, record) => record.second ? record.second.ph_product_title : ""
        },
        {
            title: (
                <div className="d-flex flex-column">
                    <span>Production time</span>
                    <span className="text-black-50">Average/Estimation<br/>(Business days)</span>
                </div>
            ),
            dataIndex: "second_production_time",
            width: "25%",
            align: "center",
            render: (text, record) => renderProductionTime(record.second)
        }
    ]


    return (
        <Table
            className="mt-4"
            columns={columns}
            dataSource={dataSource}
            loading={isLoading}
            {...scrollTable}
            rowKey={record => record.key}
            pagination={false}
        />
    )
}

export default StatisticTable