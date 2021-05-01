import React, {useState} from "react"
import {Modal} from "@shopify/polaris"
import PropTypes from "prop-types"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons"
import {Button} from "antd"
import ProductDesignTemplate from "../../../product-info/ProductDesignTemplate"

const Guidelines = (props) => {
    const {abstract} = props
    // const {costDetails, shippingCosts, productionStatistic} = useContext(NewProductContext)
    const [visible, setVisible] = useState(false)
    const handleCloseModal = () => {
        setVisible(false)
    }

    // const [selectedTab, setSelectedTab] = useState(0)

    // const handleTabChange = (selectedTabIndex) => setSelectedTab(selectedTabIndex)

    // const statistic = productionStatistic.find(item => item.sku && item.production_time_default > 0.0 && item.sku.includes(abstract.sku))

    // const tabs = [
    //     {
    //         id: 'design-templates',
    //         content: 'Design templates',
    //         panelID: 'design-templates',
    //         component: (<ProductDesignTemplate productMeta={abstract.meta}/>)
    //     },
    //     {
    //         id: 'product-detail',
    //         content: 'Product details',
    //         panelID: 'description',
    //         component: (
    //             <div>
    //                 <ProductDescriptionOverView
    //                     productAttributes={abstract.child_attributes}
    //                     productMeta={abstract.meta}
    //                 />
    //                 <div className="w-100" style={{height: 50}}/>
    //                 <ProductProcessAndShipping
    //                     productAttributes={abstract.child_attributes}
    //                     productMeta={abstract.meta}
    //                     shippingCosts={shippingCosts}
    //                     statistic={statistic}
    //                     costDetails={costDetails}
    //                     abstractVariants={abstract.abstract_product_variants}
    //                 />
    //             </div>
    //         )
    //     },
    // ]

    return (
        <div>
            <Button
                onClick={() => setVisible(true)}
                type={"link"}
                className="p-0"
                size={"small"}
                style={{minHeight: "unset", fontSize: 15}}
            >
                <span
                    className="mr-2 mt-1"
                    style={{
                        fontWeight: "bold",
                        color: "#3f4eae"
                    }}
                >
                    Guidelines
                </span>
                <FontAwesomeIcon className="mt-0" icon={faExternalLinkAlt} color={"#3f4eae"}/>
            </Button>
            <Modal
                open={visible}
                title={abstract.title}
                sectioned={true}
                large={true}
                onClose={handleCloseModal}
                secondaryActions={[
                    {
                        content: "Close",
                        onAction: handleCloseModal
                    }
                ]}
            >
                <div className={'product-info-tab-section'}>
                    <ProductDesignTemplate productMeta={abstract.meta}/>
                </div>
            </Modal>
        </div>
    )
}

Guidelines.propTypes = {
    abstract: PropTypes.any.isRequired
}

export default Guidelines