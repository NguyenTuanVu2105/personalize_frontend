import React, {useContext, useEffect, useState} from 'react'
import {Button, Icon, Modal, Tabs} from "@shopify/polaris"
import {MobilePlusMajorMonotone} from '@shopify/polaris-icons'
import UserProductSection from "./UserProductSection"
import _ from "lodash"
import NewOrderContext from "../../context/NewOrderContext"
import SampleProductSection from "./SampleProductSection"

const ProductModalContainer = function ({noUserProduct}) {
    const {contextSelectedVariants, contextSelectedVariantIds, setContextSelectedVariantAndIds} = useContext(NewOrderContext)
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

    const onAddClick = () => {
        setContextSelectedVariantAndIds(selectedVariants, selectedVariantIds)
        toggleModalVisible()
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
                                           selectedVariantIds={selectedVariantIds} selectedVariants={selectedVariants}/>

        },
        {
            id: 'sample-products',
            content: 'Sample products',
            panelID: 'sample-products',
            component: <SampleProductSection appendSelectedVariants={appendSelectedVariants}
                                             removeVariant={removeVariant}
                                             selectedVariantIds={selectedVariantIds}
                                             selectedVariants={selectedVariants}/>
        }
    ]

    const handleTabChange = (selectedTabIndex) => setSelectedTab(selectedTabIndex)

    return (
        <div className={"product-modal"}>
            <Button onClick={toggleModalVisible} plain icon={<Icon source={MobilePlusMajorMonotone}/>}>Add
                item</Button>
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


export default ProductModalContainer