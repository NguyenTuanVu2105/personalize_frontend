import React, {useState} from 'react'
import {Badge, Button, Card, TextContainer, Tooltip} from '@shopify/polaris'
import _ from 'lodash'
import {Col, Popover, Row} from 'antd'
import ColorSelectorUpdate from './ColorSelectorUpdate'
import {getAbstractProductVariant} from '../../../../services/api/products'
import {faEdit} from "@fortawesome/free-regular-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"

const AttributesList = (props) => {
    const {attributes, product, submitColor} = props

    const colorAttributes = product.child_attributes_data.find(attribute => attribute.name.toLowerCase().includes('color'))

    const [visible, setVisible] = useState(false)

    let _color = []

    _.forEach(attributes, (att, key) => {
        if (key.toLowerCase().includes('color'))
            _color = att.map(c => c.id)
    })
    const [colors, setColors] = useState(_color)
    const [loading, setLoading] = useState(false)

    let variantCount = 1
    _.forEach(attributes, (att, key) => {
        if (!key.toLowerCase().includes('color')) variantCount *= (att.length)
    })

    const saveAttributes = () => {
        setVisible(false)

        let newAttributes = {}

        newAttributes['Color'] = colors

        _.forEach(attributes, (att, key) => {
            if (!key.toLowerCase().includes('color')) newAttributes[key] = att.map(a => a.id)
        })

        updateAttributes(newAttributes)
    }

    const updateAttributes = async (selectedAttributes) => {
        setLoading(true)
        let prices = {}
        let size = []
        product.user_product_variant_set.forEach(variant => {
            variant.abstract_variant.attributes_value.forEach(att => {
                if (att.attribute_name === 'Size') {
                    if (!size.includes(att.label)) {
                        size.push(att.label)
                        prices[att.label] = variant.prices
                    }
                }
            })
        })
        const abstractVariants = (await getAbstractProductVariant(product.abstract_product.id)).data
        const selectedAttributeValues = Object.values(selectedAttributes).reduce((result, values) => result.concat(values), [])
        const selectedAttributeValueIndexes = {}
        const selectedAttributeValueLength = selectedAttributeValues.length
        Object.values(selectedAttributes).forEach((values, attrIndex) => {
            const boost = Math.pow(selectedAttributeValueLength, attrIndex)
            values.forEach((value, valueIndex) => {
                // console.log(value, valueIndex, boost, valueIndex * boost)
                selectedAttributeValueIndexes[value] = valueIndex * boost
            })
        })
        const attributeCount = abstractVariants.child_attributes.length
        const rawVariants = abstractVariants.abstract_product_variants
        let variants = rawVariants.filter((variant) => {
            return (variant.attributes_value.length === attributeCount
                && variant.attributes_value.every(va => selectedAttributeValues.includes(va.id))
            )
        })
        let     productVariants = []
        variants.forEach(variant => {
            let check = false
            product.user_product_variant_set.forEach((set) => {
                if (set.abstract_variant.id === variant.id) {
                    productVariants.push(set)
                    check = true
                }
            })
            let _price
            variant.attributes_value.forEach(att => {
                if (att.attribute_name === 'Size') {
                    _price = prices[att.label]
                }
            })
            if (!check) productVariants.push({
                abstract_variant: variant,
                prices: _price,
                mockup_per_side: product.user_product_variant_set[0].mockup_per_side,
                base_cost: variant.base_cost,
                sku: 'Will be auto generated!'
            })
        })
        variants = productVariants.map(variant => ({
            ...variant,
            orderIndex: variant.abstract_variant.attributes_value.reduce((result, v) => result + selectedAttributeValueIndexes[v.id], 0)
        }))
        variants.sort((variant1, variant2) => variant1.orderIndex - variant2.orderIndex)
        // console.log(variants[0], product.user_product_variant_set[0])
        product.user_product_variant_set = variants
        submitColor(product)
        setLoading(false)
    }

    const onVisibleChange = (visible) => {
        setVisible(visible)
        if (!visible) setColors(_color)
    }

    const titleCard = (text, len) => {
        return (<div style={{paddingTop: '-5px'}}>
            {text} &nbsp;
            <Badge status='info'>{len}</Badge>
        </div>)
    }

    const titlePopover = (
        <Row style={{padding: '5px 0'}}>
            <Col span={8}>
                <div style={{paddingTop: '5px', fontSize: '1.5rem'}}>Colors</div>
            </Col>
            <Col span={8} offset={8}>
                <Button onClick={saveAttributes} primary disabled={colors.length === 0} loading={loading}>Save</Button>
            </Col>
        </Row>
    )

    return (
        <div className="product-detail-attributes-list"
             style={{margin: '1.5rem auto'}}>
            <Card>
                <Card.Header title="Attributes">

                </Card.Header>
                <Card.Section>
                    <TextContainer>
                        Products Attributes
                    </TextContainer>
                </Card.Section>
                {
                    _.map(attributes, (att, key) => {
                        if (key.toLowerCase().includes('color')) {
                            return (
                                <Card.Section key={key}
                                              title={titleCard(key, att.length)}
                                              actions={[
                                                  {
                                                      content: (
                                                          <div style={{marginTop: '-10px'}}>
                                                              <Popover overlayStyle={{width: '250px'}}
                                                                       content={<ColorSelectorUpdate
                                                                           variantCount={variantCount}
                                                                           colors={colors}
                                                                           colorAttributes={colorAttributes}
                                                                           setColors={setColors}/>}
                                                                       title={titlePopover}
                                                                       trigger='click'
                                                                       visible={visible}
                                                                       onVisibleChange={onVisibleChange}>
                                                                  {/*<Button primary disabled={visible}>Edit</Button>*/}
                                                                  <div>
                                                                      <FontAwesomeIcon style={{fontSize: '1.4rem'}}
                                                                                       icon={faEdit}/>&nbsp;Edit
                                                                  </div>
                                                              </Popover>
                                                          </div>
                                                      )
                                                  }
                                              ]}>
                                    <div className="flex-start">
                                        {att.map(a => {
                                            return (
                                                <Tooltip content={a.label} key={a.value} mouseLeaveDelay={0}>
                                                    <div className="color-box"
                                                         style={{backgroundColor: a.value}}>
                                                    </div>
                                                </Tooltip>
                                            )
                                        })
                                        }
                                    </div>
                                </Card.Section>
                            )
                        } else {
                            return (<Card.Section title={titleCard(key, att.length)} key={key}>
                                {att.map((a) => a.label).join(", ")}
                            </Card.Section>)
                        }
                    })
                }

                {/*<ul style={{listStyleType: 'none', paddingLeft: '0'}}>*/}
                {/*{*/}
                {/*_.map(attributes, (att, key) => {*/}
                {/*if (key.toLowerCase().includes('color')) {*/}
                {/*return (*/}
                {/*<li key={key}>*/}
                {/*<div className="flex-start">*/}
                {/*{att.map(a => {*/}
                {/*return (*/}
                {/*<div key={a.value} className="color-box"*/}
                {/*style={{backgroundColor: a.value}}>*/}
                {/*</div>*/}
                {/*)*/}
                {/*})*/}
                {/*}*/}
                {/*</div>*/}
                {/*</li>*/}
                {/*)*/}
                {/*} else {*/}
                {/*return (<li key={key}>{key}: {att.map((a) => a.label).toString()}</li>)*/}
                {/*}*/}
                {/*})*/}
                {/*}*/}
                {/*</ul>*/}
            </Card>
        </div>
    )
}

export default AttributesList
