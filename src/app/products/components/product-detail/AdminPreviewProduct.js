import React, {useCallback, useState} from 'react'
import {getProductAdminInShopUrl, getProductPreviewInShopUrl} from '../../helpers/ProductHelper'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt, faEye, faTrashAlt} from '@fortawesome/free-solid-svg-icons'
import {Button, Link, Modal, TextContainer} from "@shopify/polaris"
import {deleteShopifyUserProduct} from "../../../../services/api/seller"
import {notification} from "antd"

const AdminPreviewProduct = (props) => {
    const [confirmModalActive, setConfirmModalActive] = useState(false)
    const [buttonLoading, setButtonLoading] = useState(false)
    const handleConfirmModalChange = useCallback(() => setConfirmModalActive(!confirmModalActive), [confirmModalActive])

    const {product} = props

    const onSubmitDelete = async () => {
        setButtonLoading(true)
        const reqData = {
            "shopUserProductIds": [props.shopUserProductId],
            "deepDelete": false
        }
        // console.log(reqData)

        const {success, data} = await deleteShopifyUserProduct(reqData, props.userProductId)
        // console.log(success, data)
        if (success && data.is_active === false && data.success) {
            setButtonLoading(false)
            setConfirmModalActive(false)
            notification.success({
                message: 'Success',
                description:
                    `Remove product from store ${product.shop.name} successfilly`,
            })
            props.refresh()
        }
        else {
            setButtonLoading(false)
            setConfirmModalActive(false)
            notification.error({
                message: 'Error',
                description:
                    `An error occurs. Please try again!`,

            })
        }
    }

    return (<div>
        <span className='mr-4 text-nowrap'>
            <Link url={getProductAdminInShopUrl(product.shop.url, product.product_id)}
                  external>
                <FontAwesomeIcon icon={faExternalLinkAlt}/>&nbsp;Admin View
            </Link>
        </span>
        <span className='mr-4 text-nowrap'>
            <Link url={getProductPreviewInShopUrl(product.shop.url, product.handle)} external>
                <FontAwesomeIcon icon={faEye}/>&nbsp;Preview
            </Link>
        </span>
        <span className='text-right text-nowrap'>
             <Button plain destructive onClick={handleConfirmModalChange}>
                <FontAwesomeIcon icon={faTrashAlt}/>&nbsp;Remove
             </Button>
        </span>
        <div>
            <Modal
                open={confirmModalActive}
                onClose={handleConfirmModalChange}
                title="Confirm to delete"
                primaryAction={{
                    content: 'Delete',
                    onAction: onSubmitDelete,
                    loading: buttonLoading,
                    destructive: true
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleConfirmModalChange,
                    },
                ]}
            >
                <Modal.Section>
                    <TextContainer>
                        <p>
                            Please click "Delete" button to delete product on  store <strong>{product.shop.name}</strong> that link to this product
                        </p>
                    </TextContainer>
                </Modal.Section>
            </Modal>
        </div>
    </div>)
}

export default AdminPreviewProduct