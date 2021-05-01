import React from 'react'
import {Collapse, Icon} from 'antd'
import AddressHistory from './AddressHistory'
import RejectedItems from './RejectedItems'
import ExclamationCircleTwoTone from "@ant-design/icons/lib/icons/ExclamationCircleTwoTone"
import {convertDatetime} from "../../../../../services/util/datetime"

function OrderHistoryItem({item}) {
    // console.log(item)
    const produceItemAttribute = (type) => {
        let title = item.message
        let collapsable = true
        let info = ''

        const produceVariantLabel = (attributeValuesSet) => {
            return attributeValuesSet.map((attribute) => attribute.label).join(' / ')
        }

        switch (item.verbose_type) {
            case 'create_order':
                collapsable = false
                break
            case 'update_order_fulfill_status':
                collapsable = false
                let oldFulfillStatus = item.old_obj.fulfill_status.replace('_', ' ').toUpperCase()
                let newFulfillStatus = item.new_obj.fulfill_status.replace('_', ' ').toUpperCase()
                title = (
                    <span>Fulfill status changed <b>{oldFulfillStatus}</b> &rarr; <b>{newFulfillStatus}</b></span>
                )
                break
            case 'update_order_financial_status':
                collapsable = false
                let oldFinancialStatus = item.old_obj.financial_status.replace('_', ' ').toUpperCase()
                let newFinancialStatus = item.new_obj.financial_status.replace('_', ' ').toUpperCase()
                title = (
                    <span>Financial status changed <b>{oldFinancialStatus}</b> &rarr; <b>{newFinancialStatus}</b></span>
                )
                break
            case 'update_order_shipping_address':
                let listChange = Object.keys(item.old_obj.shipping_address).filter(title => item.old_obj.shipping_address[title] !== item.new_obj.shipping_address[title])
                title = <span>Shipping address changed
                    {listChange.slice(0, 5).map((item, index) => <b
                        key={index}> {item.toString().replace('_', ' ').toUpperCase()}</b>)}
                    {listChange.length > 5 && <b> ...</b>}
                </span>
                info = <AddressHistory item={item} listChange={listChange}/>
                break
            case 'update_order_item_variant':
                collapsable = false
                let oldVariant = item.old_obj.variant
                let oldAttribute = produceVariantLabel(oldVariant.abstract_variant.attributes_value)
                let newVariant = item.new_obj.variant
                let newAttribute = produceVariantLabel(newVariant.abstract_variant.attributes_value)
                title = (
                    <span>Changed item <b>{oldVariant.title}</b> variant <b>{oldAttribute}</b> &rarr;
                        <b>{newAttribute}</b></span>
                )
                break
            case 'update_order_item_quantity':
                collapsable = false
                let changedQuantityItemId = item.old_obj.order_item.id
                let changedQuantityItemTitle = item.old_obj.order_item.variant.title
                let changedQuantityItemAttrs = item.old_obj.order_item.variant.abstract_variant.description
                let oldQuantity = item.old_obj.order_item.quantity
                let newQuantity = item.new_obj.order_item.quantity
                title = (
                    <span>Changed item  <b>#{changedQuantityItemId} - {changedQuantityItemTitle} - {changedQuantityItemAttrs}</b> quantity <b>{oldQuantity}</b> &rarr;
                        <b>{newQuantity}</b></span>
                )
                break
            case 'remove_order_item':
                collapsable = false
                let oldItemId = item.old_obj.order_item.id
                let oldItemTitle = item.old_obj.order_item.variant.title
                let oldItemAttrs = item.old_obj.order_item.variant.abstract_variant.description
                title = (
                    <span>Removed item  <b>#{oldItemId} - {oldItemTitle} - {oldItemAttrs}</b></span>
                )
                break
            case 'add_order_item':
                collapsable = false
                let newItemId = item.new_obj.order_item.id
                let newItemTitle = item.new_obj.order_item.variant.title
                let newItemAttrs = item.new_obj.order_item.variant.abstract_variant.description

                title = (
                    <span>Added item  <b>#{newItemId} - {newItemTitle} - {newItemAttrs}</b></span>
                )
                break
            case 'update_order_shipping_rate':
                collapsable = false
                let oldShippingRate = item.old_obj.shipping_rate.toUpperCase()
                let newShippingRate = item.new_obj.shipping_rate.toUpperCase()
                title = (
                    <span>Shipping plan changed <b>{oldShippingRate}</b> &rarr; <b>{newShippingRate}</b></span>
                )
                break
            case 'reject_not_support_shipping_item':
                const notShippingRejectedItems = item.new_obj.rejected_items
                const notShippingRejectedItemsSKUs = notShippingRejectedItems.map(i => i.variant.sku).join(', ')
                title = (
                    <span>Fulfillment Service has restricted <b>{notShippingRejectedItems.length}</b> item(s) with SKU <b>{notShippingRejectedItemsSKUs}</b> to "Holding" status<br/> Holding reason: <b>Not Support Shipping</b></span>
                )
                info = <RejectedItems items={notShippingRejectedItems}/>
                break
            case 'reject_item_by_fulfill':
                const rejectedItems = item.new_obj.rejected_items
                const rejectedItemsSKUasStr = rejectedItems.map(i => i.variant.sku).join(', ')
                title = (
                    <span>System has rejected <b>{rejectedItems.length}</b> items with SKU <b>{rejectedItemsSKUasStr}</b></span>
                )
                info = <RejectedItems items={rejectedItems}/>
                break
            case 'update_order_is_item_editable_status':
                collapsable = false
                break
            case 'reject_no_shipping_item':
                const noCustomerRejectedItems = item.new_obj.rejected_items
                const noCustomerRejectedItemsSKUs = noCustomerRejectedItems.map(i => i.variant.sku).join(', ')
                title = (
                    <span>Fulfillment Service has restricted <b>{noCustomerRejectedItems.length}</b> item(s) with SKU <b>{noCustomerRejectedItemsSKUs}</b> to "Holding" status<br/> Holding reason: <b>No Customer Or Shipping Address</b></span>
                )
                info = <RejectedItems items={noCustomerRejectedItems}/>
                break
            default:
        }

        switch (type) {
            case 'title':
                return title
            case 'collapsable':
                return collapsable
            case 'info':
                return info
            default:
                return title
        }
    }

    return (
        <Collapse
            bordered={false}
            expandIcon={({isActive}) => <Icon type="caret-right" rotate={isActive ? 90 : 0}/>}
            expandIconPosition={'left'}
        >
            <Collapse.Panel
                header={produceItemAttribute('title')}
                key={item.id}
                extra={
                    <div>
                        {!item.is_approved ?
                            <ExclamationCircleTwoTone style={{fontSize: "1.2em"}} twoToneColor="#dc3545"/> : ""}
                        <span className={"m-l-10"}>{convertDatetime(item.create_time).format('hh:mm A')}</span>
                    </div>}
                showArrow={produceItemAttribute('collapsable')}
                disabled={!produceItemAttribute('collapsable')}
            >
                {produceItemAttribute('info')}
            </Collapse.Panel>
        </Collapse>
    )
}

export default OrderHistoryItem
