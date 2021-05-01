import React, {useContext, useEffect, useState} from 'react'
import NewProductContext from '../../../../context/NewProductContext'
import Editor from "../../../../../shared/Editor"
import {Button, Heading, Modal, Spinner, Stack} from '@shopify/polaris'
import {faEdit} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import parse from 'html-react-parser'
import "./ProductDescription.scss"


const ProductDescription = function (props) {

    const {product, setProduct} = useContext(NewProductContext)

    const [form, _setForm] = useState({title: '', description: ''})
    const [viewOnly, setViewOnly] = useState(true)
    const [editorLoading, setEditorLoading] = useState(true)

    const setForm = (newForm) => {
        _setForm(form => ({...form, ...newForm}))
    }

    useEffect(() => {
        form['description'] = product.description
        setForm(form)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const onChangeDescription = (content, editor) => {
        form['description'] = content
        setForm(form)
        // setProduct({description: form.description})
    }

    const onDoneEditing = () => {
        setViewOnly(true)
        setProduct({description: form.description})
    }

    const editor = (
        <Editor
            value={product.description}
            init={{
                height: "65vh",
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime table paste code help wordcount',
                    'image imagetools',
                    'media',
                ],
                toolbar:
                    ' link bold italic | alignleft aligncenter alignright alignjustify | image media | backcolor bullist numlist outdent indent | removeformat | help',
                setup: function (ed) {
                    ed.on('init', function (ed) {
                        this.getBody().style.fontSize = '14px'
                        this.getBody().style.fontFamily = 'Helvetica Neue, Helvetica, Arial, sans-serif'
                        this.getBody().style.lineHeight = '1.5'
                        setEditorLoading(false)
                    })
                },
                verify_html: true,
                entity_encoding: 'raw',
                cleanup: false
            }}
            onEditorChange={onChangeDescription}
        />
    )

    return (
        <div className="new-product-description step-edit-description" style={{maxHeight: '100%'}}>
            <Stack>
                <Stack.Item>
                    <Heading>Product description</Heading>
                </Stack.Item>
                <Stack.Item fill>
                    <div className={'text-right'}>
                        <Button onClick={() => setViewOnly(!viewOnly)} plain
                                icon={<FontAwesomeIcon icon={faEdit}/>}>Edit</Button>
                    </div>
                </Stack.Item>
            </Stack>
            <div className="pt1em width-100 product-info-content">
                {parse(product.description)}
            </div>
            <div className={"hidden-editor"}>
                {editor}
            </div>
            {/*{*/}
            {/*viewOnly ? (*/}
            {/*<div className="pt1em width-100 product-info-content">*/}
            {/*{parse(product.description)}*/}
            {/*</div>*/}
            {/*) : (*/}
            {/*<div className="pt1em width-100 product-info-content">*/}
            {/*{editor}*/}
            {/*</div>*/}
            {/*)*/}
            {/*}*/}
            <Modal
                // activator={activator}
                open={!viewOnly}
                onClose={() => setViewOnly(true)}
                title={`Edit product's description`}
                // title={`Edit ${product.abstract.title}'s description`}
                large
                primaryAction={{
                    content: 'Done',
                    onAction: onDoneEditing,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => setViewOnly(true),
                    },
                ]}
            >
                <div className={"edit-description-modal-body"}>
                    {editorLoading && (
                        <div className={'text-center'}>
                            <Spinner accessibilityLabel="Spinner example" size="large" color="teal"/>
                        </div>
                    )}
                    {!editorLoading && editor}
                </div>
            </Modal>
        </div>
    )
}

export default ProductDescription
