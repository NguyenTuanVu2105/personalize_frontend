import React, {useContext, useEffect, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import {notification, Tooltip, Icon} from 'antd'
import styled from 'styled-components'
import './UploadArtwork.scss'
import UploadArtworkModal from './UploadArtworkModal'
import PropTypes from 'prop-types'
import AppContext from '../../../../../../../AppContext'
import {readArtworkFileList, readExistArtworks} from '../../../../../helper/readArtworks'
import HoveredElement from '../../../../../../shared/HoveredElement'
import dropyourdesignhere from '../../../../../../../assets/images/dropyourdesignhere.png'
import NewProductContext from "../../../../../context/NewProductContext"
import _ from "lodash"
import NewProductDesignContext from "../../../context/NewProductDesignContext"
import {errorLimitLayer} from "./constant"

const StyleButton = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
`

const MAX_LAYER = 10

const UploadArtwork = (props) => {
    const {
        onFinishUpload,
        multiple,
        constraints,
        startTriggerRerendering,
        clearTriggerRerendering,
        preview,
        side,
        sideId,
        id
    } = props
    const {
        setIsLoadingImage,
        uploadManager,
        setUploadManager,
        cleanUploadChunk,
        startUpload,
        product
    } = useContext(NewProductContext)
    const {designState} = useContext(NewProductDesignContext)
    const [modalVisible, setModalVisible] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const {setLoading} = useContext(AppContext)
    const [currentNumberArtworks, setCurrentNumberArtworks] = useState(false)


    const [curProduct, setCurProduct] = useState(null)
    const [curSideLayer, setCurSideLayer] = useState(null)


    useEffect(() => {
        if (curProduct) {
            setCurSideLayer(curProduct.sideLayers.find((s) => s.side.id === designState.currentSideId))
        }
    }, [designState.currentSideId, curProduct])

    useEffect(() => {
        setCurProduct(product.userProducts[designState.currentProductIndex])
    }, [designState.currentProductIndex, product.userProducts])


    useEffect(() => {
        let result = []
        if (curSideLayer) {
            result = curSideLayer.layers
            result = _.orderBy(result, ["layerIndex"], ["asc"])
        }
        setCurrentNumberArtworks(result.length)
        // setDesignState({currentLayerIndex: result.length})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curSideLayer, curSideLayer && curSideLayer.layers.length])


    useEffect(() => {
        return () => {
        }
    }, [])

    const callback = (artwork) => {
        let uploads = uploadManager
        let id = artwork.file.lastModified + "_" + _.random(10000)
        if (artwork.resumable) {
            uploads.push({uploadChunk: artwork.resumable, id: id})
            artwork.uploadID = id
            artwork.resumable = null
        }
        setUploadManager(uploads)
        startUpload(id)
    }


    const onFileDrop = async (acceptedFiles, rejectedFiles, event) => {
        event.stopPropagation()
        setLoading(true)
        setIsLoadingImage(true)
        setDragOver(false)
        startTriggerRerendering()
        const rejectedList = Array.from(rejectedFiles)
        if (rejectedList != null && rejectedList.length > 0) {
            let name = rejectedList.map((file, i) => (
                <p style={{marginTop: 0, marginBottom: 0}} key={i}>{file.name}</p>))
            notification['error']({
                message: 'Unsupported file type',
                description: name
            })
        }

        if (!multiple && acceptedFiles.length > 0) {
            acceptedFiles = [acceptedFiles[0]]
        } else {
            if (acceptedFiles.length > (MAX_LAYER - currentNumberArtworks)) {
                errorLimitLayer(MAX_LAYER, currentNumberArtworks)
                setIsLoadingImage(false)
                setLoading(false)
                clearTriggerRerendering()
                return
            }
        }

        let artworks = acceptedFiles.map((file) => {
            return {
                originName: file.name,
                name: file.name,
                meta: {},
                file: file,
                isProcessing: true,
            }
        })

        onFinishArtworkUpload(artworks)

        await readArtworkFileList(artworks, callback)
        cleanUploadChunk()

        setIsLoadingImage(false)
        clearTriggerRerendering()
    }

    const onFinishArtworkUpload = (artworks) => {
        onFinishUpload(artworks)
        // onFinishUpload(checkArtworks(artworks))
        setModalVisible(false)
        setLoading(false)
    }


    const onSelectExistArtwork = async (artworks) => {
        setLoading(true)
        onFinishArtworkUpload(await readExistArtworks(artworks))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }

    const openModal = () => {
        setModalVisible(true)
    }

    const {
        getRootProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        accept: 'image/*',
        onDrop: onFileDrop,
        multiple: multiple,
        onDragEnter: () => {
            setDragOver(true)
        },
        onDragLeave: () => {
            setDragOver(false)
        }
    })

    return (
        <StyleButton
            {...getRootProps({
                isDragActive, isDragAccept, isDragReject, onClick: () => {
                }
            })}
            style={{width: "100%", height: "100%"}}
        >
            {
                preview
                    ? <div
                        onClick={openModal}
                        style={{
                            maxHeight: "150px",
                            top: "20%",
                            width: "60%",
                            height: "60%",
                            maxWidth: "150px",
                        }}
                        id={id}
                    >
                        <img className='hover-resize' alt="" width='100%' src={dropyourdesignhere}/>
                    </div>
                    : <Tooltip visible={dragOver} title={side ? `Drag to ${side.type}` : 'Drag here'}>
                        <div>
                            <HoveredElement
                                onClick={openModal}
                                className={`upload-btn ${dragOver ? 'active' : ''}`}
                                hoveredElement={<Icon type={"cloud-upload"} style={{fontSize: 20}}/>}
                                style={{
                                    maxWidth: props.maxSize,
                                    maxHeight: props.maxSize,
                                    fontSize: props.maxSize < 65 ? "x-small" : null
                                }}
                                id={id}
                                unHoveredElement={<Icon type={"cloud-upload"} style={{fontSize: 20}}/>}
                            />
                        </div>
                    </Tooltip>
            }
            <UploadArtworkModal
                visible={modalVisible}
                setVisible={setModalVisible}
                onFileDrop={onFileDrop}
                onSelectExistArtwork={onSelectExistArtwork}
                constraints={constraints}
                multiple={multiple}
                side_id={sideId ? sideId : (side ? side.id : '')}
                maxArtwork={MAX_LAYER}
                currentNumberArtworks={currentNumberArtworks}
            />
        </StyleButton>
    )
}

UploadArtwork.defaultProps = {
    multiple: true,
    maxSize: 70
}

UploadArtwork.propTypes = {
    multiple: PropTypes.bool,
    maxSize: PropTypes.number,
}

export default UploadArtwork
