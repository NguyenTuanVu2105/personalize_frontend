import React, {useContext, useState} from 'react'
import {Avatar, Select, Table} from 'antd'
import _ from 'lodash'
import {numberFormatCurrency} from '../../../shared/FormatNumber'
import {Badge, Card, Stack} from '@shopify/polaris'
import {getAttributeColumn} from '../../../pricing/columns/AttributeColumn'
import {faEdit} from "@fortawesome/free-regular-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import UserPageContext from "../../../userpage/context/UserPageContext"
import {DEFAULT_CURRENCY} from "../../../new-product/constants/constants"
import {displayCostSimple} from "../../../../shared/costDisplay"
import ShippingCostTable from "../../../pricing/ShippingCostTable"


const ProductVariantsTable = function (props) {

    const {productVariants, extra_cost, child_attributes, shops, product_preview_image_url, shippingDetail} = props

    const [filters, setFilter] = useState([])

    let attribute_list = {}

    productVariants.forEach((item) => {
        item.abstract_variant.attributes_value.forEach((it) => {
            attribute_list[it.attribute_name] = []
        })
    })

    productVariants.forEach((item) => {
        item.abstract_variant.attributes_value.forEach((it) => {
            attribute_list[it.attribute_name].push(it.id)
        })
    })

    _.map(attribute_list, (att, key) => {
        attribute_list[key] = _.uniq(att)
    })

    const currencyByVariants = _.uniq(productVariants[0].prices.map(price => price.currency))
    const currencies = shops.length > 0 ? _.uniqWith(shops.map(s => s.currency), _.isEqual) : currencyByVariants.length > 0 ? currencyByVariants : [DEFAULT_CURRENCY.currency]

    const [currency, setCurrency] = useState(currencies[0])

    const attributesColumns = child_attributes.map((attribute) => getAttributeColumn({attributes: attribute_list}, attribute, filters))

    const {scrollTable} = useContext(UserPageContext)


    const _columns = [
        {
            title: '',
            dataIndex: 'preview_image',
            width: 70,
            key: 'preview_image',
            render: (image, record) => {
                if (record.mockup_per_side && record.mockup_per_side.length > 0) {
                    return (<img src={record.mockup_per_side[0].mockup_url} alt={record.sku} height={50}/>)
                } else if (product_preview_image_url) {
                    return (<img src={product_preview_image_url} alt={record.sku} height={50}/>)
                } else {
                    return (<Avatar shape="square" size={50} icon="file-image"/>)
                }
            }

        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku'
        },
        ...attributesColumns
        ,
        {
            title: (
                // <Popover content={"Hover each cell to view production cost detail"}>
                <div className="row no-gutters flex-center text-center">
                    Cost per item &nbsp;
                    {/*<Icon type="info-circle" style={{fontSize: '1em', color: "deepskyblue"}}/>*/}
                </div>
                // </Popover>
            ),
            dataIndex: 'id',
            align: 'center',
            render: (id, record) => {
                let display = "Free"
                if (record.cost) {
                    const cost = record.cost.detail[0]
                    display = displayCostSimple(parseFloat(cost.production_cost_base) + Math.max(0, parseFloat(extra_cost)))
                }
                return (
                    // <Popover content={contentBaseCost(record.cost)} placement={"leftTop"}>
                    <b>
                        {display}
                    </b>
                    // </Popover>
                )
            }
        },
        {
            title: 'Price',
            dataIndex: 'prices',
            key: 'price',
            align: 'right',

            render: (__, record) => {
                let price = record.prices.find(p => p.currency === currency)
                return (
                    <div>{numberFormatCurrency(price.value, currency)}</div>
                )
            },
            width: "10%"
        }
    ]

    const updateCurrency = (value) => {
        setCurrency(value)
    }

    const dataSource = productVariants.map(it => {
        const attributes = it.abstract_variant.attributes_value.map(it => it.id)
        return {
            ...it,
            attributes_value: attributes,
            abstract: it.abstract_variant
        }
    })


    return (
        <div>
            <Card
                title={
                    <div className="flex-start">
                        <h2 className='Polaris-Heading'>
                            Variants
                        </h2>
                    </div>
                }

                actions={[
                    {
                        content: "Edit pricing",
                        icon: <FontAwesomeIcon style={{fontSize: '1.4rem'}} icon={faEdit}/>,
                        onAction: props.openModal,
                    }
                ]}
            >
                <Card.Section>
                    <Stack alignment={"center"}>
                        <Stack.Item fill>
                            <span>Total: &nbsp;<Badge status="info">{productVariants.length}</Badge></span>
                        </Stack.Item>
                        {/*<Stack.Item>*/}
                        {/*<Button plain icon={<FontAwesomeIcon style={{fontSize: '1.4rem'}} icon={faEdit}/>} onClick={props.openModal}>Edit pricing</Button>*/}
                        {/*</Stack.Item>*/}
                        <Stack.Item>
                            <div className="d-flex">
                                <div className="">
                                    Select currency: &nbsp;
                                    <Select defaultValue={currencies[0]} style={{width: 100}}
                                            onChange={updateCurrency}>
                                        {currencies.map((c, idx) => <Select.Option value={c}
                                                                                   key={idx}>{c}</Select.Option>)}
                                    </Select>
                                </div>
                            </div>
                        </Stack.Item>
                        {/*<Button onClick={props.openModal}>Edit pricing</Button>*/}
                    </Stack>
                </Card.Section>
                <div className="product-variants-table-page mx-4">
                    <Table
                        rowKey={variant => variant.id}
                        dataSource={dataSource}
                        columns={_columns}
                        {...scrollTable}
                        onChange={(pagination, filters) => setFilter(filters)}
                    />
                </div>
            </Card>
            {
                shippingDetail &&
                <ShippingCostTable shippingDetail={shippingDetail} variants={dataSource} child_attributes={child_attributes}/>
            }
        </div>

    )

}

export default ProductVariantsTable
