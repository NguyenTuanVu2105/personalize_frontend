import React, {useContext, useState} from 'react'
import {Form, Input} from 'antd'
import NewProductContext from '../../../../context/NewProductContext'
import NewProductDesignContext from '../../context/NewProductDesignContext'
import {Button, Card, Heading, Modal, TextContainer} from "@shopify/polaris"


const ProductTitle = function (props) {

    const {designState} = useContext(NewProductDesignContext)

    const {product, setProduct} = useContext(NewProductContext)

    const [form, _setForm] = useState({title: ''})

    const [editMode, setEditMode] = useState(false)

    const setForm = (newForm) => {
        _setForm(form => ({...form, ...newForm}))
    }
    const getTitle = () => {
        return product.userProducts[designState.currentProductIndex] ?
            product.userProducts[designState.currentProductIndex].title :
            'Artwork name will be used as title'
    }

    const _onChangeInput = (key) => (e) => {
        form[key] = e.target.value
        setForm(form)
    }

    const showModal = () => {
        setForm({
            title: (product.userProducts[designState.currentProductIndex] ?
                    product.userProducts[designState.currentProductIndex].title :
                    product.abstract.title
            )
        })
        setEditMode(true)
    }

    const handleOk = () => {
        setEditMode(false)
        product.userProducts[designState.currentProductIndex]['title'] = form.title
        setProduct(product)
    }

    const handleCancel = () => {
        setEditMode(false)
    }

    return (
        <Card sectioned subdued>
            <div className="row mb-4">
                <div className="col-6 pt-2">
                    <Heading>Title</Heading>
                </div>

                <div className="col-6 flex-end">
                    {product.userProducts[designState.currentProductIndex] &&
                    <Button size={'slim'}
                            onClick={showModal}>
                        Edit
                    </Button>}
                </div>
            </div>
            <p className="product-title">
                {getTitle()} &nbsp;
            </p>
            <Modal
                size={'large'}
                title={'Edit product title'}
                open={editMode}
                onClose={handleCancel}
                primaryAction={{
                    content: 'Done',
                    onAction: handleOk,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleCancel,
                    },
                ]}
            >
                <Modal.Section>
                    <TextContainer>
                        <div className="px-2">
                            <Form.Item>
                                <Input
                                    value={form.title || ''} onChange={_onChangeInput('title')}
                                    placeholder="Product title"
                                    className={"mb-1"}
                                />
                            </Form.Item>
                        </div>
                    </TextContainer>
                </Modal.Section>
            </Modal>
        </Card>
    )
}

export default ProductTitle
