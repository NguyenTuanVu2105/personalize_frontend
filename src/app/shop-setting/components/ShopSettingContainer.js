import {Card, DisplayText, Tabs, TextContainer} from '@shopify/polaris'
import React, {useCallback, useContext, useEffect, useState} from 'react'
import ShopShippingRateMapping from './ShopShippingRateMapping'
import DocTitle from '../../shared/DocTitle'
import ShopInfo from './shop-info/ShopInfo'
import Paths from '../../../routes/Paths'
import UserPageContext from '../../userpage/context/UserPageContext'
import {withRouter} from 'react-router-dom'
import {getShopStatistic} from '../../../services/api/shops'


const ShopSettingContainer = (props) => {
    const shopId = parseInt(props.match.params.shopId)
    const [selected, setSelected] = useState(0)
    const {setNameMap} = useContext(UserPageContext)
    const [shopInfo, setShopInfo] = useState(null)
    const [, setLoadingShippingRate] = useState(false)

    const handleTabChange = useCallback(
        (selectedTabIndex) => {
            setSelected(selectedTabIndex)
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [],
    )


    useEffect(() => {
        _fetchShopInfo().then()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.ListShop()]: 'Shops',
            [Paths.ListProductsByShop(shopId)]: `${shopId}`,
            [Paths.ShopSetting(shopId)]: 'Setting',
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // console.log(stepTut, visibleTutorial)

    const _fetchShopInfo = async () => {
        const shopRes = await getShopStatistic(shopId)
        setShopInfo(shopRes.data)
        // console.log(shopRes.data)
    }

    const tabs = [
        {
            id: 'info',
            content: 'Basic info',
            body: <ShopInfo shopInfo={shopInfo} refreshShopInfo={_fetchShopInfo}/>,
            panelID: 'info',
        },
        {
            id: 'shipping',
            content: <div className='step-shipping'>Shipping</div>,
            body: <ShopShippingRateMapping shopId={shopId} setLoadingShippingRate={setLoadingShippingRate}/>,
            panelID: 'shipping',
        },
    ]
    return (
        <div>
            <DocTitle title={'Shop Setting' + (shopInfo ? `: ${shopInfo.url}` : '')}/>
            <div>
                <TextContainer spacing="tight">
                    <DisplayText element="h3"
                                 size="large">{'Setting' + (shopInfo ? `: ${shopInfo.url}` : '')}</DisplayText>
                    <p>
                        View and update your shop details
                    </p>
                </TextContainer>
            </div>
            <br/>
            <Card>
                <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
                    <Card.Section title={''}>
                        {tabs[selected].body}
                    </Card.Section>
                </Tabs>
            </Card>
        </div>


    )
}

export default withRouter(ShopSettingContainer)
