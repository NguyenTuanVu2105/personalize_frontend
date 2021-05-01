import React from 'react'
import {Badge, Card} from '@shopify/polaris'
import './styles.scss'
import {List} from "antd"

function FulfillCardContainer({pending, fulfilled, requested, inProduction, rejected, canceled}) {

    const data = [
        {
            title: "Pending",
            count: `${pending}`,
            color: "attention",
            progress: 'incomplete'
        },
        {
            title: "Requested",
            count: `${requested}`,
            color: "info",
            progress: 'partiallyComplete'
        },
        {
            title: "In Production",
            count: `${inProduction}`,
            color: "info",
            progress: 'partiallyComplete'
        },
        {
            title: "Fulfilled",
            count: `${fulfilled}`,
            color: "success",
            progress: 'complete'
        },
        {
            title: "Rejected",
            count: `${rejected}`,
            color: null,
            progress: 'complete'
        },
        {
            title: "Cancelled",
            count: `${canceled}`,
            color: "warning",
            progress: 'complete'
        },
    ]

    return (
        <div>
            <List
                className='fulfill-dashboard'
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 3,
                    lg: 6,
                    xl: 6,
                    xxl: 6
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

export default FulfillCardContainer
