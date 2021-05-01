import {Col, Row} from 'antd'
import React from 'react'

const BillSummary = ({label, value, textBold = false}) => {
    return <Row type={'flex'} align={'middle'} justify={'space-between'}
                style={textBold ? {fontWeight: 'bold'} : null} className={'mb-2'}>
        <Col>
            {label}
        </Col>
        <Col>{value}</Col>
    </Row>
}
export default BillSummary
