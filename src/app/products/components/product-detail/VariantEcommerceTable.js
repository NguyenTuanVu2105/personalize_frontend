import React, {useState} from 'react'
import {Avatar, Table} from 'antd'
// import _ from 'lodash'
// import {numberFormatCurrency} from '../../../shared/FormatNumber'
import {Badge, Card, Stack} from '@shopify/polaris'
import EcommerceVariantMapping from "./variant-ecomerce-table/EcommerceVariantMapping"
import EcomerceChooseVariantMapping from "./variant-ecomerce-table/EcomerceChooseVariantMapping"
// import {getAttributeColumn} from '../../../pricing/columns/AttributeColumn'
// import {faEdit} from "@fortawesome/free-regular-svg-icons"
// import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"


const VariantEcommerceTable = function (props) {
    const {productVariants, child_attributes, fetchData} = props
    // console.log(child_attributes)
    const [, setFilter] = useState([])

    // let attribute_list = {}

    // productVariants.forEach((item) => {
    //     item.abstract_variant.attributes_value.forEach((it) => {
    //         attribute_list[it.attribute_name] = []
    //     })
    // })

    // productVariants.forEach((item) => {
    //     item.abstract_variant.attributes_value.forEach((it) => {
    //         attribute_list[it.attribute_name].push(it.id)
    //     })
    // })

    // _.map(attribute_list, (att, key) => { attribute_list[key] =  _.uniq(att)})

    // const currencies = _.uniqWith(shops.map(s => s.currency), _.isEqual)

    // const [currency, setCurrency] = useState(currencies[0])

    // const attributesColumns = child_attributes.map((attribute) => getAttributeColumn({attributes: attribute_list}, attribute, filters))

    const _columns = [
        {
            title: '',
            dataIndex: 'preview_image',
            width: 110,
            key: 'preview_image',
            render: (image, record) => {
                if (record.variant_meta.image) {
                    return (<img src={record.variant_meta.image.src} alt={record.sku} height={50}/>)
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
        {
            title: 'Mapping',
            dataIndex: 'mapping',
            key: 'mapping',
            width: 700,
            render: (index, record) => {
                const attributes = {}
                for (const attr of child_attributes) {
                    attributes[attr.name] = record.variant_meta[`option${attr.position}`]
                }
                const variant = {...record, attributes}
                if (variant.user_variant_mapping) {
                    return (
                        <EcommerceVariantMapping
                            variant={variant}
                            fetchData={fetchData}
                        >
                        </EcommerceVariantMapping>
                    )
                } else {
                    return (
                        <EcomerceChooseVariantMapping
                            variant={variant}
                            fetchData={fetchData}
                        >
                        </EcomerceChooseVariantMapping>)

                }
            }
        }
        // ...attributesColumns
        // ,
        // {
        //     title: 'Base Cost',
        //     dataIndex: 'base_cost',
        //     key: 'base_cost',
        //     align: 'right',
        //     render: (prices, record) => {
        //         return (
        //             <div>{numberFormatCurrency(record.base_cost, 'USD')}</div>
        //         )
        //     }
        // },
        // {
        //     title: 'Price',
        //     dataIndex: 'prices',
        //     key: 'price',
        //     align: 'right',
        //
        //     render: (__, record) => {
        //         let price = record.prices.find(p => p.currency === currency)
        //         return (
        //             <div>{numberFormatCurrency(price.value, currency)}</div>
        //         )
        //     }
        // }
    ]

    // const updateCurrency = (value) => {
    //     setCurrency(value)
    // }

    // const dataSource = productVariants.map(it => {
    //     return {
    //         ...it,
    //         abstract: it.abstract_variant
    //     }
    // })


    return (
        <Card title='Variants'>
            <Card.Section>
                <Stack alignment={"center"}>
                    <Stack.Item fill>
                        <span>Total: &nbsp;<Badge status="info">{productVariants.length}</Badge></span>
                    </Stack.Item>
                    {/*<Stack.Item>*/}
                    {/*<Button plain icon={<FontAwesomeIcon style={{fontSize: '1.4rem'}} icon={faEdit}/>} onClick={props.openModal}>Edit pricing</Button>*/}
                    {/*</Stack.Item>*/}
                    {/*<Stack.Item>*/}
                    {/*    <div className="">*/}
                    {/*        Select currency: &nbsp;*/}
                    {/*        <Select defaultValue={currencies[0]} style={{width: 100}}*/}
                    {/*                onChange={updateCurrency}>*/}
                    {/*            {currencies.map((c, idx) => <Select.Option value={c} key={idx}>{c}</Select.Option>)}*/}
                    {/*        </Select>*/}
                    {/*    </div>*/}
                    {/*</Stack.Item>*/}
                    {/*<Button onClick={props.openModal}>Edit pricing</Button>*/}
                </Stack>
            </Card.Section>
            <div className="product-variants-table-page">
                <Table
                    rowKey={variant => variant.id}
                    dataSource={productVariants}
                    columns={_columns}
                    onChange={(pagination, filters) => setFilter(filters)}
                />
            </div>
        </Card>
    )

}

export default VariantEcommerceTable
