import {Modal as AntModal, Table} from 'antd'
import React, {useContext, useEffect, useState} from 'react'
import shopify from '../../../../assets/images/shopify.svg'
import woocommerce from '../../../../assets/images/woocommerce.png'
import {withRouter} from 'react-router-dom'
import {Modal} from '@shopify/polaris'
import {getShopsList, pushAllToShop} from '../../../../services/api/shops'
import AppContext from '../../../../AppContext'


const ChooseShopToSyncModal = (props) => {
    const {onClose, visible, onSuccess} = props

    const [shops, setShops] = useState(null)

    const [selectedShops, setSelectedShops] = useState([])

    const {currentShop} = props

    const {setLoading} = useContext(AppContext)

    const rowSelection = {
        selectedShops,
        onChange: (keys) => {
            // console.log(keys)
            setSelectedShops([...keys])
        }
    }

    useEffect(() => {
        if (visible) {
            _fetchShops().then()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible])

    const _fetchShops = async () => {

        const storesRes = await getShopsList()

        if (storesRes.success && storesRes.data) {
            const shops = storesRes.data.results.filter(shop => shop.id !== currentShop.id && shop.currency === currentShop.currency)
            if (shops.length > 0){
                setShops(shops)
            } else {
                onClose()
                AntModal.warn({
                    title: 'No available shop',
                    content: (
                        <div>
                            No available shop with currency {currentShop.currency} to sync with
                        </div>
                    ),
                    onOk() {
                        onSuccess()
                    },
                })
            }

        }

    }

    // console.log(selectedShops)

    const _columns = [
        {
            title: 'Platform',
            dataIndex: 'ecommerce',
            key: 'ecommerce',
            render: (text, record) => {
                const ecommerce = record.ecommerce.name
                return (
                    <div>
                        <img src={ecommerce.toLowerCase() === 'shopify' ? shopify : woocommerce}
                             alt={ecommerce} width={30}/>
                    </div>
                )
            },
        },
        {
            title: 'Url',
            dataIndex: 'url',
            key: 'url',
            render: (text, record) => {
                return (<div>{record.url}</div>)
            }
        }

    ]

    const onSubmit = async () => {
        setLoading(true)
        // console.log(selectedShops)
        // pushAllToShop(currentShopId, selectedShops).then()
        const res = await pushAllToShop(currentShop.id, selectedShops)
        setLoading(false)
        const syncedProductCount = res.data.synced_product_count
        AntModal.info({
            title: 'Product syncing success',
            content: (
                <div>
                    You have synced <b>{syncedProductCount}</b> product into shop <b>{currentShop.url}</b>
                </div>
            ),
            onOk() {
                onSuccess()
            },
        })
        onClose()
    }


    return (
        <Modal
            size={'large'}
            title="Clone available products from exist shop"
            open={visible}
            onClose={onClose}
            maskClosable={false}
            primaryAction={{
                content: "Sync product",
                onAction: onSubmit,
                disabled: selectedShops.length === 0
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: onClose,
                },
            ]}
        >
            <div>

                <Table
                    rowKey={shop => shop.id}
                    showHeader={true}
                    rowSelection={rowSelection}
                    dataSource={shops}
                    columns={_columns}
                />
            </div>
        </Modal>
    )
}

export default withRouter(ChooseShopToSyncModal)
