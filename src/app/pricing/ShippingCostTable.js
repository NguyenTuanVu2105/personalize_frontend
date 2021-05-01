import React from "react"
import {Card} from "@shopify/polaris"
import {Table} from "antd"
import {displayCostMinMax} from "../../shared/costDisplay"
import {ShippingZoneConfig} from "../new-product/constants/shippingZoneConfig"
import SubShippingCostTable from "./SubShippingCostTable"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons"


const ShippingCostTable = ({shippingDetail, child_attributes, variants}) => {

    const columns = [
        {
            title: "Zone",
            dataIndex: 'zone',
            render: (zone) => {
                const iconSize = 16
                return (
                    <div className="mb-2 mt-2">
                        <img
                            src={ShippingZoneConfig[zone.name].icon}
                            alt={ShippingZoneConfig[zone.name].tooltip}
                            style={{
                                width: iconSize,
                                height: iconSize,
                                marginBottom: 3
                            }}
                        />
                        &nbsp;&nbsp;
                        {ShippingZoneConfig[zone.name].title}
                    </div>
                )
            }
        },
        {
            title: "Rate",
            dataIndex: 'rate',
            render: (rate) => rate.description
        },
        {
            title: "Base shipping cost",
            dataIndex: 'shipping_cost_base',
            render: (shipping_cost_base) => displayCostMinMax(shipping_cost_base)
        },
        {
            title: "Additional shipping cost",
            dataIndex: 'shipping_cost_additional',
            render: (shipping_cost_additional) => displayCostMinMax(shipping_cost_additional)
        },
    ]

    const expandedRowRender = (record) => {
        return <SubShippingCostTable child_attributes={child_attributes} variants={variants} shippingInfo={record}/>
    }

    const expandIcon = (e) => {
        return <div
            className="expand-row-icon"
            onClick={ev => e.onExpand(e.record, ev)}
            style={{cursor: 'pointer'}}>
            {e.expanded ? <FontAwesomeIcon icon={faChevronUp}/> : <FontAwesomeIcon icon={faChevronDown}/>}
        </div>
    }

    const moreAttributeTable = () => {
        if (child_attributes && variants){
            return {
                expandedRowRender: expandedRowRender,
                expandIcon: expandIcon
            }
        }else{
            return {}
        }
    }

    return (
        <div className={'mt-4 shopifilize-card'}>
            <Card
                sectioned
                title={"Shipping cost"}>
                <div
                    className={'shopifilize-table'}>
                    <Table
                        rowKey={(record, index) => index}
                        dataSource={shippingDetail}
                        columns={columns}
                        pagination={false}
                        {...moreAttributeTable()}
                    />
                </div>
            </Card>
        </div>
    )
}

export default ShippingCostTable