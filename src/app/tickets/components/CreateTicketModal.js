import React, {useContext, useEffect, useState} from "react"
import {
    Banner,
    Caption,
    Form,
    FormLayout,
    Labelled,
    Modal,
    Select,
    Stack,
    TextField,
    Thumbnail
} from "@shopify/polaris"
import {Button, Col, Icon, notification, Row, Select as AntSelect, Modal as AntModal} from "antd"
import {Button as PolarisButton} from "@shopify/polaris"
import {useDropzone} from "react-dropzone"
import {contactOrderSupport, listOrderIds} from "../../../services/api/orders"
import ModalContext from "../../orders/context/ModalContext"


const CreateTicketModal = ({handleSuccess}) => {
    const {visibleCreateModal, setVisibleCreateModal, selectedOrders} = useContext(ModalContext)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [error, setError] = useState(null)
    const [files, setFiles] = useState([])
    const [orderIds, setOrderIds] = useState(selectedOrders)
    const [subject, setSubject] = useState('0')
    const [content, setContent] = useState('')
    const [availableOrderIds, setAvailableOrderIds] = useState([])
    const {confirm} = AntModal


    useEffect(() => {
        // setLoading(false)
        loadAvailableOrderIds().then()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    useEffect(() => {
        setOrderIds(selectedOrders)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleCreateModal])


    const onRemoveFile = (file, index) => {
        const updatedFiles = files.filter((file, idx) => {
            return idx !== index
        })
        setFiles(updatedFiles)
    }

    const closeModal = () =>{
        setVisibleCreateModal(false)
        removeAllData()
    }

    const loadAvailableOrderIds = async () => {
        const data = await listOrderIds()
        setAvailableOrderIds(data.data.order_ids)
    }


    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png']

    const uploadedFiles = (files) => {
        return files.length > 0 && (
            <div className={'row mb-3'}>
                {files.map((file, index) => (
                    <div className={'col-12'} key={index}>
                        <div className={'py-1'}>
                            <Stack alignment="center">
                                <Thumbnail
                                    size="small"
                                    alt={file.name}
                                    source={
                                        validImageTypes.indexOf(file.type) > 0
                                            ? window.URL.createObjectURL(file)
                                            : 'https://cdn.shopify.com/s/files/1/0757/9955/files/New_Post.png?12678548500147524304'
                                    }
                                />
                                <Stack.Item fill>
                                    {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                                    <Caption>{file.size} bytes</Caption>
                                </Stack.Item>
                                <div>
                                    <Button className="ant-dropdown-link" type="link"
                                            onClick={() => onRemoveFile(file, index)}>
                                        <Icon type="close-circle" theme="twoTone" twoToneColor="#DE3618"/>
                                    </Button>
                                </div>
                            </Stack>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const subjectObj = {
        '1': 'Replacement Request',
        '2': 'Change Size/Color',
        '3': 'Change Address',
        '4': 'Order Status',
        '5': 'Other (please describe below)'
    }

    const showConfirm = (warningMessage, failedOrder) => {
        confirm({
            title: 'Do you want to continue?',
            content: warningMessage,
            centered: true,
            okText: 'Submit',
            async onOk() {
                const data = {
                    'order_ids': orderIds.filter(x => !failedOrder.includes(x)),
                    'type': subject,
                    'subject': subjectObj[subject],
                    'issue': content
                }
                // console.log(orderIds.filter(x => !failedOrder.includes(x)))
                const responseData = (await contactOrderSupport(files, data))
                if (responseData.success) {
                    notification.success({
                        message: 'Your support ticket has been sent. Our supporters will contact you soon'
                    })
                    if (handleSuccess){
                        handleSuccess()
                    }
                    closeModal()
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }

    const handleSubmit = async () => {
        if (subject === '0') {
            setError('Please select a subject')
        } else {
            setError(null)
            setSubmitLoading(true)
            const data = {
                'order_ids': orderIds,
                'type': subject,
                'subject': subjectObj[subject],
                'issue': content
            }
            const responseData = (await contactOrderSupport(files, data))
            // console.log(responseData)
            if (responseData.success) {
                notification.success({
                    message: 'Your support ticket has been sent. Our supporters will contact you soon'
                })
                if (handleSuccess){
                    handleSuccess()
                }
                closeModal()
            } else {
                if (responseData.data.warning) {
                    setSubmitLoading(false)
                    showConfirm(responseData.data.message, responseData.data.order_failed)
                } else {
                    setSubmitLoading(false)
                    setError(responseData.data.message || 'Something wrong. Please try again')
                }
            }
        }
    }

    const removeAllData = () => {
        setSubject('0')
        setContent('')
        setFiles([])
        setSubmitLoading(false)
        setError(null)
    }


    const onChangeOrderIds = (ids) => {
        // console.log('IDS', ids)
        setOrderIds(ids)
    }

    const handleContentChange = (value) => setContent(value)

    const handleSelectChange = (value) => setSubject(value[0])

    const arrayUnique = (arr, uniqueKey) => {
        const flagList = new Set()
        //eslint-disable-next-line
        return arr.filter(function (item) {
            if (!flagList.has(item[uniqueKey])) {
                flagList.add(item[uniqueKey])
                return true
            }
        })
    }

    const onDrop = (acceptedFiles, rejectedFiles, event) => {
        const combinedFiles = arrayUnique([...files, ...event.target.files], 'path')
        setFiles(combinedFiles)
    }

    const onRemoveAllFiles = () => setFiles([])

    const {
        getRootProps,
        isDragActive,
        getInputProps,
    } = useDropzone({onDrop, multiple: true})

    const options = [
        {label: '- Select Issue -', value: '0'},
        {label: 'Replacement Request', value: '1'},
        {label: 'Change Size/Color', value: '2'},
        {label: 'Change Address', value: '3'},
        {label: 'Order Status', value: '4'},
        {label: 'Other (please describe below)', value: '5'},
    ]
    return (
        <>
        <Modal
            open={visibleCreateModal}
            large
            // size={"Full"}
            onClose={() => {
                closeModal()
            }}
            title="Contact Support"
            primaryAction={{
                content: 'Submit',
                onAction: handleSubmit,
                // disabled: !submitAvailable(),
                loading: submitLoading
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: () => {
                        closeModal()
                    },
                },
            ]}
        >
            <Modal.Section>
                {
                    error && (
                        <div className={'mb-3'}>
                            <Banner status="warning">
                                {error}
                            </Banner>
                        </div>
                    )
                }
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col span={14}>
                            <FormLayout>
                                <FormLayout.Group condensed>
                                    <Labelled label={
                                        <>
                                            <b>Order IDS</b>
                                            <div style={{fontSize: '12px', fontStyle:"italic"}}>You only create ticket for orders created within 30 days.</div>
                                        </>}>
                                        <AntSelect
                                            mode="multiple"
                                            style={{width: '100%'}}
                                            placeholder="Please select"
                                            value={orderIds}
                                            onChange={onChangeOrderIds}
                                        >
                                            {availableOrderIds.map(id => (<AntSelect.Option key={id}
                                                                                            value={id}>#{id}</AntSelect.Option>))}
                                        </AntSelect>
                                    </Labelled>


                                </FormLayout.Group>
                                {/*<FormLayout.Group condensed>*/}

                                {/*</FormLayout.Group>*/}
                                <Select
                                    label={<b>Subject (<a href='https://printholo.com/faqs/' target='_blank' rel="noopener noreferrer">FAQs</a>)</b>}
                                    options={options}
                                    onChange={handleSelectChange}
                                    value={subject}
                                />

                                <TextField
                                    label={<b>Describe Issue</b>}
                                    value={content}
                                    onChange={handleContentChange}
                                    multiline={3}
                                    maxLength={5000}
                                    showCharacterCount
                                />
                            </FormLayout>
                        </Col>
                        <Col span={10}>
                            <div className={'ml-4'}>
                                <FormLayout>
                                    <div>
                                        <Row>
                                            <Col span={24}>
                                                <div className={'mb-3'}>
                                                    Attachments
                                                </div>
                                            </Col>
                                            <Col span={24}>
                                                <div {...getRootProps()}>
                                                    <input {...getInputProps()} />
                                                    <div className={'ant-upload ant-upload-drag'}>
                                                        <span tabIndex="0" className="ant-upload ant-upload-btn"
                                                              role="button">
                                                            <div className="ant-upload-drag-container">
                                                                    <p className="ant-upload-drag-icon">
                                                                        <i aria-label="icon: inbox"
                                                                           className="anticon anticon-inbox">
                                                                        <svg
                                                                            viewBox="0 0 1024 1024"
                                                                            focusable="false"
                                                                            className=""
                                                                            data-icon="inbox"
                                                                            width="1em"
                                                                            height="1em" fill="currentColor"
                                                                            aria-hidden="true">
                                                                            <path
                                                                                d="M885.2 446.3l-.2-.8-112.2-285.1c-5-16.1-19.9-27.2-36.8-27.2H281.2c-17 0-32.1 11.3-36.9 27.6L139.4 443l-.3.7-.2.8c-1.3 4.9-1.7 9.9-1 14.8-.1 1.6-.2 3.2-.2 4.8V830a60.9 60.9 0 0 0 60.8 60.8h627.2c33.5 0 60.8-27.3 60.9-60.8V464.1c0-1.3 0-2.6-.1-3.7.4-4.9 0-9.6-1.3-14.1zm-295.8-43l-.3 15.7c-.8 44.9-31.8 75.1-77.1 75.1-22.1 0-41.1-7.1-54.8-20.6S436 441.2 435.6 419l-.3-15.7H229.5L309 210h399.2l81.7 193.3H589.4zm-375 76.8h157.3c24.3 57.1 76 90.8 140.4 90.8 33.7 0 65-9.4 90.3-27.2 22.2-15.6 39.5-37.4 50.7-63.6h156.5V814H214.4V480.1z"/>
                                                                        </svg>
                                                                        </i>
                                                                    </p>
                                                                {
                                                                    isDragActive ?
                                                                        <p>Drop the files here ...</p> :
                                                                        <p className="ant-upload-text">Click or drag
                                                                            file to
                                                                            this area to
                                                                            upload</p>

                                                                }
                                                            </div>
                                                        </span>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div>
                                        {
                                            files.length > 0 && (
                                                <Stack>
                                                    <Stack.Item fill>{(files.length)} files selected</Stack.Item>
                                                    <Stack.Item>
                                                        <PolarisButton plain onClick={onRemoveAllFiles}>Remove
                                                            all</PolarisButton>
                                                    </Stack.Item>
                                                </Stack>
                                            )
                                        }
                                    </div>
                                    <div>
                                        {uploadedFiles(files)}
                                    </div>
                                </FormLayout>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Modal.Section>
        </Modal>
        </>
    )
}

export default CreateTicketModal