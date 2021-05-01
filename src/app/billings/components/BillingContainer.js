import React from 'react'
import DocTitle from '../../shared/DocTitle'
import InvoiceListContainer from './InvoiceListContainer'

export default (props) => {
    return (
        <div>
            <DocTitle title="Billings"/>
            <InvoiceListContainer {...props}/>
        </div>
    )
};
