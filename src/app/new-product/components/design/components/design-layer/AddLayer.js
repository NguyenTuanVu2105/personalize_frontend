import React, {useContext, useEffect, useRef, useState} from "react"
import {faImages} from "@fortawesome/free-solid-svg-icons"
import UploadArtworkModal from "../artwork-view/upload-artwork/UploadArtworkModal"
import {notification} from "antd"
import {readArtworkFileList, readExistArtworks} from "../../../../helper/readArtworks"
import NewProductContext from "../../../../context/NewProductContext"
import AppContext from "../../../../../../AppContext"
import NewProductDesignContext from "../../context/NewProductDesignContext"
import {Button} from "@shopify/polaris"
import _ from "lodash"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {errorLimitLayer} from "../artwork-view/upload-artwork/constant"
import NotAllowDiv from "../../../common/NotAllowDiv"
import textIcon from "../../../../../../assets/images/textWhite.svg"
import ShowProductModal from "../personalize/ShowProductModal";


const MAX_LAYER = 10
const AddLayer = ({isDisable}) => {
    const [modalVisible, setModalVisible] = useState(false)
    const [currentNumberLayers, setCurrentNumberLayers] = useState(0)

    const {
        setIsLoadingImage,
        uploadManager,
        setUploadManager,
        cleanUploadChunk,
        setProduct,
        appendArtworkToSide,
        product,
        startUpload,
        appendTextToSide
    } = useContext(NewProductContext)

    const {setLoading} = useContext(AppContext)

    const {designState, setDesignState} = useContext(NewProductDesignContext)

    const interval = useRef()

    const abstractSide = product.abstract.sides.find(item => item.side = designState.currentSideId)

    const constraints = abstractSide ? abstractSide.constraints : {}

    const [curProduct, setCurProduct] = useState(null)
    const [curSideLayer, setCurSideLayer] = useState(null)
    const [productVisible, setProductVisible] = useState(false)

    useEffect(() => {
        if (curProduct) {
            setCurSideLayer(curProduct.sideLayers.find((s) => s.side.id === designState.currentSideId))
        }
    }, [designState.currentSideId, curProduct])


    useEffect(() => {
        const result = []
        if (curSideLayer) {
            result.push(...curSideLayer.layers)
        }
        setCurrentNumberLayers(result.length)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curSideLayer, curSideLayer && curSideLayer.layers.length])


    useEffect(() => {
        setCurProduct(product.userProducts[designState.currentProductIndex])
    }, [designState.currentProductIndex, product.userProducts])

    const startTriggerRerendering = () => {
        interval.current = setInterval(() => {
            // console.log("Rerendering")
            setDesignState({updating: true})
            setProduct({updating: true})
        }, 200)
    }

    const onFinishUpload = (artworks) => {
        const sideId = designState.currentSideId
        const lastLayerIndex = appendArtworkToSide(artworks, sideId, designState.currentProductIndex)
        setDesignState({currentLayerIndex: lastLayerIndex})
    }

    const onFinishArtworkUpload = (artworks) => {
        onFinishUpload(artworks)
        // onFinishUpload(checkArtworks(artworks))
        setModalVisible(false)
        setLoading(false)
    }

    const clearTriggerRerendering = () => {
        setTimeout(() => {
            clearInterval(interval.current)
            setDesignState({updating: false})
            setProduct({updating: false})
        }, 200)
    }

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

    const onSelectExistArtwork = async (artworks) => {
        setLoading(true)
        onFinishArtworkUpload(await readExistArtworks(artworks))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }

    const onFileDrop = async (acceptedFiles, rejectedFiles, event) => {
        event.stopPropagation()
        setLoading(true)
        setIsLoadingImage(true)
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

        if (acceptedFiles.length > (MAX_LAYER - currentNumberLayers)) {
            errorLimitLayer(MAX_LAYER, currentNumberLayers)
            setIsLoadingImage(false)
            setLoading(false)
            clearTriggerRerendering()
            return
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

    const onSelectText = () => {
        if (!(MAX_LAYER - currentNumberLayers > 0)) {
            errorLimitLayer(MAX_LAYER, currentNumberLayers)
            clearTriggerRerendering()
        } else {
            console.log(designState)
            const sideId = designState.currentSideId
            const lastLayerIndex = appendTextToSide(sideId, designState.currentProductIndex)
            setDesignState({currentLayerIndex: lastLayerIndex})
        }
    }

    return (
        <div className="mt-3">
            <div className="flex-horizontal" id="add-layer-div" style={{position: "relative"}}>
                <div className="add-button" style={{zIndex: 1}}>
                    <NotAllowDiv isDisable={isDisable} message={"Please change to design"} placement={"top"}/>
                    <Button
                        id={"btn-new-text"}
                        icon={<img src={textIcon} style={{height: 13, width: 16}} alt={"Text icon"}/>}
                        primary={true}
                        size={"slim"}
                        fullWidth={true}
                        onClick={() => setProductVisible(true)}
                    >
                        Product
                    </Button>
                </div>
                <div className="add-button" style={{zIndex: 1}}>
                    <NotAllowDiv isDisable={isDisable} message={"Please change to design"} placement={"top"}/>
                    <Button
                        id={"btn-new-text"}
                        onClick={onSelectText}
                        icon={<img src={textIcon} style={{height: 13, width: 16}} alt={"Text icon"}/>}
                        primary={true}
                        size={"slim"}
                        fullWidth={true}
                    >
                        Text
                    </Button>
                </div>
                <div className="add-button">
                    <NotAllowDiv isDisable={isDisable} message={"Please change to design"} placement={"top"}/>
                    <Button
                        id={"btn-new-artwork"}
                        onClick={() => setModalVisible(true)}
                        icon={<FontAwesomeIcon icon={faImages}/>}
                        primary={true}
                        size={"slim"}
                        fullWidth={true}
                    >
                        Artwork
                    </Button>
                </div>
            </div>

            <UploadArtworkModal
                visible={modalVisible}
                setVisible={setModalVisible}
                onFileDrop={onFileDrop}
                onSelectExistArtwork={onSelectExistArtwork}
                constraints={constraints}
                multiple={true}
                side_id={designState.currentSideId}
                maxArtwork={MAX_LAYER}
                currentNumberArtworks={currentNumberLayers}
            />
            <ShowProductModal
                visible={productVisible}
                setVisible={setProductVisible}
            >
            </ShowProductModal>
        </div>
    )
}

export default AddLayer
