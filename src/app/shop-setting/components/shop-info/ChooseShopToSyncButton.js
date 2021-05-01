import React, {useState} from 'react'
import {withRouter} from 'react-router-dom'
import {Button} from '@shopify/polaris'
import ChooseShopToSyncModal from './ChooseShopToSyncModal'


const ChooseShopToSyncButton = (props) => {
    const [visible, setVisible] = useState(false)

    return (
        <span>
            <Button id='step-sync-product' onClick={() => setVisible(true)}>Sync Products</Button>
            <ChooseShopToSyncModal visible={visible}
                                   onClose={() => setVisible(false)}
                                   onSuccess={props.onSuccess}
                                   currentShop={props.currentShop}/>
        </span>
    )
}

export default withRouter(ChooseShopToSyncButton)
