import DocTitle from '../../shared/DocTitle'
import React, {useEffect, useState} from 'react'
import ProductsTable from '../../products/components/ProductsTable'
import {getShopDetail} from '../../../services/api/shops'
import Paths from '../../../routes/Paths'
import UserPageContext from '../../userpage/context/UserPageContext'


const ShopProductContainer = (props) => {

    const {shopId} = props.match.params

    const {setNameMap} = props

    const [_shopInfo, _setShopInfo] = useState({})

    const [_loading, _setLoading] = useState(true)

    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.ListShop()]: 'Stores',
            [Paths.ListProductsByShop(shopId)]: shopId
        })
        _fetchShopInfo()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shopId])


    const _fetchShopInfo = async () => {
        _setLoading(true)
        const shopRes = await getShopDetail(shopId)
        const {success: shopSucess, data: shopData} = shopRes

        if (!shopSucess)
            return

        _setShopInfo(shopData)

        _setLoading(false)
    }

    return (
        <div className="shop-product-container">
            <DocTitle title={_loading ? 'Loading...' : _shopInfo.name}/>
            <div className="flex-space-between" style={{marginBottom: '5px'}}>
                {!_loading && <h3 style={{marginBottom: '0.2em'}}>{_shopInfo.name}'s products</h3>}
            </div>
            <ProductsTable shopId={shopId}/>
        </div>
    )
}

export default (props) => <UserPageContext.Consumer>
    {(context) => {
        return (<ShopProductContainer {...{...props, ...context}} />)
    }}
</UserPageContext.Consumer>
