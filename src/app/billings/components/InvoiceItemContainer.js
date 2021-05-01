import {Col, Row} from 'antd'
import {Link} from 'react-router-dom'
import Paths from '../../../routes/Paths'
import React from 'react'
import InvoiceItem from './InvoiceItem'
import {Card, Heading} from '@shopify/polaris'
import InvoiceStatus from './InvoiceStatus'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import {numberFormatCurrency} from "../../shared/FormatNumber"

const BillSummary = ({label, value, textBold = false, discount = false}) => {
    return <Row type={'flex'} align={'middle'} justify={'space-between'}
                style={textBold ? {fontWeight: 'bold'} : null} className={'mb-2'}>
        <Col>
            <h6>{label}</h6>
        </Col>
        <Col style={discount ? {color: 'orange'} : {}}>
            {value}
        </Col>
    </Row>
}


export default function ({data}) {
    const {items, production_cost, shipping_cost, total_cost, currency, order_pack, status, discount} = data
    const shippingCost = () => {
        if (shipping_cost) {
            if (Math.round(shipping_cost * 100) === 0) {
                return 'Free'
            } else {
                return numberFormatCurrency(parseFloat(shipping_cost), currency)
            }
        } else {
            return 'N/A'
        }
    }

    //Sort items by order_item.id
    items.sort((a, b) => a.order_item.id - b.order_item.id)


    return (
        <div className={'col-12 mt-4 mb-3'}>
            <Card sectioned
                  title={
                      <div style={{display: 'flex'}}>
                          <Link to={Paths.OrderDetail(order_pack.order_id)}>
                              <Heading>Order Pack #{order_pack.id}</Heading>
                          </Link>&nbsp;&nbsp;
                          <InvoiceStatus status={status} style={{padding: '.5rem .8rem'}}/>
                      </div>
                  }
                  actions={[{
                      content: <Link to={Paths.OrderDetail(order_pack.order_id)} target={'_blank'}>View order  &nbsp;
                          <FontAwesomeIcon icon={faExternalLinkAlt}/></Link>
                  },]}>
                <div>
                    {items.map((item, i) => <InvoiceItem key={i} invoiceItem={item}/>)}
                </div>
                <div className={'m-b-10'}>
                    <Row>
                        <Col span={9} offset={15} style={{paddingLeft: '1.5rem'}}>
                            <BillSummary
                                label={`Production cost:`}
                                value={`${numberFormatCurrency(parseFloat(production_cost), currency)}`}
                                textBold={true}
                            />
                            <BillSummary
                                label={`Shipping cost:`}
                                value={shippingCost()}
                                textBold={true}
                            />
                            {parseFloat(discount) !== 0 &&
                            <BillSummary
                                label={`Discount:`}
                                value={`- ${numberFormatCurrency(parseFloat(discount), currency)}`}
                                textBold={true}
                                discount={true}
                            />}
                            <BillSummary
                                label={`Total:`}
                                value={`${numberFormatCurrency(parseFloat(total_cost), currency)}`}
                                textBold={true}
                            />
                        </Col>
                    </Row>
                </div>
            </Card>
        </div>
    )
}
