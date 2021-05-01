import React, {useCallback, useState} from 'react'
import {Card, Tabs, Tooltip} from '@shopify/polaris'
import {LightboxPreview} from "./LightboxPreview"
import "./ArtworksList.scss"
import {Avatar, Icon, Spin} from 'antd'

const CAN_PREVIEW_FUSION = false

const ArtworksList = (props) => {
    const [selected, setSelected] = useState(0)
    const [isLightboxArtworkOpen, setLightboxArtworkOpen] = useState(false)
    const [isLightboxFusionOpen, setLightboxFusionOpen] = useState(false)
    const [viewIndex, setViewIndex] = useState(0)

    const {artworks, isCombineFusionProduct} = props
    const visibleArtworks = artworks.filter(artwork => artwork.send_to_fulfill !== isCombineFusionProduct)
    const fusionArtworks = artworks.filter(artwork => artwork.send_to_fulfill === isCombineFusionProduct)

    const extractUrlList = (layers) => {
        return layers.map(layer => (layer.file_url))
    }

    const closeImageView = () => {
        setLightboxArtworkOpen(false)
    }

    const onClickArtworkImage = (index) => {
        setViewIndex(index)
        setLightboxArtworkOpen(true)
    }

    const renderFusionArtwork = (fusionItem) => {
        return (
            <div className={"col-xl-8 col-lg-12 pr-lg-0"}>
                <div className={"mb-2"}>
                    <b>Print artwork</b>
                </div>
                {
                    fusionItem.fused_artwork.image_url && CAN_PREVIEW_FUSION && (
                        <div className={"mb-3 image-preview"}
                             onClick={() => setLightboxFusionOpen(true)}>
                            <Tooltip content="Click to preview artwork">
                                <img width='100%' src={fusionItem.fused_artwork.image_url}
                                     alt={fusionItem.fused_artwork.name}
                                     style={{border: "1px solid #e8e9ea"}}/>
                            </Tooltip>
                        </div>
                    )
                }
                {
                    fusionItem.fused_artwork.image_url && !CAN_PREVIEW_FUSION && (
                        <img width='100%' src={fusionItem.fused_artwork.image_url}
                             alt={fusionItem.fused_artwork.name}
                             style={{border: "1px solid #e8e9ea"}}/>
                    )
                }
                {
                    !fusionItem.fused_artwork.image_url && <Tooltip content='Generating...'>
                        <Avatar shape="square" size={100} style={{width: "100%", backgroundColor: "#fbfbfb"}}
                                icon={<Spin indicator={<Icon type="loading" style={{fontSize: 24}} spin/>}/>}/>
                    </Tooltip>
                }
                {
                    isLightboxFusionOpen && (
                        <LightboxPreview currentIndex={0}
                                         imageList={[fusionItem.fused_artwork.image_url]}
                                         closeImageView={() => setLightboxFusionOpen(false)}/>
                    )
                }
            </div>
        )
    }

    const tabContent = (item) => {
        return (
            <div className={"row justify-content-center"}>
                {renderFusionArtwork(isCombineFusionProduct ? fusionArtworks[0] : item)}
                <div className={"col-xl-4 col-lg-12"}>
                    <div className={"mb-2"}>
                        <b>Layers</b>
                    </div>
                    {
                        item && item.fused_artwork.layers.length > 0
                        && item.fused_artwork.layers.map((artwork, index) => {
                            return artwork.file_url ? (
                                <div key={index}>
                                    <div className={"mb-3 image-preview"}
                                         onClick={() => onClickArtworkImage(index)}>
                                        <Tooltip content="Click to preview artwork">
                                            <img width='100%' src={artwork.file_url} alt={artwork.name}
                                                 style={{border: "1px solid #e8e9ea", borderRadius: "3px"}}/>
                                        </Tooltip>
                                    </div>
                                    <hr/>
                                </div>
                            ) : (
                                <div key={index}>
                                    <div className={"mb-3"}>
                                        <div>Text:</div>
                                        <strong>{artwork.text}</strong>
                                    </div>
                                    {/*<div className={"mb-3"} dangerouslySetInnerHTML={{__html:artwork.raw_svg}}/>*/}
                                    <hr/>
                                </div>
                            )
                        })
                    }
                    {
                        item && item.fused_artwork.layers.length === 0 && (
                            <div style={{textAlign: 'center', marginTop: 15}}>
                                <Icon type="picture" style={{fontSize: 34}}/>
                                <p className={"mt-3"}>No artwork for this side</p>
                            </div>
                        )
                    }
                </div>
                {isLightboxArtworkOpen && (
                    <LightboxPreview currentIndex={viewIndex}
                                     imageList={extractUrlList(item.fused_artwork.layers)}
                                     setCurrentIndex={setViewIndex}
                                     closeImageView={closeImageView}/>
                )}
            </div>
        )
    }

    const tabs = visibleArtworks.map((item, idx) => {
        return {
            id: idx,
            content: item.side.type,
            panelID: idx,
            component: tabContent(item)
        }
    })

    const handleTabChange = useCallback(
        (selectedTabIndex) => setSelected(selectedTabIndex),
        []
    )

    return (
        <div style={{margin: '1.5rem auto'}}>
            <Card title="Design">
                <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
                    <Card.Section className={"mb-4"}>{tabs[selected].component}</Card.Section>
                </Tabs>
            </Card>
        </div>
    )
}

export default ArtworksList
