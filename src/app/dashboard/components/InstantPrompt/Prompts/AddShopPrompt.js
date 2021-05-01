import React from 'react'
import {Banner, Button} from '@shopify/polaris'
import Paths from '../../../../../routes/Paths'
import {Link} from 'react-router-dom'

const AddShopPrompt = () => {
    return (
        <div className={'m-b-20'}>
            <Banner title="Connect your shop to sync products" status="info">
                <div className="p-b-10">
                    <p>You need to add shop before create products. Click button below to add your shop</p>
                </div>

                <Link to={Paths.ListShop()}>
                    <Button>
                        Go to shop manager
                    </Button>
                </Link>


            </Banner>
        </div>
    )
}
export default AddShopPrompt
