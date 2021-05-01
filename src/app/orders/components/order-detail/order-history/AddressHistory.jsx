import React from 'react'
import { Descriptions } from 'antd'

function AddressHistory({ item }) {
    var oldAddress = item.old_obj.shipping_address
    var newAddress = item.new_obj.shipping_address
    return (
        <>
            <Descriptions title="New address" className="mt-3" size="small">
                {Object.keys(newAddress).map(title => (
                    <Descriptions.Item label={title[0].toUpperCase() + title.slice(1).replace("_", " ")}>
                        {newAddress[title]===oldAddress[title] ? newAddress[title] : (<b>{newAddress[title]}</b>)}
                    </Descriptions.Item>
                ))}
            </Descriptions>
            <Descriptions title="Old address" className="mt-3">
                {Object.keys(oldAddress).map(title => (
                    <Descriptions.Item label={title[0].toUpperCase() + title.slice(1).replace("_", " ")}>
                        {newAddress[title]===oldAddress[title] ? oldAddress[title] : (<b>{oldAddress[title]}</b>)}
                    </Descriptions.Item>
                ))}
            </Descriptions>
        </>
    )
}

export default AddressHistory