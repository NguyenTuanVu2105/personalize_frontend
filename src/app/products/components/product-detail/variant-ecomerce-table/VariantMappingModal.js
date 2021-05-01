import React, { useState} from 'react'
import {Button, Modal, Tabs} from "antd"
import NewProductContainer from "../../../../new-product/components/NewProductContainer"
import './VariantMappingModal.scss'
import {ECOMMERCEVARIANT} from "../../../../new-product/constants/newproductMode"
import EcommerceVariantView
    from "../../../../new-product/components/design/components/ecommerce-variant-view/EcommerceVariantView"

const VariantMappingModal = function (props) {
    const {visible, setVisible, variant, fetchData} = props
    const [submit, setSubmit] = useState(false)
    const [canSubmit, setCanSubmit] = useState(false)
    return (
        <Modal
            className='variant-modal'
            size='Full'
            large
            width={'90%'}
            style={{ top: 20 }}
            visible={visible}
            onCancel={() => {setVisible(false)}}
            onOk={() => {setSubmit(true)}}
            footer={<Button type='primary' onClick={() => {setSubmit(true)}} disabled={!canSubmit}>Submit</Button>}
            zIndex={2}
        >
            <Tabs defaultActiveKey={'1'}>
                <Tabs.TabPane tab='New variant' key='1'>
                    <div className='new-variant-container'>
                        <NewProductContainer
                            modeData={{
                                mode: ECOMMERCEVARIANT,
                                ecommerceVariant: variant,
                                isModalClose: visible,
                                setModalClose: (v) => setVisible(v),
                                isModalSubmit: submit,
                                setModalSubmit: (v) => setSubmit(v),
                                canSubmitModal: canSubmit,
                                setCanSubmitModal: (v) => setCanSubmit(v),
                                fetchData: fetchData,
                                infoView: <EcommerceVariantView/>
                            }}/>
                    </div>
                </Tabs.TabPane>
                <Tabs.TabPane tab='From exist variant' key='2'>
                    as
                </Tabs.TabPane>
            </Tabs>

        </Modal>
    )
}

export default VariantMappingModal
