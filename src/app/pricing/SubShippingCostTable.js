import React, {useState} from "react"
import {Table} from "antd"
import {getAttributeColumn} from "./columns/AttributeColumn"
import {Card} from "@shopify/polaris"
import {numberFormatCurrency} from "../shared/FormatNumber"
import {faChevronDown} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import "./SubShippingCostTable.scss"

const SubShippingCostTable = ({child_attributes, variants, shippingInfo}) => {

    const [filters, setFilter] = useState([])
    const [rowNumber, setRowNumber] = useState(5)

    let attribute_list = {}
    let all_child_attributes = []

    child_attributes.forEach((item) => {
        attribute_list[item.name] = []
        item.child_attributes_value_set.forEach(child => {
            all_child_attributes.push(child)
            attribute_list[item.name].push(child.id)
        })
    })

    const attributesColumns = child_attributes.map((attribute) => getAttributeColumn({attributes: attribute_list}, attribute, filters))

    const displayCost = (number) => {
        if (parseFloat(number) === 0) {
            return "Free"
        } else {
            return numberFormatCurrency(number)
        }
    }

    const _columns = [
        {
            title: "SKU",
            dataIndex: "sku",
            render: (sku) => sku
        },
        ...attributesColumns,
        {
            title: (
                <div className="row no-gutters flex-center text-center">
                    Base shipping cost
                </div>
            ),
            dataIndex: 'base_cost',
            render: (text, record) => {
                const detail = record.shipping.find(i => {
                    return shippingInfo.zone.id === i.shipping_zone && shippingInfo.rate.id === i.shipping_rate
                })
                if (detail) {
                    return (
                        <div>
                            {displayCost(detail.shipping_cost_base)}
                        </div>
                    )
                } else {
                    return ""
                }
            }
        },
        {
            title: (
                <div className="row no-gutters flex-center text-center">
                    Additional shipping cost
                </div>
            ),
            dataIndex: 'additional_cost',
            render: (text, record) => {
                const detail = record.shipping.find(i => {
                    return shippingInfo.zone.id === i.shipping_zone && shippingInfo.rate.id === i.shipping_rate
                })
                if (detail) {
                    return (
                        <div>
                            {displayCost(detail.shipping_cost_additional)}
                        </div>
                    )
                } else {
                    return ""
                }
            }
        }
    ]

    const totalSource = variants.map(it => {
        return {
            ...it,
            abstract: {
                ...it,
                attributes_value: it.attributes_value.map(attr => all_child_attributes.find(item => item.id === attr))
            }
        }
    })

    const dataSource = totalSource.slice(0, rowNumber)

    const increaseRecordDisplay = () => {
        if (rowNumber < variants.length){
            setRowNumber(rowNumber + 5)
        }
    }

    const moreAttributeTable = () => {
        if (rowNumber < variants.length) {
            return {
                footer: () => (
                    <div className="text-center" style={{cursor: "pointer"}} onClick={increaseRecordDisplay}>
                        <span>More</span><FontAwesomeIcon className="ml-4" icon={faChevronDown}/>
                    </div>
                )
            }
        } else {
            return {}
        }
    }

    return (
        <div className={'mt-4 shopifilize-card'}>
            <Card sectioned>
                <div className={'shopifilize-table'}>
                    <span id="hiddenField" style={{position: "absolute", zIndex: -2}}/>
                    <Table
                        className="sub-shipping-cost-table"
                        rowKey={variant => variant.id}
                        dataSource={dataSource}
                        columns={_columns}
                        onChange={(pagination: false, filters) => setFilter(filters)}
                        pagination={false}
                        {...moreAttributeTable()}
                    />
                </div>
            </Card>
        </div>
    )
}

export default SubShippingCostTable