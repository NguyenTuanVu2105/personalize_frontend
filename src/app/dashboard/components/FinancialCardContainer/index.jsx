import React from 'react'
import {Badge, Card} from '@shopify/polaris'
import './styles.scss'
import {List} from "antd"
import {numberFormatCurrency} from "../../../shared/FormatNumber";
// import {numberFormatCurrency} from "../../../shared/FormatNumber"

function FinancialCardContainrer({paid, unpaid, canceled, failed, refund, printed_cost}) {

    const data = [
        {
            title: "Pending",
            count: `${unpaid}`,
            color: "attention",
            progress: 'incomplete'
        },
        {
            title: "Paid",
            count: `${paid}`,
            color: 'success',
            progress: 'complete'
        },
        {
            title: "Failed",
            count: `${failed}`,
            color: "new",
            progress: 'incomplete'
        },
        {
            title: "Cancelled",
            count: `${canceled}`,
            color: 'warning',
            progress: 'complete'
        },
        {
            title: "Refund",
            count: `${numberFormatCurrency(refund)}`,
            color: 'info',
            progress: 'complete'
        },
        {
            title: "Printed cost",
            count: `${numberFormatCurrency(printed_cost)}`,
            color: 'success',
            progress: 'complete'
        },
    ]

    return (
        <div>
            <List
                className='financial-dashboard'
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 3,
                    lg: 6,
                    xl: 6,
                    xxl: 6,
                }}
                dataSource={data}
                renderItem={item => (
                    <List.Item>
                        <Card sectioned title={<div style={{margin: '-1rem 0 -2rem 0', textAlign: 'center'}}><p style={{fontSize: '3rem'}}>{item.count}</p></div>}>
                            {/*<p className="text-uppercase title">{item.title}</p>*/}
                            <div className='text-center'><Badge progress={item.progress} status={item.color}>{item.title}</Badge></div>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    )
}

export default FinancialCardContainrer
