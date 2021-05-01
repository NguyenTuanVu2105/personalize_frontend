import React, {useState} from "react"
import {Table} from "antd"
import {getAttributeColumn} from "../../../pricing/columns/AttributeColumn"
import {Card} from "@shopify/polaris"
import {numberFormatCurrency} from "../../../shared/FormatNumber"

const VariantsTable = ({child_attributes, variants}) => {

    const [filters, setFilter] = useState([])

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
                    Cost per item &nbsp;
                </div>
            ),
            dataIndex: 'id',
            align: 'right',
            render: (id, record) => {
                return (
                    <div>
                        {record.cost && numberFormatCurrency(record.cost)}
                    </div>
                )
            }
        }
    ]

    const dataSource = variants.map(it => {
        const attributes_value = it.attributeValues ? it.attributeValues : it.attributes_value
        return {
            ...it,
            attributes_value: attributes_value,
            abstract: {
                ...it,
                attributes_value: attributes_value.map(attr => all_child_attributes.find(item => item.id === attr))
            }
        }
    })

    return (
        <div className={'mt-4 shopifilize-card'}>
            <Card sectioned title={"Production cost"}>
                <div className={'shopifilize-table'}>
                    <span id="hiddenField" style={{position: "absolute", zIndex: -2}}/>
                    <Table
                        rowKey={variant => variant.id}
                        dataSource={dataSource}
                        columns={_columns}
                        onChange={(pagination, filters) => setFilter(filters)}
                    />
                </div>
            </Card>
        </div>
    )
}

export default VariantsTable