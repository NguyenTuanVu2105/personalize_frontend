import React from 'react'
import DocTitle from '../../shared/DocTitle'
import Orders from './Orders'

const OrdersContainer = function (props) {

    return (
        <div>
            <DocTitle title="Orders"/>
            <Orders {...props} />
        </div>
    )
}

export default OrdersContainer