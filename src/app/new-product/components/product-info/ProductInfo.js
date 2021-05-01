import React, {useContext, useEffect, useState} from 'react'
import '../design/components/product-info-view/ProductInfo.scss'
import {Modal, Tabs} from "@shopify/polaris"
import {Empty} from "antd"
import {getAProduct} from "../../../../services/api/products"
import ProductDescriptionOverView from "./ProductDescriptionOverView"
import NewProductContext from "../../context/NewProductContext"
import ProductProcessAndShipping from "./ProductProcessAndShipping"
import ProductDesignTemplate from "./ProductDesignTemplate"

const ProductInfo = ({handleClose, handleDesign, productID, productTitle, productionStatistic}) => {
    const [selectedTab, setSelectedTab] = useState(0)
    const {shippingCosts, costDetails, fetchCost} = useContext(NewProductContext)
    const [abstractVariants, setAbstractVariants] = useState([])
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(productTitle)
    const [productMeta, setProductMeta] = useState(null)
    const [productAttributes, setProductAttributes] = useState(null)
    const [productSKU, setProductSKU] = useState(null)
    const [dataSuccess, setDataSuccess] = useState(false)

    const handleTabChange = (selectedTabIndex) => setSelectedTab(selectedTabIndex)


    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown, false);
        fetchDetail().then(() => fetchCost(productID))
        return () => {
            document.removeEventListener("keydown", handleKeyDown, false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchDetail = async () => {
        setLoading(true)
        setDataSuccess(false)
        const response = await getAProduct(productID)
        if (response.success) {
            setTitle(response.data.title)
            setProductMeta(response.data.meta)
            setProductAttributes(response.data.child_attributes)
            setProductSKU(response.data.sku)
            setAbstractVariants(response.data.abstract_product_variants)
            setDataSuccess(true)
        }
        setLoading(false)
    }

    const statistic = productionStatistic.find(item => item.sku && item.production_time_default > 0.0 && item.sku.includes(productSKU))


    const handleKeyDown = (e) => {
        e.stopPropagation()
        const nextArrow = document.querySelector(".mockup-sample-container .arrow.arrow-right")
        const backArrow = document.querySelector(".mockup-sample-container .arrow.arrow-left")
        const productInfoDetailSection = document.querySelector(".product-info-detail-section")
        if (productInfoDetailSection) {
            if (e.keyCode === 37) {
                if (backArrow) {
                    backArrow.click()
                }
            } else if (e.keyCode === 39) {
                if (nextArrow) {
                    nextArrow.click()
                }
            }
        }
    }

    const tabs = [
        {
            id: 'processing-shipping',
            content: 'Processing and shipping',
            panelID: 'processing-shipping',
            component: (
                <ProductProcessAndShipping
                    productAttributes={productAttributes}
                    productMeta={productMeta}
                    abstractVariants={abstractVariants}
                    shippingCosts={shippingCosts}
                    statistic={statistic}
                    costDetails={costDetails}
                />
            )
        },
        {
            id: 'design-templates',
            content: 'Design templates',
            panelID: 'design-templates',
            component: (
                <ProductDesignTemplate productMeta={productMeta}/>
            )

        },
    ]

    return (
        <div className={'product-info-modal'}>
            <Modal open={true}
                   onClose={handleClose}
                   title={title}
                   loading={loading}
                   secondaryActions={[{
                       content: 'Start designing',
                       onAction: handleDesign,
                       primary: true
                   }]}
                   large
            >
                {dataSuccess && (
                    <div>
                        <Modal.Section>
                            <ProductDescriptionOverView productMeta={productMeta}
                                                        productAttributes={productAttributes}/>
                        </Modal.Section>
                        <div className={'product-info-tab-section'}>
                            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                                <Modal.Section>
                                    {tabs[selectedTab].component}
                                </Modal.Section>
                            </Tabs>
                        </div>
                    </div>
                )}
                {
                    !dataSuccess && (
                        <Empty
                            className="p-5"
                            description={"Can't load data"}
                        />
                    )
                }
            </Modal>
        </div>
    )
}

export default ProductInfo
