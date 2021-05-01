import React from 'react'
import {Banner, Button} from '@shopify/polaris'
import Paths from '../../../../../routes/Paths'
import {Link} from 'react-router-dom'

const InstructionPrompt = () => {
    return (
        <div className={'m-b-20'} >
            <Banner title="Welcome to PrintHolo Fulfillment!" status="info">
                <div className="p-b-10">
                    <p>Select Create Product button to start customizing products for adding to your store.</p>
                </div>
                <Link to={{pathname: Paths.NewProduct, deleteSession: true}}>
                    <Button primary>CREATE PRODUCT</Button>
                </Link>
            </Banner>
        </div>
    )
}
export default InstructionPrompt
