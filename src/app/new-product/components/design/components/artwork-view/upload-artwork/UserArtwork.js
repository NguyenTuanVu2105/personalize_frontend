import React, {useContext, useEffect, useRef, useState} from "react"
import StyledDropzone from "../artwork-item/StyledDropzone"
import {TextContainer} from "@shopify/polaris"
import {Spin, Tooltip} from "antd"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faCheck} from "@fortawesome/free-solid-svg-icons"
import Selection from "react-ds"
import {useDropzone} from "react-dropzone"
import {checkArtworkConstraints} from "../../../../../helper/checkArtworkConstraints"
import NewProductContext from "../../../../../context/NewProductContext"
import {LAYER_TYPE} from "../../../../../constants/constants"
import {errorLimitLayer} from "./constant"
import {
    ALL_QUERY_INDEX,
    ARTWORK_STATUS_CODES,
    SERVER_ALL_QUERY_INDEX
} from "../../../../../../artwork/constants/artworkStatuses"
import {getAllArtworkWithDefault} from "../../../../../../../services/api/artwork"
import InfiniteScroll from "react-infinite-scroller"

const PAGE_SIZE = 12

const UserArtwork = (props) => {

    const {
        constraints,
        multiple,
        maxArtwork,
        currentNumberArtworks,
        onFileDrop,
        onSelectExistArtwork,
        side_id
    } = props

    const [_artworks, _setArtworks] = useState([])
    const [_chosenArtwork, _setChosenArtwork] = useState([])
    const refSelection = useRef(null)
    const elRefs = useRef([])
    const {product} = useContext(NewProductContext)
    const [loading, setLoading] = useState(false)


    const _fetchArtworks = async (page, query, size, activeStatus = ARTWORK_STATUS_CODES.ACTIVE) => {
        setLoading(true)
        const displayStatusQuery = activeStatus === ALL_QUERY_INDEX ? SERVER_ALL_QUERY_INDEX : activeStatus
        const ordering = "-last_used_time"
        // const _sizes = !isEmpty(size)  ? size.map((s) => `${s.width}x${s.height}`).join(",") : constraints.allowed_sizes.map((s) => `${s.width}x${s.height}`).join(",")
        const artworksRes = await getAllArtworkWithDefault(page, PAGE_SIZE, query, [], displayStatusQuery, null, null, ordering, true, side_id)
        if (!artworksRes.success)
            return
        const data = artworksRes.data
        data.results = data.results.map(artwork => ({
            ...artwork,
            originWidth: artwork.width,
            originHeight: artwork.height
        }))
        _setArtworks(data.results)
        setLoading(false)
    }

    useEffect(() => {
        _fetchArtworks(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({accept: 'image/*', onDrop: onFileDrop, multiple: true,})

    const handleChangeSelection = indexes => {
        let indexArray = indexes

        if (indexArray.length === 0) return
        const artworks = []
        indexArray.forEach(index => {
            const artwork = _artworks[index]
            const isValid = checkArtworkConstraints(artwork, constraints) === null
            if (isValid)
                artworks.push({
                    id: artwork.id,
                    name: artwork.name,
                    url: artwork.file_url,
                    width: artwork.width,
                    isLegalAccepted: artwork.is_legal_accepted,
                    height: artwork.height,
                    is_default: artwork.is_default
                })
        })
        _setChosenArtwork(artworks)

    }

    const _toggleArtwork = (artwork) => {
        if (!multiple) {
            onSelectExistArtwork([{
                id: artwork.id,
                name: artwork.name,
                url: artwork.file_url,
                isLegalAccepted: artwork.is_legal_accepted,
                width: artwork.width,
                height: artwork.height,
                is_default: artwork.is_default,
                type: LAYER_TYPE.artwork
            }])
            _setChosenArtwork([])
            return
        }


        const chosenArtwork = [{
            id: artwork.id,
            name: artwork.name,
            url: artwork.file_url,
            isLegalAccepted: artwork.is_legal_accepted,
            width: artwork.width,
            height: artwork.height,
            is_default: artwork.is_default,
            type: LAYER_TYPE.artwork
        }]
        const isSelected = _chosenArtwork.findIndex(a => a.id === artwork.id && a.is_default === artwork.is_default)
        if (isSelected !== -1) {

            _chosenArtwork.splice(isSelected, 1)
            _setChosenArtwork([..._chosenArtwork])
        } else {
            if (_chosenArtwork.length >= (maxArtwork - currentNumberArtworks)) {
                errorLimitLayer(maxArtwork, currentNumberArtworks)
            } else {
                _setChosenArtwork(_chosenArtwork.concat(chosenArtwork))
            }
        }
    }


    return (
        <div>
            User
            <TextContainer>
                <div
                    className='disable-more-filters px-2'
                    ref={refSelection}
                >
                    <div className="row noselect px-2 mb-2">
                        <StyledDropzone {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
                            <input {...getInputProps()} />
                            <p>Drag and drop your artwork here, or click to select artwork files</p>
                        </StyledDropzone>
                    </div>
                    <InfiniteScroll
                        initialLoad={false}
                        pageStart={0}
                        loadMore={() => {
                            console.log(1)
                        }}
                        hasMore={true}
                        useWindow={false}
                    >
                        <Spin spinning={loading}>
                            <div className="row noselect px-2 mt-3">
                                {_artworks.map((artwork, index) => {
                                    let isSelected = _chosenArtwork.findIndex(a => a.id === artwork.id && a.is_default === artwork.is_default) >= 0
                                    const selectedCount = product.userProducts
                                        .reduce((count, userProduct) => {
                                            const layers = []
                                            userProduct.sideLayers.forEach((s) => {
                                                layers.push(...s.layers.filter((l) => l.id === artwork.id && l.is_default === artwork.is_default))
                                            })
                                            return count + layers.length
                                        }, 0)
                                    const className = "col-lg-2 col-3 px-3"
                                    const artworkStyle = {
                                        maxWidth: artwork.height >= artwork.width ? "unset" : `100%`,
                                        height: artwork.height >= artwork.width ? "100%" : "unset",
                                        maxHeight: 90,
                                        position: 'relative',
                                        zIndex: 1,
                                        pointerEvents: 'none',
                                    }
                                    const key = artwork.is_default ? `${artwork.id}_1` : `${artwork.id}_2`
                                    return (
                                        <div className={className} key={key}>
                                            <Tooltip title={artwork.name}>
                                                <div
                                                    ref={r => elRefs.current[index] = r}
                                                    className={`artwork-card-item artwork-item-enable text-center my-3 ${isSelected && 'artwork-item-selected'}`}
                                                    key={artwork.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        _toggleArtwork(artwork)
                                                    }}
                                                    id={`select-artwork-${index}`}
                                                    style={{position: 'relative'}}>
                                                    <div className={"image-container"}>
                                                        <img src={artwork.file_url}
                                                             className={'rounded'}
                                                             style={artworkStyle} alt={artwork.title}/>
                                                        {
                                                            isSelected &&
                                                            <div className={"selected-mark-container"}>
                                                                <FontAwesomeIcon
                                                                    style={{
                                                                        width: 15,
                                                                    }}
                                                                    icon={faCheck}/>
                                                            </div>
                                                        }
                                                    </div>
                                                    <div className={"artwork-caption-container"}>
                                                        <p>
                                                            {`${artwork.originWidth} x ${artwork.originHeight} (px)`}
                                                        </p>
                                                        <em>
                                                            {artwork.is_default ?
                                                                (isSelected ? `Click to deselect` :
                                                                    <div
                                                                        style={{color: 'darkblue'}}>PrintHolo's
                                                                        Artwork</div>)
                                                                : (selectedCount === 1
                                                                    ? `Selected ${selectedCount} time`
                                                                    : selectedCount > 1
                                                                        ? `Selected ${selectedCount} times`
                                                                        : isSelected
                                                                            ? `Click to deselect`
                                                                            : `Used in ${artwork.total_created_product} products`)}
                                                        </em>
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </div>)
                                })
                                }
                            </div>
                        </Spin>

                    </InfiniteScroll>
                    {
                        refSelection.current && elRefs.current &&
                        <Selection target={refSelection.current} elements={elRefs.current}
                                   onSelectionChange={handleChangeSelection}
                                   style={props.style}
                                   disabled={true}
                        />
                    }
                </div>
            </TextContainer>
        </div>
    )
}

export default UserArtwork