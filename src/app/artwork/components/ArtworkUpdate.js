import React, {useCallback, useState} from 'react'
import './ArtworkAction.scss'
import {Alert, Avatar, Button, Col, Icon, Input, notification, Row} from 'antd'
import {useDropzone} from 'react-dropzone'
import {Modal, Tooltip} from '@shopify/polaris'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEdit} from '@fortawesome/free-solid-svg-icons'
import {updateArtwork, updateChunkArtwork} from '../../../services/api/artwork'
import {readFileArtwork} from '../../new-product/helper/readArtworks'

const ArtworkUpdate = (props) => {
    const {reloadData, onUpdate} = props
    const [visibleUpdate, setVisibleUpdate] = useState(false)
    const artwork = props.artwork
    const [newArtworkData, _setNewArtworkData] = useState(null)
    const [loading, setLoading] = useState(false)

    const showArtworkUpdate = () => {
        setVisibleUpdate(true)
        _setNewArtworkData({
            previewArtwork: '',
            name: artwork.name
        })
    }
    const setNewArtworkData = (newData) => {
        _setNewArtworkData(data => ({...data, ...newData}))
    }
    const updateArtworkFinish = () => {
        setLoading(false)
    }
    const updateArtworkSuccess = () => {
        notification.success({
            message: 'Update successfully',
        })
        reloadData()
        setVisibleUpdate(false)
        onUpdate(false)
        updateArtworkFinish()
    }
    const updateArtworkError = () => {
        notification.error({
            message: 'An error occurred, please try again',
        })
        updateArtworkFinish()
    }
    const handleUpdate = async () => {
        setLoading(true)
        const data = {
            id: artwork.id,
            name: newArtworkData.name,
            is_new_artwork_file: true
        }
        if (newArtworkData && newArtworkData.file) {
            // artwork.resumable =
            updateChunkArtwork({
                artworkId: artwork.id,
                file: newArtworkData.file,
                onSuccess: updateArtworkSuccess,
                onError: updateArtworkError,
                onProgress: () => {
                },
                data
            })
        } else {
            updateArtwork(artwork.id, newArtworkData.name)
                .then(updateArtworkSuccess)
                .catch(updateArtworkError)
        }
    }

    const changeArtworkName = (e) => {
        setNewArtworkData({name: e.target.value})
    }

    const onDrop = useCallback((acceptedFiles, rejectedFiles, event) => {
        // console.log(URL.createObjectURL(event.target.files[0]))
        const rejectedList = Array.from(rejectedFiles)
        if (rejectedList != null && rejectedList.length > 0) {
            let name = rejectedList.map((file, i) => (
                <p style={{marginTop: 0, marginBottom: 0}} key={i}>{file.name}</p>))
            notification['error']({
                message: 'Unsupported file type',
                description: name
            })
        }
        if (acceptedFiles.length > 0) {
            _onChangeArtwork(acceptedFiles[0]).then()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const {
        getRootProps,
        isDragActive,
        getInputProps,
    } = useDropzone({accept: 'image/*', onDrop, multiple: false,})

    const _onChangeArtwork = async (file) => {
        const artworkInfo = await readFileArtwork(file)
        setNewArtworkData({
            data: artworkInfo.data,
            file: file,
            width: artworkInfo.originWidth,
            height: artworkInfo.originHeight
        })
    }

    const diffSizeArtwork = () => {
        return newArtworkData.width !== artwork.width && newArtworkData.height !== artwork.height
    }

    const updateButtonDisable = () => {
        if (newArtworkData.file) {
            return diffSizeArtwork()
        }
        return newArtworkData.name === artwork.name
    }

    return (
        <div>
            <div className="flex-center">
                <div>
                    <Tooltip content="Edit">
                        <Button className="ant-dropdown-link"
                                onClick={showArtworkUpdate}
                                type="link" >
                            <FontAwesomeIcon icon={faEdit}/>
                        </Button>
                    </Tooltip>
                </div>
            </div>
            {visibleUpdate && <Modal
                open={visibleUpdate}
                onClose={() => {
                    setVisibleUpdate(false)
                }}
                title="Update Artwork"
                primaryAction={{
                    content: 'Update',
                    onAction: handleUpdate,
                    disabled: updateButtonDisable(),
                    loading: loading
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => {
                            setVisibleUpdate(false)
                        },
                    },
                ]}
            >
                <Modal.Section>
                    <div>
                        <label className="label-update">New artwork name </label>
                        <Input
                            placeholder="Enter new artwork name "
                            allowClear
                            defaultValue={artwork.name}
                            onChange={changeArtworkName}
                        />
                    </div>
                    <div className={'mt-4'}>
                        <label className="label-update"> Replace artwork </label>
                        <Row>
                            <Col span={24}>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <div className={'ant-upload ant-upload-drag'}>
                                    <span tabIndex="0" className="ant-upload ant-upload-btn" role="button">
                                        <div className="ant-upload-drag-container">
                                                <p className="ant-upload-drag-icon">
                                                    <i aria-label="icon: inbox" className="anticon anticon-inbox">
                                                    <svg
                                                        viewBox="0 0 1024 1024" focusable="false" className=""
                                                        data-icon="inbox"
                                                        width="1em"
                                                        height="1em" fill="currentColor" aria-hidden="true">
                                                        <path
                                                            d="M885.2 446.3l-.2-.8-112.2-285.1c-5-16.1-19.9-27.2-36.8-27.2H281.2c-17 0-32.1 11.3-36.9 27.6L139.4 443l-.3.7-.2.8c-1.3 4.9-1.7 9.9-1 14.8-.1 1.6-.2 3.2-.2 4.8V830a60.9 60.9 0 0 0 60.8 60.8h627.2c33.5 0 60.8-27.3 60.9-60.8V464.1c0-1.3 0-2.6-.1-3.7.4-4.9 0-9.6-1.3-14.1zm-295.8-43l-.3 15.7c-.8 44.9-31.8 75.1-77.1 75.1-22.1 0-41.1-7.1-54.8-20.6S436 441.2 435.6 419l-.3-15.7H229.5L309 210h399.2l81.7 193.3H589.4zm-375 76.8h157.3c24.3 57.1 76 90.8 140.4 90.8 33.7 0 65-9.4 90.3-27.2 22.2-15.6 39.5-37.4 50.7-63.6h156.5V814H214.4V480.1z"/>
                                                    </svg>
                                                    </i>
                                                </p>
                                            {
                                                isDragActive ?
                                                    <p>Drop the files here ...</p> :
                                                    <p className="ant-upload-text">Click or drag file to this area to
                                                        upload</p>
                                            }
                                        </div>
                                    </span>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <Row className={'py-3 border-avatar mt-3'} style={{borderRadius: 3}}>
                        <Col span={10}>
                            <div
                                className={'text-center p-1 h-100'}
                            >
                                <div>
                                    <Avatar shape="square" size={120} src={artwork.file_url}/>
                                    <div className={'text-center mt-2'}>
                                        <p>Current artwork: </p>
                                        <p><span
                                            className={'text-primary font-weight-bold'}>{artwork.width} x {artwork.height}</span> (px)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col span={1}/>
                        <Col span={2} className={'text-center'}>
                            {
                                newArtworkData.data && (
                                    <div style={{
                                        textAlign: 'center',
                                        verticalAlign: 'middle',
                                        height: 140,
                                        display: 'table-cell',
                                        width: '100%'
                                    }}
                                    >
                                        <Icon style={{fontSize: '26px'}} className={'text-primary'} type="swap"/>
                                    </div>
                                )
                            }
                        </Col>
                        <Col span={1}/>
                        <Col span={10}>
                            <div className={'text-center p-1 h-100'}>
                                {
                                    newArtworkData.data && (
                                        <div>
                                            <Avatar shape="square" size={120} src={newArtworkData.data}/>
                                            <div className={'text-center mt-2'}>
                                                <p>New artwork:</p>
                                                <p><span
                                                    className={!diffSizeArtwork() ? 'text-success font-weight-bold' : 'text-danger font-weight-bold'}>{newArtworkData.width} x {newArtworkData.height}</span> (px)
                                                </p>

                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} className={'pt-2'}>
                            {
                                newArtworkData.data && diffSizeArtwork() && (
                                    <Alert message="New artwork has different size from current artwork" type="warning"
                                           showIcon/>)
                            }
                        </Col>
                    </Row>
                </Modal.Section>
            </Modal>
            }
        </div>
    )
}

export default ArtworkUpdate
