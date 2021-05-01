import React, {useEffect, useState} from 'react'
import {notification, Radio, Spin} from 'antd'
import {editShippingPlan, getAllShippingRate} from '../../../../services/api/orders'
import {faEdit} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Modal} from "@shopify/polaris"

function EditShippingPlanModal({visible, shipping, id, refetch}) {
    const [modalState, setModalState] = useState({
        visible: false,
        confirmLoading: false,
        loading: true
    })

    const [shippingRateList, setShippingRateList] = useState([shipping])

    const [currentShippingRate, setCurrentShippingRate] = useState(shipping)

    useEffect(() => {
        if (modalState.visible) {
            fetchAllShippingRate()
        } else {
            setShippingRateList([shipping])
            setCurrentShippingRate(shipping)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalState.visible])

    useEffect(() => {
        setCurrentShippingRate(shipping)
    }, [shipping])

    useEffect(() => {
        if (currentShippingRate.name !== shipping.name) {
            setModalState({...modalState, disabled: false})
        } else {
            setModalState({...modalState, disabled: true})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentShippingRate])

    const showModal = () => {
        setModalState({...modalState, visible: true, disabled: true})
    }

    const handleCancel = () => {
        setModalState({...modalState, visible: false})
    }

    const fetchAllShippingRate = async () => {
        setModalState({...modalState, loading: true})
        let response = await getAllShippingRate()
        if (response.success) {
            setShippingRateList(response.data.results)
            setModalState({...modalState, loading: false})
        }
    }

    const onChangeShippingPlan = (event) => {
        let newPlan = shippingRateList.find(item => item.id === event.target.value)
        setCurrentShippingRate(newPlan)
    }

    // const showChangingConfirmation = () => {
    //     Modal.confirm({
    //         title: 'Are you sure?',
    //         content: 'Please review your information carefully',
    //         centered: true,
    //         okText: 'Yes',
    //         cancelText: 'No',
    //         onOk: submitChanges,
    //     })
    // }

    const submitChanges = async () => {
        setModalState({...modalState, confirmLoading: true})

        editShippingPlan(id, currentShippingRate.id)
            .then((result) => {
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

    return visible && (
        <div>
            <span onClick={showModal} className={"link-ui p-3"}>
                <FontAwesomeIcon icon={faEdit}/>&nbsp;Edit
            </span>
            <Modal
                title="Edit shipping plan"
                open={modalState.visible}
                onClose={handleCancel}
                primaryAction={{
                    content: 'Submit changes',
                    onAction: submitChanges,
                    disabled: modalState.disabled
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleCancel,
                    },
                ]}
                sectioned
            >
                <div className="mt-2">
                    <Spin spinning={modalState.loading}>
                        <p>Choose your shipping plan</p>
                        <Radio.Group
                            onChange={onChangeShippingPlan}
                            value={currentShippingRate.id}
                        >
                            {shippingRateList.map(item => (
                                <Radio className="d-block my-4" value={item.id} key={item.id}>
                                    <b>{item.name}</b> - {item.description}
                                </Radio>
                            ))}
                        </Radio.Group>
                    </Spin>
                </div>
            </Modal>
        </div>
    )
}

export default EditShippingPlanModal
