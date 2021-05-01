import React, { useEffect, useState } from 'react'
import { getOrder } from '../../../../services/api/orders'
import {Icon, Modal} from 'antd'
import './OrderDocumentList.scss'
import OrderPack from '../order-detail/OrderPack'


const OrderDocumentsList = (props) => {
    const [isLoading, setIsLoading] = useState(true)
    const [packs, setPacks] = useState({ id: '', created_date: '', customer_info: '' })
    const [order, setOrder] = useState({})

    useEffect(() => {
        _fetchOrderById()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const _fetchOrderById = async () => {

        setIsLoading(true)

        const orderResp = await getOrder(props.orderId)

        let { success, data: orderResult, message } = orderResp

        if (!success) {
            Modal.error({
                content: message
            })
        }
        if (!orderResult) return

        let isPackOpen = orderResult.packs.map(() => false)
        if (isPackOpen.length > 0)
            isPackOpen[0] = true
        setPacks(orderResult.packs)
        setOrder(orderResult)
        setIsLoading(false)
    }

    const allPacks = () => {
        if (!packs || packs.length <= 0)
            return null

        return (
            packs.map((pack, index) => (
                <OrderPack
                    orderId={order.id}
                    key={pack.id} value={pack}
                    index={index}
                    refetch={_fetchOrderById}
                    packs={packs}
                    is_editable={order.is_item_editable}
                />
            ))
        )
    }

    return (<div className={'order-details-list'}>
        {isLoading ?
            <div className={'order-details-list--icon'}><Icon type="loading" /></div> :
            allPacks()
        }
    </div>)

}

export default OrderDocumentsList
