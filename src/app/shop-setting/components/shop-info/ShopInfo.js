import React from 'react'
import {Heading, TextContainer} from '@shopify/polaris'
import {Descriptions, Spin} from 'antd'
import {formatDatetime} from '../../../../services/util/datetime'
import ChooseShopToSyncButton from './ChooseShopToSyncButton'

const ShopInfo = (props) => {
    const {shopInfo, refreshShopInfo} = props

    if (shopInfo==null){
        return <div className="width-100 h-100 text-center">
            <Spin tip="Loading..."/>
        </div>
    }

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <TextContainer spacing="tight">
                    <Heading element="h3">Basic info</Heading>
                    <TextContainer>Shop's basic info and statistics</TextContainer>
                </TextContainer>
            </div>
            <br/>
            <Descriptions bordered>
                <Descriptions.Item label="Shop address">{shopInfo.url}</Descriptions.Item>
                <Descriptions.Item label="Owner email">{shopInfo.email}</Descriptions.Item>
                <Descriptions.Item label="Currency">{shopInfo.currency}</Descriptions.Item>
                <Descriptions.Item label="Last updated time">{formatDatetime(shopInfo.update_time)}</Descriptions.Item>
                <Descriptions.Item label="Status">{shopInfo.status}</Descriptions.Item>
                <Descriptions.Item label="Created product">{shopInfo.user_product_in_shop} &nbsp;
                    <span><ChooseShopToSyncButton currentShop={shopInfo} onSuccess={refreshShopInfo}/></span>
                </Descriptions.Item>
            </Descriptions>
        </div>
    )
}

export default ShopInfo
