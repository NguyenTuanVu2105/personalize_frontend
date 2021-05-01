import {Banner, Button, Icon, Modal, Spinner, Stack, Tabs} from "@shopify/polaris"
import React, {useContext, useEffect, useRef, useState} from "react"
import NewProductContext from "../../../../context/NewProductContext"
import NewProductDesignContext from "../../context/NewProductDesignContext"
import Cropper from "react-cropper"
import "cropperjs/dist/cropper.css"
import "./BackgroundCustomizationModal.scss"
import StyledBackgroundDropzone from "./StyledBackgroundDropzone"
import {useDropzone} from "react-dropzone"
import {generateBackgroundMockup} from "../../../../../../services/api/mockupPreview"
import {Carousel, Checkbox, Empty, notification} from "antd"
import {dataURItoBlob} from "../../../../../../services/util/blob"
import {getSampleBackgroundList} from "../../../../../../services/api/mockupBackground"
import _ from 'lodash'
import {ChevronLeftMinor, ChevronRightMinor} from "@shopify/polaris-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faCheck} from "@fortawesome/free-solid-svg-icons"

const MODAL_COL_5_SIZE = 480

const BackgroundCustomizationModal = () => {
    const {product, setProduct} = useContext(NewProductContext)
    const [modalActive, setModalActive] = useState(false)
    const [bgLoading, setBgLoading] = useState(false)
    const [bgMockupURLs, setBgMockupURLs] = useState([])

    const [bgImage, setBgImage] = useState(null)
    const [cropper, setCropper] = useState(null)
    const [selectedTab, setSelectedTab] = useState(0)
    const [sampleBackgrounds, setSampleBackgrounds] = useState([])
    const [selectedSampleBackground, setSelectedSampleBackground] = useState(null)
    const [mockupToChangeIndexes, setMockupToChangeIndexes] = useState([])

    const handleTabChange = (selectedTabIndex) => setSelectedTab(selectedTabIndex)
    const carousel = useRef()

    useEffect(() => {
        modalActive && retrieveSampleBackground().then()
    }, [modalActive])

    const retrieveSampleBackground = async () => {
        const {success, data} = await getSampleBackgroundList()
        if (success && data.success) {
            setSampleBackgrounds(data.data)
        }
    }

    const toggleModalActive = () => setModalActive(!modalActive)

    const mockupInfos = product.abstract.mockup_infos
    const {designState} = useContext(NewProductDesignContext)
    const userProduct = product.userProducts[designState.currentProductIndex] || {}

    const resetMockupState = (userProduct) => {
        const mockupToChangeIndexes = userProduct.previews.map((i, idx) => idx)
        const mockupURLs = userProduct.previews.map((i, idx) => ({
            mockup_index: idx,
            mockup_url: i.original
        }))
        setMockupToChangeIndexes(mockupToChangeIndexes)
        setBgMockupURLs(mockupURLs)
    }

    useEffect(() => {
        resetMockupState(userProduct)
    }, [userProduct])

    const getMockupSideName = (mockupIndex) => {
        const mockupInfoCombined = _.flattenDeep(_.concat([], mockupInfos.map(mockupInfo => mockupInfo.meta.mockup_infos)))
        return mockupInfoCombined[mockupIndex].side
    }

    const onOpenMockupCustomize = () => {
        setBgImage(null)
        setSelectedSampleBackground(null)
        resetMockupState(userProduct)
        setSelectedTab(0)
        setBgLoading(false)
        toggleModalActive()
    }

    const renderLoading = () => {
        const height = document.getElementById('bg-mockup-area') ? document.getElementById('bg-mockup-area').clientWidth - 30 : MODAL_COL_5_SIZE - 30
        return (
            <div className={"flex-center"} style={{height: height}}>
                <Spinner accessibilityLabel="Spinner example" size="large"/>
            </div>
        )
    }

    const updateBackground = () => {
        const tmpUserProduct = userProduct
        bgMockupURLs.map(bgMockupURL => {
            const mockupIndex = bgMockupURL.mockup_index
            const tmpMockupElement = tmpUserProduct.previews[mockupIndex]
            tmpMockupElement.original = bgMockupURL.mockup_url
            return null
        })
        setProduct({userProduct: tmpUserProduct})
        toggleModalActive()
    }

    const onFileDrop = async (acceptedFiles, rejectedFiles, event) => {
        const reader = new FileReader()
        reader.onload = () => {
            setBgImage(reader.result)
        }
        reader.readAsDataURL(acceptedFiles[0])
    }

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({accept: 'image/*', onDrop: onFileDrop, multiple: false,})

    const onUploadBgGenerate = async () => {
        setBgLoading(true)
        let reqData = {
            product_id: product.abstract.id,
            mockup_version: product.mockupVersion,
            backgroundFile: dataURItoBlob(cropper.getCroppedCanvas().toDataURL('image/png')),
            mockups: mockupToChangeIndexes.map(i => ({
                mockupIndex: i,
                side: getMockupSideName(i),
                mockup_url: userProduct.previews[i].original
            })),
        }
        // if (product.originalUserProductId) reqData.original_user_product_id = product.originalUserProductId
        // else if (product.originalSampleProductId) reqData.original_sample_product_id = product.originalSampleProductId

        const {success, data} = await generateBackgroundMockup(reqData)
        if (success && data.success) {
            let tmpBgMockupURLs = bgMockupURLs
            data.mockups.map(m => {
                const mockupIndex = m.mockup_index
                tmpBgMockupURLs[mockupIndex].mockup_url = m.mockup
                return null
            })
            setBgMockupURLs(tmpBgMockupURLs)
        } else notification.error({
            message: "Something went wrong, please try again",
            duration: 2
        })
        setBgLoading(false)
    }

    const onSampleBgGenerate = async () => {
        // const backgroundBase64 = await getBase64FromUrl(sampleBackgrounds[selectedSampleBackground])
        setBgLoading(true)
        let reqData = {
            product_id: product.abstract.id,
            // backgroundFile: dataURItoBlob(backgroundBase64),
            mockup_version: product.mockupVersion,
            backgroundUrl: sampleBackgrounds[selectedSampleBackground],
            mockups: mockupToChangeIndexes.map(i => ({
                mockupIndex: i,
                side: getMockupSideName(i),
                mockup_url: userProduct.previews[i].original
            })),
        }
        // if (product.originalUserProductId) reqData.original_user_product_id = product.originalUserProductId
        // else if (product.originalSampleProductId) reqData.original_sample_product_id = product.originalSampleProductId

        const {success, data} = await generateBackgroundMockup(reqData)
        if (success && data.success) {
            let tmpBgMockupURLs = bgMockupURLs
            data.mockups.map(m => {
                const mockupIndex = m.mockup_index
                tmpBgMockupURLs[mockupIndex].mockup_url = m.mockup
                return null
            })
            setBgMockupURLs(tmpBgMockupURLs)
        } else notification.error({
            message: "Something went wrong, please try again",
            duration: 2
        })
        setBgLoading(false)
    }

    const uploadBgTabContent = (
        <div>
            <StyledBackgroundDropzone {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
                <input {...getInputProps()} />
                <p>Drag and drop your background here, or click to select an image file</p>
            </StyledBackgroundDropzone>
            {
                bgImage ? (
                    <div className={"selected-bg mt-3"}>
                        <Cropper
                            style={{height: MODAL_COL_5_SIZE - 260, width: "100%"}}
                            initialAspectRatio={1}
                            aspectRatio={1}
                            // preview=".img-preview"
                            src={bgImage}
                            viewMode={1}
                            guides={true}
                            // minCropBoxHeight={100}
                            // minCropBoxWidth={100}
                            background={true}
                            responsive={true}
                            toggleDragModeOnDblclick={false}
                            autoCropArea={1}
                            checkOrientation={false}
                            // checkCrossOrigin={false}
                            onInitialized={(instance) => setCropper(instance)}
                            // cropend={() => {
                            //     cropper && setCropData(cropper.getCroppedCanvas().toDataURL('image/png'))
                            // }}
                        />
                        <div className={'mt-4'}>
                            <Button primary fullWidth onClick={onUploadBgGenerate} disabled={bgLoading}>Crop and
                                generate</Button>
                        </div>
                    </div>
                ) : (
                    <div className={"mt-4"}>
                        <Banner title="Upload instructions" status="info">
                            <p>It is recommended to upload a 1000x1000px resolution image.</p>
                        </Banner>
                    </div>
                )
            }
        </div>
    )

    const sampleBgTabContent = (
        <div>
            <div className={"row mx-0"} style={{overflowY: "auto", maxHeight: MODAL_COL_5_SIZE - 192}}>
                {sampleBackgrounds && sampleBackgrounds.map((sampleBackground, index) => {
                    const isSelected = index === selectedSampleBackground
                    return (
                        <div key={index} className={'col-lg-3 mb-3 px-3 sample-background-img-container'}
                             onClick={() => setSelectedSampleBackground(index)}>
                            <img src={sampleBackground} alt={sampleBackground}
                                 className={'w-100 sample-background-img'}/>
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
                    )
                })}
                {
                    sampleBackgrounds.length === 0 && (
                        <div className={'w-100 flex-center'}>
                            <Empty description={"No sample background available"}/>
                        </div>
                    )
                }
            </div>
            <div className={'mt-4'}>
                <Button primary fullWidth onClick={onSampleBgGenerate}
                        disabled={selectedSampleBackground === null || bgLoading}>Generate</Button>
            </div>
        </div>
    )

    const tabs = [
        {
            id: 'upload-bg',
            content: 'Upload background',
            component: uploadBgTabContent,
        },
        {
            id: 'sample-bg',
            content: 'Sample background',
            component: sampleBgTabContent,
        }
    ]

    const onCheckMockup = (event, mockupIndex) => {
        if (event.target.checked) {
            setMockupToChangeIndexes([...mockupToChangeIndexes, mockupIndex])
        } else {
            mockupToChangeIndexes.length > 1 && setMockupToChangeIndexes(mockupToChangeIndexes.filter(e => e !== mockupIndex))
        }
    }

    const onCheckAllMockup = (event) => {
        const tmpMockupIndexes = userProduct.previews.map((i, idx) => idx)
        if (event.target.checked) {
            setMockupToChangeIndexes(tmpMockupIndexes)
        } else {
            // setMockupToChangeIndexes([])
        }
    }

    return (
        <div className={'bg-customization-modal'}>
            <div onClick={onOpenMockupCustomize}>Change background</div>
            <Modal
                open={modalActive}
                onClose={toggleModalActive}
                title="Change mockup background"
                primaryAction={{
                    content: 'Apply',
                    onAction: updateBackground,
                    disabled: bgLoading
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: toggleModalActive,
                    },
                ]}
                large={true}
            >
                <Modal.Section>
                    <div className={"row bg-customization-modal-body"}>
                        <div className="col-lg-7 pr-0"
                             style={{minHeight: MODAL_COL_5_SIZE - 20}}
                            // style={{borderRight: "1px solid #e2e2e2"}}
                        >
                            <div className={"mb-3"}>
                                <Stack>
                                    <Stack.Item fill>
                                        Choose mockup to change
                                    </Stack.Item>
                                    <Stack.Item>
                                        <Checkbox checked={mockupToChangeIndexes.length === userProduct.previews.length}
                                                  disabled={mockupToChangeIndexes.length === userProduct.previews.length}
                                                  onChange={onCheckAllMockup}>Select all</Checkbox>
                                    </Stack.Item>
                                </Stack>
                                <div className={"mt-2"}>
                                    {
                                        userProduct.previews.map((i, idx) => {
                                            return (
                                                <span key={idx} className={"mr-4"}>
                                                    <Checkbox checked={mockupToChangeIndexes.includes(idx)}
                                                              onChange={(e) => onCheckMockup(e, idx)}>
                                                        <img src={i.original} alt={i.original} width={40}
                                                             style={{borderRadius: 4}}/>
                                                    </Checkbox>
                                                </span>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                                <div className={'mt-4'}>
                                    {tabs[selectedTab].component}
                                </div>
                            </Tabs>
                        </div>
                        <div className={"col-lg-5"} id={'bg-mockup-area'}>
                            {!bgLoading && (
                                <div className="w-100 d-flex flex-column position-relative">
                                    <div
                                        className={`arrow arrow-left ${bgMockupURLs.length < 2 ? "d-none" : ""}`}
                                        onClick={() => {
                                            carousel.current.prev()
                                        }}
                                    >
                                        <Icon source={ChevronLeftMinor} color="indigoDark"/>
                                    </div>
                                    <div
                                        className={`arrow arrow-right ${bgMockupURLs.length < 2 ? "d-none" : ""}`}
                                        onClick={() => {
                                            carousel.current.next()
                                        }}
                                    >
                                        <Icon source={ChevronRightMinor} color="indigoDark"/>
                                    </div>
                                    <Carousel ref={carousel} autoplay={false} dots={true} arrows={false}>
                                        {
                                            bgMockupURLs.map((image, index) => (
                                                <img src={image.mockup_url} alt={image} key={index}/>
                                            ))
                                        }
                                    </Carousel>
                                </div>
                            )
                            }
                            {bgLoading && renderLoading()}
                        </div>
                    </div>
                </Modal.Section>
            </Modal>
        </div>
    )
}
export default BackgroundCustomizationModal