import React from "react"
import {ShippingZoneConfig} from "../../constants/shippingZoneConfig"
import {Table} from "antd"
import {Card} from "@shopify/polaris"

const ShippingTimeTable = ({dataSources}) => {

    const columns = []

    const est_processing_column = {
        title: "Est production time",
        dataIndex: "processing_time",
        key: "processing_time",
        render: (text, record) => {
            return (
                <div>
                    {record.delivery_info.processing_time.min}
                    &nbsp;~&nbsp;
                    {record.delivery_info.processing_time.max}
                    &nbsp; business days
                </div>
            )
        }
    }

    const avg_processing_column = {
        title: "Avg production time",
        dataIndex: "avg_progressing_range",
        key: "avg_progressing_range",
        render: (avg_progressing_range) => {
            return (
                <div>
                    {parseFloat(avg_progressing_range)}&nbsp; business days
                </div>
            )
        }
    }

    const zone_column = {
        title: "Country/region",
        dataIndex: "zones",
        key: "zones",
        className: "flex-column d-flex",
        render: (zones) => {
            const iconSize = 16
            return (
                zones.map((zone, index) => {
                    return (
                        <div key={index} className="mb-2 mt-2">
                            <img
                                src={ShippingZoneConfig[zone].icon}
                                alt={ShippingZoneConfig[zone].tooltip}
                                style={{
                                    width: iconSize,
                                    height: iconSize,
                                    marginBottom: 3
                                }}
                            />
                            &nbsp;&nbsp;
                            {ShippingZoneConfig[zone].title}
                        </div>
                    )
                })

            )
        }
    }

    const shipping_time_column = {
        title: "Shipping time",
        dataIndex: "shipping_time",
        key: "shipping_time",
        render: (text, record) => {
            return (
                <div>
                    {record.delivery_info.shipping_time.min}
                    &nbsp;~&nbsp;
                    {record.delivery_info.shipping_time.max}
                    &nbsp;business days
                </div>
            )
        }
    }

    columns.push(zone_column)

    if (dataSources[0].avg_progressing_range) {
        columns.push(avg_processing_column)
    } else {
        columns.push(est_processing_column)
    }

    columns.push(shipping_time_column)

    const footer = () => {
        return (
            <div
                className="flex-center"
                style={{
                    color: "#c19e03",
                    fontStyle: "italic"
                }}
            >
                Due to the pandemic, the shipping time may be delayed 6-10 business days in CA, EU, UK and 2-6 business
                days in the US
            </div>
        )
    }

    return (
        <div className={'mt-4 shopifilize-card'}>
            <Card sectioned title={"Shipping time"}>
                <div className={'shopifilize-table'}>
                    <Table
                        dataSource={dataSources}
                        columns={columns}
                        pagination={false}
                        rowKey={(record) => record.id}
                        footer={footer}
                    />
                </div>
            </Card>
        </div>
    )
}

export default ShippingTimeTable