import React, {useContext, useEffect, useRef, useState} from 'react'
import {Col, Menu, Row, Spin, Tooltip} from 'antd'
import {useDropzone} from 'react-dropzone'
import StyledDropzone from '../artwork-item/StyledDropzone'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCheck} from '@fortawesome/free-solid-svg-icons'
import {checkArtworkConstraints} from '../../../../../helper/checkArtworkConstraints'
import NewProductContext from '../../../../../context/NewProductContext'
import {ChoiceList, Filters, Modal, Tabs, TextContainer} from '@shopify/polaris'
import Selection from 'react-ds'
import './UploadArtworkModal.scss'
import {getAllArtworkWithDefault} from '../../../../../../../services/api/artwork'
import {
    ALL_QUERY_INDEX,
    ARTWORK_REVERSED_STATUSES,
    ARTWORK_STATUS_CODES,
    SERVER_ALL_QUERY_INDEX
} from '../../../../../../artwork/constants/artworkStatuses'
import {errorLimitLayer} from "./constant"
import {LAYER_TYPE} from "../../../../../constants/constants"
import DefaultArtwork from "./DefaultArtwork"
import UserArtwork from "./UserArtwork"

const PAGE_SIZE = 12

const UploadArtworkModal = (props) => {

    const {
        visible,
        setVisible,
        onFileDrop,
        onSelectExistArtwork,
        multiple,
        constraints,
        side_id,
        maxArtwork,
        currentNumberArtworks
    } = props
    const [_artworks, _setArtworks] = useState([])
    const [_chosenArtwork, _setChosenArtwork] = useState([])
    const refSelection = useRef(null)
    const elRefs = useRef([])
    const {product} = useContext(NewProductContext)

    const [queryValue, setQueryValue] = useState(null)
    const [activeStatus, setActiveStatus] = useState('1')
    const [size, setSize] = useState(null)
    const [loading, setLoading] = useState(false)
    // const [sizes, setSizes] = useState(constraints.allowed_sizes.map(constraint => {
    //     return {
    //         label: `${constraint.width} x ${constraint.height} px`,
    //         value: `${constraint.width}x${constraint.height}`
    //     }
    // }))
    // const [tmpSize, setTmpSize] = useState(null)

    const appliedFilters = []

    const disambiguateLabel = (key, value) => {
        switch (key) {
            case 'activeStatus':
                return `Active Status: ${ARTWORK_REVERSED_STATUSES[value]}`
            case 'size':
                return 'Size: ' + value.map((val) => `${val.width} x ${val.height} px`).join(', ')
            // case 'rowNumber':
            //     return `Item per page: ${value}`
            default:
                return value
        }
    }

    const isEmpty = (value) => {
        if (Array.isArray(value)) {
            return value.length === 0
        } else {
            return value === '' || value == null
        }
    }

    // const handleSizeFilterRemove = () => {
    //     setTmpSize([])
    //     setSize(null)
    //     _fetchArtworks(1, queryValue, null, activeStatus)
    // }

    const handleActiveStatusRemove = () => {
        setActiveStatus(ALL_QUERY_INDEX)
        _fetchArtworks(1, queryValue, size, ALL_QUERY_INDEX)

    }

    // if (!isEmpty(size)) {
    //     const key = 'size'
    //     if (size !== []) {
    //         appliedFilters.push({
    //             key,
    //             label: disambiguateLabel(key, size),
    //             onRemove: handleSizeFilterRemove,
    //         })
    //     }
    // }

    if (!isEmpty(activeStatus)) {
        const key = 'activeStatus'
        if (activeStatus !== ALL_QUERY_INDEX) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, activeStatus),
                onRemove: handleActiveStatusRemove,
            })
        }
    }

    let shiftKey = false

    useEffect(() => {
        if (visible) {
            _fetchArtworks(1)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible])

    // console.log(refSelection, elRefs)

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

    const handleFiltersQueryChange = (value) => {
        setQueryValue(value)
        _fetchArtworks(1, value, size, activeStatus)
    }

    const handleQueryValueRemove = () => {
        setQueryValue(null)
        _fetchArtworks(1, null, size)
    }

    const handleFiltersClearAll = () => {
        // setSizes([])
        setActiveStatus(ALL_QUERY_INDEX)
        setQueryValue(null)
        _fetchArtworks(1, null, null, activeStatus)

    }

    const handleActiveStatusChange = (value) => {
        setActiveStatus(value[0])
        _fetchArtworks(1, queryValue, size, value[0])
    }

    // const handleSizeFilterChange = (value) => {
    //     setTmpSize(value)
    //     const sizes = value.map((size) => {
    //         const splitedSize = size.split('x')
    //         return {
    //             width: splitedSize[0],
    //             height: splitedSize[1]
    //         }
    //     })
    //     setSize(sizes)
    //     _fetchArtworks(1, queryValue, sizes, activeStatus)
    // }

    const filters = [
        {
            key: 'activeStatus',
            label: 'Active Status',
            filter: (
                <ChoiceList
                    title="Active Status"
                    titleHidden
                    choices={[
                        {label: 'All', value: ALL_QUERY_INDEX},
                        {label: 'Active', value: ARTWORK_STATUS_CODES.ACTIVE},
                        {label: 'Inactive', value: ARTWORK_STATUS_CODES.INACTIVE},
                    ]}
                    selected={activeStatus || ARTWORK_STATUS_CODES.ACTIVE}
                    onChange={handleActiveStatusChange}
                    // allowMultiple
                />
            ),
            shortcut: true,
        },
        // {
        //     key: 'size',
        //     label: 'Size',
        //     filter: (
        //         <ChoiceList
        //             title="Size"
        //             titleHidden
        //             choices={sizes}
        //             selected={tmpSize || []}
        //             onChange={handleSizeFilterChange}
        //             allowMultiple
        //         />
        //     ),
        //     shortcut: true,
        // },
    ]

    const _toggleArtwork = (artwork, _shift) => {
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

    const setDefaultFilters = () => {
        setSize(null)
        setQueryValue(null)
        setActiveStatus('1')
        // setTmpSize(null)
    }

    const handleOk = () => {
        onSelectExistArtwork(_chosenArtwork)
        _setChosenArtwork([])
        setDefaultFilters()
    }

    const handleChangeSelection = indexes => {
        let indexArray = indexes

        if (indexArray.length === 0) return
        if (shiftKey) {
            let artworks = []
            indexArray.forEach(index => {
                const artwork = _artworks[index]
                const isSelected = _chosenArtwork.findIndex(a => a.id === artwork.id && a.is_default === artwork.is_default)
                if (isSelected !== -1) {
                    _chosenArtwork.splice(isSelected, 1)
                } else {
                    artworks.push({
                        id: artwork.id,
                        name: artwork.name,
                        url: artwork.file_url,
                        width: artwork.width,
                        isLegalAccepted: artwork.is_legal_accepted,
                        height: artwork.height,
                        is_default: artwork.is_default
                    })
                }
            })
            _setChosenArtwork(_chosenArtwork.concat(artworks))
        } else {
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
    }

    const cancelModal = () => {
        _setChosenArtwork([])
        setVisible(false)
        setDefaultFilters()
    }

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({accept: 'image/*', onDrop: onFileDrop, multiple: true,})


    const tabs = [
        {
            component: (
                <DefaultArtwork
                    constraints={constraints}
                    multiple={multiple}
                    maxArtwork={maxArtwork}
                    currentNumberArtworks={currentNumberArtworks}
                    onSelectExistArtwork={onSelectExistArtwork}
                />
            ),
            content: "Default artwork",
            panelID: "default"
        },
        {
            content: "My artwork",
            panelID: "user",
            component: (
                <UserArtwork
                    constraints={constraints}
                    multiple={multiple}
                    maxArtwork={maxArtwork}
                    currentNumberArtworks={currentNumberArtworks}
                    side_id={side_id}
                    onFileDrop={onFileDrop}
                    onSelectExistArtwork={onSelectExistArtwork}
                />
            )
        },
    ]

    const [indexSelectedTab, setIndexSelectedTab] = useState(0)
    const [keySelectedTab, setKeySelectedTab] = useState(tabs[0].panelID)

    const onClickItem = (item) => {
        const index = tabs.findIndex((i) => i.panelID === item.key)
        setIndexSelectedTab(index)
        setKeySelectedTab(item.key)
    }


    const handleTabChange = (selectedTabIndex) => setIndexSelectedTab(selectedTabIndex)

    return (
        <div className={"upload-artwork_modal"}>
            <Modal
                large
                size={'large'}
                title={'Select Artworks'}
                open={visible}
                onClose={cancelModal}
                primaryAction={{
                    id: "btn-done-select",
                    content: 'Done',
                    onAction: handleOk,
                }}
                secondaryActions={[
                    {
                        id: "btn-cancel-select",
                        content: 'Cancel',
                        onAction: cancelModal,
                    },
                ]}
                className="upload-artwork_modal"
            >
                <Row gutter={15} className="row-same-height" style={{overflowX: "hidden", margin: 0, minHeight: "60vh"}}>
                    <Col span={5} className="col-same-height border-right">
                        <Menu
                            onClick={onClickItem}
                            style={{width: '100%'}}
                            defaultSelectedKeys={[keySelectedTab]}
                            mode="inline"
                            className="no-border-force list-category"
                        >
                            {
                                tabs.map(tab => {
                                    return (
                                        <Menu.Item key={'' + tab.panelID}>
                                            {tab.content}
                                        </Menu.Item>
                                    )
                                })
                            }
                        </Menu>
                    </Col>
                    <Col span={19} className="col-same-height modal-upload-content">
                        <div className={keySelectedTab === tabs[0].panelID ? "" : "d-none"}>
                            <DefaultArtwork
                                onSelectExistArtwork={onSelectExistArtwork}
                            />
                        </div>
                        <div className={keySelectedTab === tabs[1].panelID ? "" : "d-none"}>
                            <UserArtwork
                                constraints={constraints}
                                multiple={multiple}
                                maxArtwork={maxArtwork}
                                currentNumberArtworks={currentNumberArtworks}
                                side_id={side_id}
                                onFileDrop={onFileDrop}
                                onSelectExistArtwork={onSelectExistArtwork}
                            />
                        </div>

                        {/*<TextContainer>*/}
                        {/*    <div className='disable-more-filters px-2' ref={refSelection}*/}
                        {/*         onMouseDown={(e) => {*/}
                        {/*             shiftKey = e.shiftKey*/}
                        {/*         }}>*/}
                        {/*        <div className="row noselect px-2 mb-2">*/}
                        {/*            <StyledDropzone {...getRootProps({isDragActive, isDragAccept, isDragReject})}>*/}
                        {/*                <input {...getInputProps()} />*/}
                        {/*                <p>Drag and drop your artwork here, or click to select artwork files</p>*/}
                        {/*            </StyledDropzone>*/}
                        {/*        </div>*/}
                        {/*        <Filters*/}
                        {/*            queryPlaceholder={'Artwork Name, ID'}*/}
                        {/*            queryValue={queryValue}*/}
                        {/*            filters={filters}*/}
                        {/*            appliedFilters={appliedFilters}*/}
                        {/*            onQueryChange={handleFiltersQueryChange}*/}
                        {/*            onQueryClear={handleQueryValueRemove}*/}
                        {/*            onClearAll={handleFiltersClearAll}*/}
                        {/*        />*/}
                        {/*        <Spin spinning={loading}>*/}
                        {/*            <div className="row noselect px-2 mt-3">*/}
                        {/*                {_artworks.map((artwork, index) => {*/}
                        {/*                    let isSelected = _chosenArtwork.findIndex(a => a.id === artwork.id && a.is_default === artwork.is_default) >= 0*/}
                        {/*                    const selectedCount = product.userProducts*/}
                        {/*                        .reduce((count, userProduct) => {*/}
                        {/*                            const layers = []*/}
                        {/*                            userProduct.sideLayers.forEach((s) => {*/}
                        {/*                                layers.push(...s.layers.filter((l) => l.id === artwork.id && l.is_default === artwork.is_default))*/}
                        {/*                            })*/}
                        {/*                            return count + layers.length*/}
                        {/*                        }, 0)*/}
                        {/*                    const className = "col-lg-2 col-3 px-3"*/}
                        {/*                    const artworkStyle = {*/}
                        {/*                        maxWidth: artwork.height >= artwork.width ? "unset" : `100%`,*/}
                        {/*                        height: artwork.height >= artwork.width ? "100%" : "unset",*/}
                        {/*                        maxHeight: 90,*/}
                        {/*                        position: 'relative',*/}
                        {/*                        zIndex: 1,*/}
                        {/*                        pointerEvents: 'none',*/}
                        {/*                    }*/}
                        {/*                    const key = artwork.is_default ? `${artwork.id}_1` : `${artwork.id}_2`*/}
                        {/*                    return (*/}
                        {/*                        <div className={className} key={key}>*/}
                        {/*                            <Tooltip title={artwork.name}>*/}
                        {/*                                <div*/}
                        {/*                                    ref={r => elRefs.current[index] = r}*/}
                        {/*                                    className={`artwork-card-item artwork-item-enable text-center my-3 ${isSelected && 'artwork-item-selected'}`}*/}
                        {/*                                    key={artwork.id}*/}
                        {/*                                    onClick={(e) => {*/}
                        {/*                                        e.stopPropagation()*/}
                        {/*                                        _toggleArtwork(artwork, e.shiftKey)*/}
                        {/*                                    }}*/}
                        {/*                                    id={`select-artwork-${index}`}*/}
                        {/*                                    style={{position: 'relative'}}>*/}
                        {/*                                    <div className={"image-container"}>*/}
                        {/*                                        <img src={artwork.file_url}*/}
                        {/*                                             className={'rounded'}*/}
                        {/*                                             style={artworkStyle} alt={artwork.title}/>*/}
                        {/*                                        {*/}
                        {/*                                            isSelected &&*/}
                        {/*                                            <div className={"selected-mark-container"}>*/}
                        {/*                                                <FontAwesomeIcon*/}
                        {/*                                                    style={{*/}
                        {/*                                                        width: 15,*/}
                        {/*                                                    }}*/}
                        {/*                                                    icon={faCheck}/>*/}
                        {/*                                            </div>*/}
                        {/*                                        }*/}
                        {/*                                    </div>*/}
                        {/*                                    <div className={"artwork-caption-container"}>*/}
                        {/*                                        <p>*/}
                        {/*                                            {`${artwork.originWidth} x ${artwork.originHeight} (px)`}*/}
                        {/*                                        </p>*/}
                        {/*                                        <em>*/}
                        {/*                                            {artwork.is_default ?*/}
                        {/*                                                (isSelected ? `Click to deselect` :*/}
                        {/*                                                    <div*/}
                        {/*                                                        style={{color: 'darkblue'}}>PrintHolo's*/}
                        {/*                                                        Artwork</div>)*/}
                        {/*                                                : (selectedCount === 1*/}
                        {/*                                                    ? `Selected ${selectedCount} time`*/}
                        {/*                                                    : selectedCount > 1*/}
                        {/*                                                        ? `Selected ${selectedCount} times`*/}
                        {/*                                                        : isSelected*/}
                        {/*                                                            ? `Click to deselect`*/}
                        {/*                                                            : `Used in ${artwork.total_created_product} products`)}*/}
                        {/*                                        </em>*/}
                        {/*                                    </div>*/}
                        {/*                                </div>*/}
                        {/*                            </Tooltip>*/}
                        {/*                        </div>)*/}
                        {/*                })*/}
                        {/*                }*/}
                        {/*            </div>*/}
                        {/*        </Spin>*/}
                        {/*        {refSelection.current && elRefs.current &&*/}
                        {/*        <Selection target={refSelection.current} elements={elRefs.current}*/}
                        {/*                   onSelectionChange={handleChangeSelection}*/}
                        {/*                   style={props.style}*/}
                        {/*                   disabled={true}*/}
                        {/*        />}*/}
                        {/*    </div>*/}
                        {/*</TextContainer>*/}
                    </Col>
                </Row>
            </Modal>
        </div>
    )
}

export default UploadArtworkModal
