import React, {useContext, useEffect, useState} from 'react'
import {Card, Modal, Select, TextContainer, TextField} from "@shopify/polaris"
import AppContext from "../../AppContext"
import AddPaymentMethodPrompt from "../dashboard/components/InstantPrompt/Prompts/AddPaymentMethodPrompt"
import {Col, notification, Row} from "antd"
import {createSystemOrder, productCheck, retrieveShippingPlans} from "../../services/api/newOrder"
import {useHistory} from 'react-router-dom'
import Paths from "../../routes/Paths"
import ProductModalContainer from "./components/ProductModal/ProductModalContainer"
import OrderItem from "./components/OrderItem"
import _ from 'lodash'
import {numberFormatCurrency} from "../shared/FormatNumber"
import ShippingAddressModal from "./components/ShippingAddressModal"
import ContextualSaveBarHeader from "../userpage/components/ContextualSaveBarHeader"
import NewOrderContext from "./context/NewOrderContext"
import {DEFAULT_CURRENCY} from "../new-product/constants/constants"
import {getLocalStorage} from "../../services/storage/localStorage"
import {COOKIE_KEY} from "../../services/storage/sessionStorage"
import BigNumber from "bignumber.js"

const NewOrder = function (props) {
    const {
        contextSelectedVariants,
        setContextSelectedVariantAndIds,
        removeContextVariant,
        setContextSelectedVariants
    } = useContext(NewOrderContext)
    const history = useHistory()
    const {instantPrompts, setHasContextual} = useContext(AppContext)
    const [noProduct, setNoProduct] = useState(false)
    const [noteValue, setNoteValue] = useState('')
    const [shippingAddress, setShippingAddress] = useState(null)
    const [shippingPlanOptions, setShippingPlanOptions] = useState([])
    const [selectedShippingPlan, setSelectedShippingPlan] = useState('')
    const [discardModalVisible, setDiscardModalVisible] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)

    const handleNoteChange = (newValue) => setNoteValue(newValue)

    useEffect(() => {
        checkProduct()
        getShippingPlans()
    }, [])

    const checkProduct = async () => {
        const {success, data} = await productCheck()
        if (!success) notification.error({
            message: "Error",
            description: "An error occurred, please try again or contact our support team"
        })

        if (success && !data.have_product) setNoProduct(true)
    }

    const onRemoveItem = (id) => removeContextVariant(id)

    const onChangeQuantity = (id, quantity) => {
        if (quantity >= 1) {
            const _contextSelectedVariants = contextSelectedVariants
            _.find(_contextSelectedVariants, {user_variant: id}).quantity = quantity
            setContextSelectedVariants([..._contextSelectedVariants])
        }
    }

    const onSaveAddress = (shippingAddress) => {
        setShippingAddress(shippingAddress)
    }

    const getShippingPlans = async () => {
        const {success, data} = await retrieveShippingPlans()
        if (!success) notification.error({
            message: "Error",
            description: "An error occurred, please try again or contact our support team"
        })

        else {
            const shippingPlans = data.map(plan => ({
                label: plan.description,
                value: plan.id.toString()
            }))
            setShippingPlanOptions(shippingPlans)
            setSelectedShippingPlan(shippingPlans[0].value)
        }
        const element = document.querySelector(".Polaris-Frame-ContextualSaveBar__LogoContainer")
        if (element) {
            element.addEventListener("click", () => {
                setDiscardModalVisible(true)
            })
        }
    }

    const handleShippingPlanChange = (newValue) => setSelectedShippingPlan(newValue)

    const onDiscardChange = () => {
        setContextSelectedVariantAndIds([], [])
        setSelectedShippingPlan(shippingPlanOptions[0].value)
        setShippingAddress(null)
        setDiscardModalVisible(false)
        history.push(Paths.Dashboard)
    }

    const onSubmitOrder = async (changeLocation = true) => {
        setSubmitLoading(true)
        let itemsData = contextSelectedVariants.map(variant => {
            const price = exactlyPriceAvailable ? variant.priceDict.find(p => p.shipping_zone === shippingAddress.countryZone && p.shipping_rate === parseInt(selectedShippingPlan)) : null
            const exactlyPrice = price ? price.production_cost_base : null
            return {
                user_variant_id: variant.user_variant,
                id: variant.user_variant, // item_id
                quantity: parseInt(variant.quantity),
                sku: variant.user_variant,
                price: exactlyPrice,
                currency: DEFAULT_CURRENCY.currency,
                type: variant.type,
                abstract_variant: variant.abstract_variant,
                sample_product_id: variant.sample_id
            }
        })
        const reqData = {
            note: noteValue,
            items: itemsData,
            currency: DEFAULT_CURRENCY.currency,
            customer: {
                email: getLocalStorage(COOKIE_KEY.EMAIL),
                phone: shippingAddress.phone,
                last_name: shippingAddress.lastName,
                first_name: shippingAddress.firstName,
                customer_id: null
            },
            total_price: contextSelectedVariants.length > 0 ? getSubtotal() : 0,
            shipping_rate: selectedShippingPlan,
            shipping_address: {
                zip: shippingAddress.zipCode,
                city: shippingAddress.city,
                name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                phone: shippingAddress.phone,
                company: shippingAddress.company,
                country: shippingAddress.country,
                address1: combineAddress(shippingAddress),
                address2: null,
                province: shippingAddress.region,
                last_name: shippingAddress.lastName,
                first_name: shippingAddress.firstName,
                country_code: shippingAddress.countryCode,
                province_code: null
            }

        }
        const {success, data} = await createSystemOrder(reqData)
        // console.log(data)
        if (!success) {
            notification.error({
                message: "Error",
                description: "An error occurred, please try again or contact our support team"
            })
            setSubmitLoading(false)
        } else if (success && data.success) {
            notification.success({
                message: "Success",
                description: "Your order has been created"
            })
            setSubmitLoading(false)
            if (!!changeLocation) {
                setTimeout(() => history.push(Paths.OrderDetail(data.order_id)), 500)
            }
        }
    }

    const combineAddress = (shippingAddress) => {
        if (shippingAddress.apartment && shippingAddress.address) {
            return `${shippingAddress.apartment}, ${shippingAddress.address}`
        } else if (shippingAddress.apartment) {
            return shippingAddress.apartment
        } else if (shippingAddress.address) {
            return shippingAddress.address
        } else return null
    }

    // const renderCostInfo = () => {
    //     let text = ''
    //     if (contextSelectedVariants.length === 0) {
    //         text = "Please select at least one order item"
    //     } else if (!shippingAddress) {
    //         text = "Please add your shipping address"
    //     } else if (!selectedShippingPlan) {
    //         text = "Please select your shipping plan"
    //     }
    //     return text ? (
    //         <div className={'row my-3'}>
    //             <div className="col-12 flex-end">
    //                 <FontAwesomeIcon className={"next-icon"} style={{fontSize: "16px"}}
    //                                  icon={faExclamationCircle}
    //                                  color={'#fcad3b'}/><strong className={"ml-3"}>{text}</strong>
    //             </div>
    //         </div>
    //     ) : <div/>
    // }

    const getSubtotal = () => {
        let minSubtotal = new BigNumber(0)
        contextSelectedVariants.forEach(v => {
            const cost = new BigNumber(v.costPerItem)
            const additionalCost = new BigNumber(v.additionalCost)
            minSubtotal = v.additionalCost === v.costPerItem ? minSubtotal.plus(cost.multipliedBy(parseInt(v.quantity))) : minSubtotal.plus(cost).plus(additionalCost.multipliedBy(parseInt(v.quantity) - 1))
        })
        return minSubtotal
    }

    const getFormattedSubtotal = () => {
        const minSubtotal = getSubtotal()
        return `${numberFormatCurrency(minSubtotal)}`
    }

    const hasChanged = contextSelectedVariants.length > 0 || !!shippingAddress || (shippingPlanOptions.length > 0 && selectedShippingPlan !== shippingPlanOptions[0].value)
    const submitAvailable = contextSelectedVariants.length > 0 && !!shippingAddress && !!selectedShippingPlan
    const exactlyPriceAvailable = contextSelectedVariants.length > 0 && !!shippingAddress && !!selectedShippingPlan

    useEffect(() => {
        setHasContextual(hasChanged)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasChanged])

    const renderTitle = (title) => {
        return (<h2 className="Polaris-Heading">{title} <span style={{color: "red"}}>*</span></h2>)
    }

    return (
        <div className={"new-order-page"}>
            {instantPrompts && instantPrompts.includes('add_payment_method') && (
                <AddPaymentMethodPrompt
                    status={'warning'}
                    key={'add_payment_method'}
                    confirmRequired={hasChanged}
                />
            )}
            {hasChanged && <ContextualSaveBarHeader message={"Order has been changed"} saveContent={"Submit order"}
                                                    saveDisabled={!submitAvailable}
                                                    onDiscard={() => setDiscardModalVisible(true)}
                                                    onSave={onSubmitOrder}
                                                    saveLoading={submitLoading}/>}
            <Row className="m-t-10">
                <Col span={24} md={16}>
                    <Card title={renderTitle("Order items")}>
                        <Card.Section>
                            <ProductModalContainer noUserProduct={noProduct}/>
                        </Card.Section>
                        {
                            contextSelectedVariants.length > 0 && (
                                <Card.Section>
                                    {
                                        contextSelectedVariants.map((item, index) => {
                                            const price = exactlyPriceAvailable ? item.priceDict.find(p => p.shipping_zone === shippingAddress.countryZone && p.shipping_rate === parseInt(selectedShippingPlan)) : null
                                            const exactlyPrice = price ? parseFloat(price.production_cost_base) + parseFloat(item.extra_cost) : null
                                            return (
                                                <OrderItem key={index}
                                                           id={item.user_variant}
                                                           cost={item.costPerItem}
                                                           additionalCost={item.additionalCost}
                                                           exactlyPrice={exactlyPrice}
                                                           preview={item.preview}
                                                           title={item.title}
                                                           attributeValues={item.attributeValues}
                                                           quantity={item.quantity}
                                                           isLastItem={index === contextSelectedVariants.length - 1}
                                                           onRemoveItem={onRemoveItem}
                                                           onChangeQuantity={onChangeQuantity}/>
                                            )
                                        })
                                    }
                                </Card.Section>
                            )
                        }
                        <Card.Section>
                            <div className="row">
                                <div className="col-lg-6">
                                    <TextField label="Note" placeholder={"Add a note..."} value={noteValue}
                                               onChange={handleNoteChange}/>
                                </div>
                                <div className="col-lg-6">
                                    {/*{renderCostInfo()}*/}
                                    <div className="row my-3">
                                        <div className="col-6 text-right">
                                            Subtotal
                                        </div>
                                        <div className="col-6 text-right">
                                            <b style={{fontSize: 16}}>{contextSelectedVariants.length > 0 ? getFormattedSubtotal() : "---"}</b>
                                        </div>
                                    </div>

                                    {/*<div className="row my-3">*/}
                                    {/*<div className="col-6 text-right">*/}
                                    {/*Taxes (VAT 10%)*/}
                                    {/*</div>*/}
                                    {/*<div className="col-6 text-right">*/}
                                    {/*{numberFormatCurrency(orderCost.taxes)}*/}
                                    {/*</div>*/}
                                    {/*</div>*/}
                                    {/*<div className="row my-3">*/}
                                    {/*    <div className="col-6 text-right font-weight-bolder">*/}
                                    {/*        Total*/}
                                    {/*    </div>*/}
                                    {/*    <div className="col-6 text-right font-weight-bolder">*/}
                                    {/*        {orderCost.total !== 0 ? numberFormatCurrency(orderCost.total): "---"}*/}
                                    {/*    </div>*/}
                                    {/*</div>*/}
                                    <div className="row my-3">
                                        <div className="col-6 text-right">

                                        </div>
                                        <div className="col-6 text-right" style={{color: "orange"}}>
                                            (Not include shipping)
                                            {/*{orderCost.shipping !== 0 ? numberFormatCurrency(orderCost.shipping) : "---"}*/}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card.Section>
                    </Card>
                </Col>
                <Col span={24} md={8} className="pl-md-4 mt-4 mt-md-0">
                    <div>
                        <Card title={renderTitle("Shipping Address")}
                              actions={[
                                  {
                                      content: <ShippingAddressModal shippingAddress={shippingAddress}
                                                                     onSave={onSaveAddress}/>
                                  }
                              ]}>
                            {
                                shippingAddress && <Card.Section titlte={"Shipping address"}>
                                    <p><strong>Name: </strong>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                                    {
                                        shippingAddress.company &&
                                        <p className="mt-3"><strong>Company: </strong>{shippingAddress.company}</p>
                                    }
                                    <p className="mt-3"><strong>Address: </strong>{shippingAddress.address}</p>
                                    {
                                        shippingAddress.apartment && <p className="mt-3">
                                            <strong>Apartment/Building: </strong>{shippingAddress.apartment}</p>
                                    }
                                    <p className="mt-3">
                                        <strong>City: </strong>{shippingAddress.city} {shippingAddress.zipCode}</p>
                                    <p className="mt-3"><strong>Region/state: </strong>{shippingAddress.region}</p>
                                    <p className="mt-3">
                                        <strong>Country: </strong>{shippingAddress.country} ({shippingAddress.countryCode})
                                    </p>
                                    <p className="mt-3"><strong>Phone number: </strong>{shippingAddress.phone}</p>
                                </Card.Section>
                            }
                            {
                                !shippingAddress && <Card.Section>
                                    No address provided
                                </Card.Section>
                            }
                        </Card>
                    </div>
                    <div className="mt-4">
                        <Card title={renderTitle("Shipping Plan")} sectioned>
                            <Select
                                labelHidden
                                options={shippingPlanOptions}
                                onChange={handleShippingPlanChange}
                                value={selectedShippingPlan}
                            />
                        </Card>
                    </div>
                </Col>
            </Row>
            {/*<div className={'no-product-modal'}>*/}
            {/*<Modal*/}
            {/*open={noProductModalVisible}*/}
            {/*onClose={() => history.goBack()}*/}
            {/*title="You do not have any active product"*/}
            {/*primaryAction={{*/}
            {/*content: 'Create product',*/}
            {/*onAction: () => history.push(Paths.NewProduct),*/}
            {/*}}*/}
            {/*secondaryActions={[*/}
            {/*{*/}
            {/*content: 'Go back',*/}
            {/*onAction: () => history.goBack(),*/}
            {/*},*/}
            {/*]}*/}
            {/*>*/}
            {/*<Modal.Section>*/}
            {/*<TextContainer>*/}
            {/*<p>*/}
            {/*Do you want to create a product now?*/}
            {/*</p>*/}
            {/*</TextContainer>*/}
            {/*</Modal.Section>*/}
            {/*</Modal>*/}
            {/*</div>*/}
            <div className={'discard-modal'}>
                <Modal
                    open={discardModalVisible}
                    onClose={() => setDiscardModalVisible(false)}
                    title="Discard order"
                    secondaryActions={{
                        content: 'Discard this order',
                        onAction: onDiscardChange,
                        destructive: true
                    }}
                    primaryAction={[
                        {
                            content: 'Stay here',
                            onAction: () => setDiscardModalVisible(false),
                        },
                    ]}
                >
                    <Modal.Section>
                        <TextContainer>
                            <p>
                                Do you want to clear all this order data?
                            </p>
                        </TextContainer>
                    </Modal.Section>
                </Modal>
            </div>

        </div>
    )
}


export default NewOrder
