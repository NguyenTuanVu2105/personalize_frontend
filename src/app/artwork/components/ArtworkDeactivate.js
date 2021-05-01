import React, {useState} from 'react'
import './ArtworkAction.scss'
import {Button, notification} from 'antd'
import {artworkActivate, artworkDeactivate} from '../../../services/api/artworkUpdate'
import {Modal, Tooltip} from '@shopify/polaris'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBan, faRedo} from '@fortawesome/free-solid-svg-icons'
import {ARTWORK_STATUS_CODES} from "../constants/artworkStatuses"

const ArtworkDeactivate = (props) => {
    const {reloadData, onUpdate} = props
    const [visibleDelete, setVisibleDelete] = useState(false)
    const {id, status} = props.artwork
    const [loading, setLoading] = useState(false)

    const showArtworkDelete = () => {
        setVisibleDelete(true)
    }

    const deactivateArtwork = async () => {
        setLoading(true)
        const {success, data} = await artworkDeactivate(id)
        if (success && data.success) {
            notification.success({
                message: data.message || "Deactivate artwork successfully",
            })
            reloadData()
            setVisibleDelete(false)
        } else {
            notification.error({
                message: data.message,
            })
        }
        setLoading(false)
    }

    const activeArtwork = async () => {
        setLoading(true)
        const {success, data} = await artworkActivate(id)
        if (success && data.success) {
            notification.success({
                message: 'Activate artwork successfully',
            })
            reloadData()
        } else {
            notification.error({
                message: 'An error occurred, please try again',
            })
        }
        onUpdate(false)
        setLoading(false)
    }

    return (
        <div>
            <div>
                {
                    status === ARTWORK_STATUS_CODES.ACTIVE ? (
                        <Tooltip content="Deactivate">
                            <Button className="ant-dropdown-link"
                                    onClick={showArtworkDelete}
                                    type="link" >
                                <FontAwesomeIcon icon={faBan}/>
                            </Button>
                        </Tooltip>
                    ) : status === ARTWORK_STATUS_CODES.INACTIVE ? (
                        <Tooltip content="Activate">
                            <Button className="ant-dropdown-link"
                                    onClick={activeArtwork}
                                    type="link"
                                    loading={loading}>
                                <FontAwesomeIcon icon={faRedo}/>
                            </Button>
                        </Tooltip>
                    ) : <></>
                }
            </div>

            <Modal
                open={visibleDelete}
                onClose={() => {
                    setVisibleDelete(false)
                }}
                title="Deactivate Artwork"
                primaryAction={{
                    content: 'Deactivate',
                    onAction: deactivateArtwork,
                    loading: loading
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => {
                            setVisibleDelete(false)
                        },
                    },
                ]}

            >
                <Modal.Section>
                    <p>Are you sure to deactivate this artwork?</p>
                </Modal.Section>
            </Modal>
        </div>
    )
}

export default ArtworkDeactivate
