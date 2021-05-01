import React, {useContext, useEffect, useState} from 'react'
import {Button, Icon, Modal, Tabs} from "@shopify/polaris"
import {MobilePlusMajorMonotone} from '@shopify/polaris-icons'
import UserProductSection from "../../../../new-order/components/ProductModal/UserProductSection"
import _ from "lodash"
import OrderDetailContext from "../context/OrderDetailContext"
import SampleProductSection from "../../../../new-order/components/ProductModal/SampleProductSection"
import {DEFAULT_CURRENCY} from "../../../../new-product/constants/constants"
import {addOrderItem} from "../../../../../services/api/orders"
import {notification} from "antd"

const AddOrderItemModal = function ({orderId, reFreshFunction, noUserProduct}) {
    const {
        contextSelectedVariants,
        contextSelectedVariantIds,
    } = useContext(OrderDetailContext)
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedVariants, setSelectedVariants] = useState(_.cloneDeep(contextSelectedVariants) || [])
    const [selectedVariantIds, setSelectedVariantIds] = useState(_.cloneDeep(contextSelectedVariantIds) || [])
    const [selectedTab, setSelectedTab] = useState(noUserProduct ? 1 : 0)

    useEffect(() => {
        setSelectedTab(noUserProduct ? 1 : 0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [noUserProduct])

    useEffect(() => {
        setSelectedVariants(_.cloneDeep(contextSelectedVariants) || [])
        setSelectedVariantIds(_.cloneDeep(contextSelectedVariantIds) || [])
    }, [contextSelectedVariants, contextSelectedVariantIds])

    const toggleModalVisible = () => setModalVisible(!modalVisible)

    const hideProductModal = () => {
        setModalVisible(!modalVisible)
        setSelectedVariants(_.cloneDeep(contextSelectedVariants) || [])
        setSelectedVariantIds(_.cloneDeep(contextSelectedVariantIds) || [])
    }

    const appendSelectedVariants = (variants, ids) => {
        setSelectedVariants(_.uniqBy([...selectedVariants, ...variants], 'user_variant'))
        setSelectedVariantIds(_.uniq([...selectedVariantIds, ...ids]))
    }

    const removeVariant = (variant) => {
        const tmpSelectedVariants = selectedVariants
        const tmpSelectedVariantIds = selectedVariantIds
        const vIndex = _.findIndex(tmpSelectedVariants, {user_variant: parseInt(variant)})
        if (vIndex >= 0) {
            tmpSelectedVariants.splice(vIndex, 1)
        }
        const iIndex = tmpSelectedVariantIds.indexOf(variant)
        if (iIndex >= 0) {
            tmpSelectedVariantIds.splice(iIndex, 1)
        }
        setSelectedVariantIds(tmpSelectedVariantIds)
        setSelectedVariants(tmpSelectedVariants)
    }

    const onAddClick = async () => {
        // setContextSelectedVariantAndIds(selectedVariants, selectedVariantIds)
        // const reqData =
        const addItems = selectedVariants.filter(v => !contextSelectedVariantIds.includes(v.user_variant.toString()))
        let itemsData = addItems.map(variant => {
            const price = variant.priceDict[0]
            const exactlyPrice = price ? price.production_cost_base : null
            return {
                user_variant_id: variant.user_variant,
                id: variant.user_variant, // item_id
                quantity: parseInt(variant.quantity),
                sku: variant.user_variant,
                price: exactlyPrice,
                currency: DEFAULT_CURRENCY.currency,
                type: variant.type,
                abstract_variant: variant.abstract_variant,
                sample_product_id: variant.sample_id
            }
        })
        const {success, data} = await addOrderItem(orderId, itemsData)
        if (success && data) {
            reFreshFunction()
            toggleModalVisible()
        } else notification.error({
            message: "Error",
            description: `An error occurred. Please try again or contact our support team.`,
        })
    }

    const footer = () => (
        <div className={"text-left"}>
            Total selected items: {selectedVariants.length}
        </div>
    )

    const tabs = [
        {
            id: 'user-products',
            content: 'My products',
            panelID: 'user-products',
            component: <UserProductSection appendSelectedVariants={appendSelectedVariants} removeVariant={removeVariant}
                                           selectedVariantIds={selectedVariantIds} selectedVariants={selectedVariants}
                                           notChangeVariantIds={_.cloneDeep(contextSelectedVariantIds)}
            />

        },
        {
            id: 'sample-products',
            content: 'Sample products',
            panelID: 'sample-products',
            component: <SampleProductSection appendSelectedVariants={appendSelectedVariants}
                                             removeVariant={removeVariant}
                                             selectedVariantIds={selectedVariantIds}
                                             selectedVariants={selectedVariants}
                                             notChangeVariantIds={_.cloneDeep(contextSelectedVariantIds)}
            />
        }
    ]

    const handleTabChange = (selectedTabIndex) => setSelectedTab(selectedTabIndex)

    return (
        <div className={"product-modal"}>
            <Button onClick={toggleModalVisible}
                    // plain
                    primary
                    // size={"slim"}
                    icon={<Icon source={MobilePlusMajorMonotone}/>}
            >
                Add item
            </Button>
            <Modal
                open={modalVisible}
                onClose={hideProductModal}
                title="Select products"
                large
                primaryAction={{
                    content: 'Add to order',
                    onAction: onAddClick,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: hideProductModal,
                    },
                ]}
                footer={footer()}
            >
                <div className={''}>
                    <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                        {tabs[selectedTab].component}
                    </Tabs>
                </div>
                {/*<UserProductSection appendSelectedVariants={appendSelectedVariants} removeVariant={removeVariant}*/}
                {/*selectedVariantIds={selectedVariantIds} selectedVariants={selectedVariants}/>*/}
            </Modal>
        </div>
    )
}


export default AddOrderItemModal