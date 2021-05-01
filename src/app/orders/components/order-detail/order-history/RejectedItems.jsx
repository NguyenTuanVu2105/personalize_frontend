import React from 'react'
import {Descriptions} from 'antd'

function RejectedItems({items}) {
    return (
        <>
            {items.map((item, idx) => (
                <Descriptions className="mt-3" size="small">
                    <Descriptions.Item label={`#${idx + 1}. Name`}>
                        {item.variant.title}
                    </Descriptions.Item>
                    <Descriptions.Item label="Variant">
                        {item.variant.abstract_variant.attributes_value.map(a => a.label).join(' / ')}
                    </Descriptions.Item>
                    <Descriptions.Item label="SKU">
                        {item.variant.sku}
                    </Descriptions.Item>
                </Descriptions>))
            }
        </>
    )
}

export default RejectedItems
