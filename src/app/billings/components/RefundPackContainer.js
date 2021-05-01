import React from 'react'
import {Card, Heading} from '@shopify/polaris'
import PackSummary from './PackSummary'
import RefundItem from './RefundItem'
import {Col, Row} from "antd"
import {numberFormatCurrency} from "../../shared/FormatNumber"

const RefundPackContainer = ({data}) => {
    const {info, amount, currency} = data
    let totalProductionCost = 0
    return (
        <div className={'col-12 mt-4 mb-3'}>
            <Card sectioned
                  title={
                      <div style={{display: 'flex'}}>
                          <Heading>Refund</Heading>
                      </div>
                  }>
                <div className={'m-t-10'}>
                    {
                        info.items.map((item, i) => {
                            totalProductionCost += (parseFloat(item.production_cost))
                            return <RefundItem key={i} item={item} currency={currency}/>
                        })
                    }
                </div>
                <div className={'m-b-10'}>
                    <Row>
                        <Col span={9} offset={15} style={{paddingLeft: '1.5rem'}}>
                            <PackSummary
                                label={`Shipping cost:`}
                                value={`-${numberFormatCurrency(parseFloat(amount) - parseFloat(totalProductionCost), currency)}`}
                                textBold={true}/>
                            <PackSummary
                                label={`Total:`}
                                value={`-${numberFormatCurrency(parseFloat(amount), currency)}`}
                                textBold={true}/>
                        </Col>
                    </Row>
                </div>
            </Card>
        </div>
    )
}

export default RefundPackContainer
