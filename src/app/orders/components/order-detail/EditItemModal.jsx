import React, {useEffect, useRef, useState} from 'react'
import {notification, Spin} from 'antd'
import './EditItemModal.scss'
import {cancelOrderLastItem, editOrderPackItem, getUserProductById} from '../../../../services/api/orders'
import {getAllItemSku, getAllPositiveItemSku} from './helper/OrderInformation'
import {
    Button as PolarisButton,
    FormLayout,
    Modal as PolarisModal,
    Select as PolarisSelect,
    TextContainer,
    TextField,
    Tooltip
} from "@shopify/polaris"
import {faEdit, faTrashAlt} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"

function EditItemModal({item, visible, refetch, orderId, packs}) {
    const [modalState, setModalState] = useState({
        visible: false,
        confirmLoading: false,
        loading: true
    })

    const [userProduct, setUserProduct] = useState()

    const [newAttribute, setNewAttribute] = useState({quantity: item.quantity, variantSku: item.variant.sku})
    const [confirmModalVisible, setConfirmModalVisible] = useState(false)
    const [confirmCancelModalVisible, setConfirmCancelModalVisible] = useState(false)

    const allItemSku = useRef([]);

    useEffect(() => {
        setNewAttribute({quantity: item.quantity, variantSku: item.variant.sku})
        // console.log(newAttribute);

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item, modalState.visible])

    useEffect(() => {
        if (modalState.visible) {
            fetchUserProduct()
        } else {
            setUserProduct(null)
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalState.visible])

    useEffect(() => {
        if (attributeChanged()) {
            setModalState({...modalState, disabled: false})
        } else {
            setModalState({...modalState, disabled: true})
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newAttribute])

    useEffect(() => {
        allItemSku.current = getAllItemSku(packs || [])
        // console.log(allItemSku.current);

    }, [packs])

    const fetchUserProduct = async () => {
        setModalState({...modalState, loading: true})
        let result = await getUserProductById(item.variant.user_product_id)
        // console.log(result);
        if (result.success) {
            // console.log(result.data)
            setUserProduct(result.data)
            setModalState({...modalState, loading: false})
        }
    }

    const attributeChanged = () => {
        let changed = false
        if (newAttribute.quantity !== item.quantity || newAttribute.variantSku !== item.variant.sku)
            changed = true
        // console.log(newAttribute);

        return changed
    }

    const showModal = () => {
        setModalState({...modalState, visible: true})
    }

    const handleCancel = () => {
        setModalState({...modalState, visible: false})
    }

    const onInputChange = (key, newValue) => {
        setNewAttribute({...newAttribute, [key]: newValue})
    }

    const submitChanges = async (newAttribute) => {
        setModalState({...modalState, confirmLoading: true,})

        let newQuantity = newAttribute.quantity
        let newSku = newAttribute.variantSku
        let newAttr = {}
        if (newQuantity || newQuantity === 0) newAttr["quantity"] = newQuantity
        if (newSku) newAttr["sku"] = newSku
        // console.log(newAttr);

        editOrderPackItem(orderId, item.id, newAttr)
            .then((result) => {
                // console.log(result);

                if (result.data && result.data.success) {
                    setModalState({...modalState, visible: false, confirmLoading: false})
                    refetch()
                } else {
                    throw (new Error("error"))
                }
            })
            .catch((error) => {
                notification.error({
                    message: "Something went wrong, please try again",
                    duration: 2
                })
                setModalState({...modalState, confirmLoading: false,})
            })
    }

    const cancelThisOrder = async () => {
        let result = await cancelOrderLastItem(orderId, item.id)
        if (result.data.success) {
            notification.success({
                message: 'Cancel order successfully'
            })
            refetch()
        } else {
            notification.error({
                message: 'Something went wrong, please try again'
            })
        }
    }

    const currentItemIsTheOnlyPositiveLeft = (newAttribute) => {
        let allPositiveItemSku = getAllPositiveItemSku(packs || [])
        return newAttribute.quantity === 0 && allPositiveItemSku.includes(item.variant.sku) && allPositiveItemSku.length === 1;
    }

    const produceVariantSelectOptionLabel = (attributeValuesSet, disabled) => {
        let extraText = disabled ? " (existed)" : ""
        return attributeValuesSet.map((attribute) => attribute.label).join(" / ") + extraText
    }

    const variantOptions = modalState.loading || !userProduct ? "" : userProduct.user_product_variant_set.map(variant => {
        let disabled = variant.sku !== item.variant.sku
            && allItemSku.current.includes(variant.sku)
        return {
            label: produceVariantSelectOptionLabel(variant.abstract_variant.attributes_value, disabled),
            value: variant.sku,
            disabled: disabled
        }
    })

    const toggleConfirmModalVisible = () => setConfirmModalVisible(!confirmModalVisible)
    const toggleConfirmCancelModalVisible = () => setConfirmCancelModalVisible(!confirmCancelModalVisible)

    const onRemoveItem = () => {
        setNewAttribute({...newAttribute, quantity: 0})
        return submitChanges({
            ...newAttribute,
            quantity: 0
        }).then(r => {
            setConfirmModalVisible(false)
        })
    }

    const onClickRemoveItem = () => {
        const renderCond = currentItemIsTheOnlyPositiveLeft({...newAttribute, quantity: 0})
        return renderCond ? toggleConfirmCancelModalVisible() : toggleConfirmModalVisible()
    }

    return (
        visible ? (
            // visible ? (
            <div>
                <div className={"w-100 flex-center mt-3"}>
                    <div className={"mr-1"}>
                        <Tooltip content={"Modify this item"}>
                            <PolarisButton plain onClick={showModal} size={"slim"}>
                                <FontAwesomeIcon style={{fontSize: 16}} icon={faEdit}/>
                            </PolarisButton>
                        </Tooltip>
                    </div>
                    <div className={"ml-1"}>
                        <Tooltip content={"Remove this item"}>
                            <PolarisButton plain size={"slim"} onClick={onClickRemoveItem}>
                                <FontAwesomeIcon style={{fontSize: 16, color: "#d53417"}} icon={faTrashAlt}/>
                            </PolarisButton>
                        </Tooltip>
                    </div>
                </div>
                <PolarisModal
                    open={modalState.visible}
                    onClose={handleCancel}
                    title="Modify item"
                    primaryAction={{
                        content: 'Save',
                        onAction: () => submitChanges(newAttribute),
                        disabled: modalState.disabled || newAttribute.quantity <= 0,
                        loading: modalState.confirmLoading
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: handleCancel,
                        },
                    ]}
                >
                    <Spin spinning={modalState.loading || !packs}>
                        <PolarisModal.Section>
                            <FormLayout>
                                {
                                    modalState.loading || !userProduct ? "" : (
                                        <PolarisSelect
                                            label="Variant"
                                            value={newAttribute.variantSku}
                                            onChange={(value) => {
                                                onInputChange("variantSku", value)
                                            }}
                                            options={variantOptions}
                                        />
                                    )
                                }
                                <TextField
                                    label="Quantity"
                                    type="number"
                                    value={newAttribute.quantity.toString()}
                                    onChange={(value) => {
                                        if (value === "") value = 1
                                        onInputChange("quantity", value)
                                    }}
                                    min={1}
                                    helpText={"Quantity must be greater than 0"}
                                />
                            </FormLayout>
                        </PolarisModal.Section>
                    </Spin>
                </PolarisModal>
                <PolarisModal
                    open={confirmModalVisible}
                    onClose={toggleConfirmModalVisible}
                    title="Remove item"
                    primaryAction={{
                        content: 'Yes',
                        onAction: onRemoveItem,
                        loading: modalState.confirmLoading,
                        destructive: true
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: toggleConfirmModalVisible,
                        },
                    ]}
                >
                    <PolarisModal.Section>
                        <TextContainer>
                            <p>Are you sure to remove this item?</p>
                        </TextContainer>
                    </PolarisModal.Section>
                </PolarisModal>
                <PolarisModal
                    open={confirmCancelModalVisible}
                    onClose={toggleConfirmCancelModalVisible}
                    title="No remaining item"
                    primaryAction={{
                        content: 'Yes, cancel this order',
                        onAction: cancelThisOrder,
                        // loading: modalState.confirmLoading,
                        destructive: true
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: toggleConfirmCancelModalVisible,
                        },
                    ]}
                >
                    <PolarisModal.Section>
                        <TextContainer>
                            <p>Your order will have no item, do you want to cancel this order to ignore it in
                                fulfillment processes?</p>
                        </TextContainer>
                    </PolarisModal.Section>
                </PolarisModal>
            </div>
        ) : (<></>)
    )
}

export default EditItemModal
