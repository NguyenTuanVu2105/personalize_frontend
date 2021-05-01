import {Button, Modal, TextContainer} from "@shopify/polaris"
import React, {useCallback, useState} from "react"
import {deleteShopifyUserProduct} from "../../../../services/api/seller"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons"
import {Button as AntButton, notification} from 'antd'

const LIST_TYPE = "list"
const DETAIL_TYPE = "detail"

export const DeleteProductButton = ({isActive, shopUserProducts, userProductId, refresh,userProductName, type = DETAIL_TYPE, params}) => {
    const [confirmModalActive, setConfirmModalActive] = useState(false)
    const [buttonLoading, setButtonLoading] = useState(false)

    const handleConfirmModalChange = useCallback(() => setConfirmModalActive(!confirmModalActive), [confirmModalActive])

    const shopUserproductList = shopUserProducts.map((shopUserProduct) => shopUserProduct.id)

    // const disableDeleteButton = shopUserProducts.filter((shopUserProduct) => shopUserProduct.sync_status === "synced").length === 0

    const onSubmitDelete = async () => {
        setButtonLoading(true)
        const reqData = {
            "shopUserProductIds": shopUserproductList,
            "deepDelete": true
        }

        const {success, data} = await deleteShopifyUserProduct(reqData, userProductId)
        if (success && data.is_active === false && data.success) {
            setButtonLoading(false)
            setConfirmModalActive(false)
            notification.success({
                message: 'Success',
                description:
                    `Remove product ${userProductName} successfully in Printholo. Maybe product not deleted in Shopify because product not synced.`,
            })
            refresh()
        }
        if (type === DETAIL_TYPE) {
            refresh()
        }
    }
    const disabled = !(shopUserproductList.length === 0) && !shopUserProducts.find(x => !(x.sync_status === "deleted" || x.sync_status === "deleting"))

    // if(userProductId === 12079085194309) {
    //     console.log("shopUserproductList", shopUserproductList.length === 0)
    //     console.log("disabled", disabled)
    // }

    return (
        <span style={{padding: "0 2px"}}>
            {isActive && type === DETAIL_TYPE && <Button destructive onClick={handleConfirmModalChange}>Delete</Button>}
            {isActive && type === LIST_TYPE &&
            <AntButton onClick={handleConfirmModalChange}
                       className="ant-dropdown-link text-danger"
                       href="#"
                       type="link"
                       disabled={disabled}
            >
                <FontAwesomeIcon icon={faTrashAlt} style={disabled ? {color: "#cdcdcd", cursor: "not-allowed"} : {}}/>
            </AntButton>}
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
                            Please click "Delete" button to delete all Shopify product that link to this product
                        </p>
                    </TextContainer>
                </Modal.Section>
            </Modal>
            {/*<Modal*/}
            {/*    open={resultModalActive}*/}
            {/*    onClose={handleResultModalChange}*/}
            {/*    title="Product delete results"*/}
            {/*    primaryAction={{*/}
            {/*        content: 'OK',*/}
            {/*        onAction: type === LIST_TYPE ? onListModalOkClick : handleResultModalChange,*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <Modal.Section>*/}
            {/*        <Stack alignment={"center"}>*/}
            {/*            <Stack.Item fill>*/}
            {/*                <Heading>PrintHolo</Heading>*/}
            {/*            </Stack.Item>*/}
            {/*            <Stack.Item>*/}
            {/*                {*/}
            {/*                    systemResult.delete_result ? (*/}
            {/*                        <Badge status="success" progress="complete">Success</Badge>*/}
            {/*                    ) : (*/}
            {/*                        <Badge status="new" progress="complete">Failed</Badge>*/}
            {/*                    )*/}
            {/*                }*/}
            {/*            </Stack.Item>*/}
            {/*        </Stack>*/}
            {/*        <Stack>*/}
            {/*            <Stack.Item>*/}
            {/*                <Caption>{systemResult.message}</Caption>*/}
            {/*            </Stack.Item>*/}
            {/*        </Stack>*/}
            {/*    </Modal.Section>*/}
            {/*    {*/}
            {/*        shopsResult.length > 0 && shopsResult.map((shopResult, index) => (*/}
            {/*            <Modal.Section key={index}>*/}
            {/*                <Stack alignment={"center"}>*/}
            {/*                    <Stack.Item fill>*/}
            {/*                        <Heading>{shopResult.shop_name}</Heading>*/}
            {/*                    </Stack.Item>*/}
            {/*                    <Stack.Item>*/}
            {/*                        {*/}
            {/*                            shopResult.delete_result ? (*/}
            {/*                                <Badge status="success" progress="complete">Success</Badge>*/}
            {/*                            ) : (*/}
            {/*                                <Badge status="new" progress="complete">Failed</Badge>*/}
            {/*                            )*/}
            {/*                        }*/}
            {/*                    </Stack.Item>*/}
            {/*                </Stack>*/}
            {/*                <Stack>*/}
            {/*                    <Stack.Item>*/}
            {/*                        <Caption>{shopResult.message}</Caption>*/}
            {/*                    </Stack.Item>*/}
            {/*                </Stack>*/}
            {/*            </Modal.Section>*/}
            {/*        ))*/}
            {/*    }*/}
            {/*</Modal>*/}
        </span>
    )
}