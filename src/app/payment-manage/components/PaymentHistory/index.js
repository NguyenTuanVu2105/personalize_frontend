import React from 'react'
import HistoryTable from '../TransactionHistoryTable'

const PaymentHistory = () => {
    return (
        <div className={'col-lg-12 my-2'}>
            <div className="row mx-0 w-100">
                <HistoryTable/>
            </div>
        </div>
    )
}

export default PaymentHistory