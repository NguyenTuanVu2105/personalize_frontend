import React, {useEffect, useState} from 'react'
import {Col, Row} from "antd"
import {Button, Heading, TextField, Tooltip} from "@shopify/polaris"
import {numberFormatCurrency} from "../../shared/FormatNumber"
import "./OrderItem.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons"


const OrderItem = (props) => {
    const {
        id,
        title,
        preview,
        cost,
        exactlyPrice,
        attributeValues,
        quantity,
        onChangeQuantity,
        isLastItem,
        onRemoveItem,
        additionalCost
    } = props

    const [quantityValue, setQuantityValue] = useState("1")
    const handleChangeQuantity = (newValue) => {
        if (newValue > 0) {
            setQuantityValue(newValue)
            onChangeQuantity(id, newValue)
        }
    }

    useEffect(() => {
        setQuantityValue(quantity.toString())
    }, [quantity])

    const onClickRemove = (id) => {
        onRemoveItem(id)
    }

    const renderOriginalCost = () => {
        if (exactlyPrice) {
            return numberFormatCurrency(exactlyPrice)
        } else {
            const formattedCost = numberFormatCurrency(cost)
            return `${formattedCost}`
        }
    }

    const renderCost = () => {
        if (exactlyPrice) {
            return numberFormatCurrency(exactlyPrice * quantityValue)
        } else {
            return additionalCost === cost ? numberFormatCurrency(cost * quantityValue) : numberFormatCurrency(cost + additionalCost * (quantity - 1))
        }
    }

    const variantTitle = attributeValues.map(attribute_value => attribute_value.label).join(" / ")

    // TODO handle grid here
    return (
        <div>
            <Row className="order-item">
                <Col span={2} className={"text-left pr-4"}>
                    <img src={preview} alt={`${variantTitle}'s preview`} className={"img-thumbnail w-100"}/>
                </Col>
                <Col span={10}>
                    <Row>
                        <Heading>{title}</Heading>
                        {/*<React.Fragment>*/}
                        {/*    <Link url={Paths.ProductDetail(userProduct)} external>{title}</Link>*/}
                        {/*</React.Fragment>*/}
                    </Row>
                    <Row>
                        {variantTitle}
                    </Row>
                </Col>
                <Col span={4} className='text-right pr-4 text-nowrap'>
                    <span>
                        {/*<b>{renderOriginalCost()}</b>*/}
                        {
                            additionalCost !== cost && (
                                <Tooltip content={`${numberFormatCurrency(additionalCost)} for seconds item onwards`}>
                                    <b>{renderOriginalCost()} <span className={"text-danger"}>*</span></b>
                                </Tooltip>
                            )
                        }
                        {
                            additionalCost === cost && (
                                <b>{renderOriginalCost()}</b>
                            )
                        }
                    </span>
                    &nbsp; x &nbsp;
                </Col>
                <Col span={3}>
                    <TextField labelHidden type={"number"} value={quantityValue} onChange={handleChangeQuantity}
                               label={"quantity"}/>
                </Col>
                <Col span={3} className={"text-right"}>
                    <b>{renderCost()}</b>
                </Col>
                <Col span={2} className={"text-center"}>
                    <Tooltip content={"Remove item"}>
                        <Button onClick={() => onClickRemove(id)} plain icon={
                            <FontAwesomeIcon className={"next-icon"} style={{fontSize: "18px"}}
                                             icon={faTrashAlt}
                                             color={'#ed4f7b'}/>
                        }/>
                    </Tooltip>
                </Col>
            </Row>
            {!isLastItem && <hr/>}
        </div>
    )
}


export default OrderItem