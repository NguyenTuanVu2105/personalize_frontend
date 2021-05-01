import React, {useRef, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import {Caption, Modal, Stack, TextContainer, Thumbnail} from '@shopify/polaris'
import StyledDropzone from "../../new-product/components/design/components/artwork-view/artwork-item/StyledDropzone";
import {Button, Col, notification, Icon, Checkbox} from "antd";
import {artworkCheck, uploadChunkArtwork} from "../../../services/api/artwork";
import {sha256Hash} from "../../../services/util/hash";
import {forceActivateArtwork} from "../../../services/api/artworkUpdate";

const UploadArtworkModal = (props) => {
    const {visible, setVisible, onSuccess} = props
    const refSelection = useRef(null)
    const [files, setFiles] = useState([])
    const [legalChecked, setLegalChecked] = useState(false)
    const [uploading, setUploading] = useState(false)

    const closeModal = () => {
        setFiles([])
        setVisible(false)
    }

    const onFileDrop = (acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length === 1 && acceptedFiles.length === 0) {
            notification['warning']({
                message: "This is not a image file!"
            })
        } else if (rejectedFiles.length > 0) {
            notification['warning']({
                message: "Please select only one image file!"
            })
        } else {
            setFiles(acceptedFiles)
        }
    }

    const onRemoveFile = (file, index) => {
        const updatedFiles = files.filter((file, idx) => {
            return idx !== index
        })
        setFiles(updatedFiles)
    }

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({accept: 'image/*', onDrop: onFileDrop, multiple: true,})

    const uploadedFiles = (files) => {
        return files.length > 0 && (
            <div className={'row'}>
                {files.map((file, index) => (
                    <div className={'col-12'} key={index}>
                        <div className={"py-1"}>
                            <Stack alignment="center">
                                <Thumbnail
                                    size="medium"
                                    alt={file.name}
                                    source={URL.createObjectURL(file)}
                                />
                                <Stack.Item fill>
                                    {file.name.length > 20 ? file.name.substring(0, 20) + "..." : file.name}
                                    <Caption>{file.size} bytes</Caption>
                                </Stack.Item>
                                <div>
                                    <Button className="ant-dropdown-link" type="link"
                                            onClick={() => onRemoveFile(file, index)}
                                            disabled={uploading}>
                                        {/*<Icon type="close-circle" />*/}
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

    const isArtworkExist = async (file) => {
        let digest = await sha256Hash(file)
        const reqData = {'sha256': digest}
        return await artworkCheck(reqData)
    }

    const startUploadArtworks = async () => {
        const UPLOAD_STATUS = {
            waiting: 1,
            uploading: 2,
            finish: 3
        }
        let uploadStatus = []
         // eslint-disable-next-line
        for (let _ in files) uploadStatus.push(UPLOAD_STATUS.waiting)
        const setUploadStatus = (index, status) => {
            uploadStatus[index] = status
            if (uploadStatus.filter(item => item !== UPLOAD_STATUS.finish).length === 0){
                finishUpload()
            }
        }
        setUploading(true)
        let isAllSuccess = true
        const finishUpload = () => {
            if (isAllSuccess) {
                closeModal()
            }
            onSuccess()
            setUploading(false)
        }
        const setIsAllSuccess = (value) => {isAllSuccess = value}
        for (let index in files){
            setUploadStatus(index, UPLOAD_STATUS.uploading)
            let file = files[index]
            const {data, success} = await isArtworkExist(file);
            if (!success || !data['success']){
                notification.error({
                    message: 'Failed to check artwork exist',
                    description: file.name
                })
                setIsAllSuccess(false)
            }else {
                if (data['existed']) {
                    let existedArtwork = data['artwork']
                    if (existedArtwork['is_active'] === '4'){
                        let response = await forceActivateArtwork(existedArtwork['id'], file.name)
                        if (response.success && response.data && response.data['success']){
                            notification.success({
                                message: 'Upload artwork successful',
                                description: file.name
                            })
                        }else {
                            notification.error({
                                message: 'Failed to upload',
                                description: file.name})
                            setIsAllSuccess(false)
                        }
                    } else {
                        notification.info({
                            message: 'Skip upload artwork: artwork is already exist',
                            description: file.name
                        })
                    }
                    setUploadStatus(index, UPLOAD_STATUS.finish)
                }else {
                    let uploadProcess = uploadChunkArtwork({
                        file: file,
                        onError: (message) => {
                            notification.error({
                                message: message
                            })
                            setIsAllSuccess(false)
                            setUploadStatus(index, UPLOAD_STATUS.finish)
                        },
                        onSuccess: () => {
                            notification.success({
                                message: 'Upload artwork successful',
                                description: file.name
                            })
                            setUploadStatus(index, UPLOAD_STATUS.finish)
                            return {}
                        },
                        attachedData: {'activate': true}
                    });
                     uploadProcess.upload();
                }
            }
        }
    }

    return (
        <div className={"upload-artwork_modal"}>
            <Modal
                title={'Select Artworks'}
                open={visible}
                onClose={closeModal}
                primaryAction={{
                    disabled: !legalChecked || files.length === 0,
                    loading: uploading,
                    content: 'Done',
                    onAction: startUploadArtworks
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: closeModal
                    },
                ]}
                className={"upload-artwork_modal"}
            >
                <Modal.Section>
                    <TextContainer>
                        <div className='disable-more-filters px-2' ref={refSelection}>
                            <div className="row noselect px-2 mb-2">
                                <StyledDropzone {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
                                    <input {...getInputProps()} />
                                    <p>Drag and drop your artwork here, or click to select artwork files</p>
                                </StyledDropzone>
                            </div>
                        </div>
                        <Checkbox
                            checked={legalChecked}
                            onChange={(e) => {
                                setLegalChecked(e.target.checked)
                            }}
                        >
                            <span style={{color: "#454f5b"}}>I certify that I own rights to all images I am uploading for this product. I hereby forever release PrintHolo from any and all trademark or copyright infringement claims.</span>
                        </Checkbox>
                    </TextContainer>
                    <Col span={24}>
                        {
                            files.length > 0 && (
                                <div className={'mt-3'}>
                                    Selected files
                                </div>
                            )
                        }
                    </Col>
                    <Col span={24}>
                        <div className={'mt-3'}>
                            {uploadedFiles(files)}
                        </div>
                    </Col>
                </Modal.Section>
            </Modal>
        </div>
    )
}

export default UploadArtworkModal
