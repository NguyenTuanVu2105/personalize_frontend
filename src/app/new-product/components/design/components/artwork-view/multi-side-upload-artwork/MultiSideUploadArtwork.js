import React, {useContext, useEffect, useState} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faClone} from '@fortawesome/free-solid-svg-icons'
import MultiSideUploadArtworkModal from './MultiSideUploadArtworkModal'
import {notification} from 'antd'
import {readArtworkFileList} from '../../../../../helper/readArtworks'
import AppContext from '../../../../../../../AppContext'
import NewProductContext from '../../../../../context/NewProductContext'
import {getTitleFromFileName} from '../../../../../helper/getTitleFromFileName'
import _ from 'lodash'

const MultiSideUploadArtwork = (props) => {
    const {startTriggerRerendering, clearTriggerRerendering} = props
    const {setLoading} = useContext(AppContext)
    const [modalVisible, setModalVisible] = useState(false)
    const {product, appendUserProducts} = useContext(NewProductContext)
    const {setIsLoadingImage, uploadManager, setUploadManager, cleanUploadChunk, startUpload} = useContext(NewProductContext)
    useEffect(() => {
        return () => {
        }
    },[])


    const callback = (artwork) => {
        let uploads = uploadManager
        let id = artwork.file.lastModified + "_" + _.random(10000)
        if(artwork.resumable){
            uploads.push({uploadChunk: artwork.resumable, id: id})
            artwork.uploadID = id
            artwork.resumable = null
        }
        setUploadManager(uploads)
        startUpload(id)
    }

    const onFileDrop = async (acceptedFiles, rejectedFiles, event) => {
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

        let artworks = acceptedFiles.map((file) => {
            return {
                originName: file.name,
                name: file.name,
                meta: {},
                file: file,
                isProcessing: true,
            }
        })

        const sideNames = product.abstract.sides.map(side => side.type)
        artworks.forEach(artwork => {
            artwork.originSuggestTitle = getTitleFromFileName(artwork.originName)
            artwork.suggestTitle = sideNames
                .reduce((title, sideName) => title.replace(sideName, '').replace(sideName.toLowerCase(), '').trim(), artwork.originSuggestTitle)
        })
        const groupByTitle = _.groupBy(artworks, (a) => a.suggestTitle)
        // console.log(groupByTitle)
        let userProducts = []
        for (const artworkGroupTitle in groupByTitle) {
            let artworkGroup = groupByTitle[artworkGroupTitle]
            const artworkGroupBySide = {}
            // console.log(artworkGroup)
            product.abstract.sides.forEach(side => {
                const sideLowerName = side.type.toLowerCase()
                artworkGroupBySide[side.id] = artworkGroup.filter(a => a.originSuggestTitle.toLowerCase().endsWith(sideLowerName))
                artworkGroup = artworkGroup.filter(a => !a.originSuggestTitle.toLowerCase().endsWith(sideLowerName))
            })
            // console.log(Object.values(artworkGroupBySide))
            if (artworkGroup.length > 0) {
                const defaultSide = product.abstract.sides[0]
                artworkGroupBySide[defaultSide.id].push(...artworkGroup)
            }
            const userProductCount = Object.values(artworkGroupBySide).reduce((max, artworkList) => Math.max(artworkList.length, max), 0)

            for (let i = 0; i < userProductCount; i++) {
                let userProduct = {artworks: []}
                for (const side of product.abstract.sides) {
                    if (artworkGroupBySide[side.id].length > i) {
                        userProduct.artworks.push({
                            ...artworkGroupBySide[side.id][i],
                            side: side.id,
                        })

                    }
                }
                userProduct.title = userProduct.artworks[0].suggestTitle
                userProduct.description = product.abstract.meta.description
                userProducts.push(userProduct)
            }

            // console.log(userProductCount)
            // console.log(userProducts)
        }
        appendUserProducts(userProducts)
        onFinishArtworkUpload()

        artworks = [].concat.apply([], userProducts.map(product => product.artworks))
        // console.log(artworks);

        await readArtworkFileList(artworks, callback)
        cleanUploadChunk()

        setIsLoadingImage(false)
        clearTriggerRerendering()
    }

    const onFinishArtworkUpload = () => {
        setModalVisible(false)
        setLoading(false)
    }

    return (
        <div>
            <div className="multi-side-upload-btn d-none">
                <span onClick={() => {
                    setModalVisible(true)
                }}>
                        <FontAwesomeIcon icon={faClone} color="white"/>
                        <br/>
                        Upload Multiside
                </span>
            </div>
            <MultiSideUploadArtworkModal visible={modalVisible} setVisible={setModalVisible} onFileDrop={onFileDrop}/>
        </div>)
}


export default MultiSideUploadArtwork
