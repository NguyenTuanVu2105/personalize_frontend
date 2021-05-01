import React from 'react'
import {Button, Checkbox, Icon} from 'antd'

export const getAttributeColumn = (product, attribute, filters) => {
    // console.log(attribute)
    let chosenValues = product.attributes[attribute.name].map(value => attribute.child_attributes_value_set.find(v => v.id === value))
    return {
        title: (<span id={`attribute-${attribute.name}`}>{attribute.name}</span>),
        dataIndex: attribute.name,
        key: attribute.name,
        render: (text, record) => {
            const attribute_value = record.abstract.attributes_value.find((val) => val.attribute === attribute.id)
            if (attribute.name.toLowerCase().includes('color')) {
                return (
                    <div className="flex-start">
                        <div className="color-box" style={{backgroundColor: attribute_value.value}}/>
                        &nbsp;
                        {attribute_value.label}
                    </div>
                )
            }
            return (<div>{attribute_value.label}</div>)
        },
        filters: chosenValues.map(attrValue => ({text: attrValue.label, value: attrValue.value})),
        filterMultiple: true,
        filteredValue: filters[attribute.name],
        filterIcon: filtered => {
            const hidden = document.getElementById(`hiddenField`)
            let width
            if (hidden) {
                hidden.innerText = attribute.name
                width = hidden.offsetWidth
            }
            return filtered ? <Icon type="filter" theme="filled"  style={{color: "red", left: hidden ? width + 20 : null}}  className="filter-icon step-filter-column"/> :
                <Icon type="filter" theme="filled" style={{left: hidden ? width + 20 : null}} className="filter-icon step-filter-column"/>
        },
        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters, filters, getPopupContainer}) => {
            const onAllChange = (e) => {
                if (e.target.checked) {
                    setSelectedKeys(filters.map(filter => filter.value))
                } else {
                    setSelectedKeys([])
                }
            }
            const isSelectAll = selectedKeys.length === filters.length
            return (
                <div className="filter-container">
                    <Checkbox onChange={onAllChange} checked={isSelectAll}
                              style={{borderBottom: '1px solid #0000001a', padding: '0 8px 4px 8px'}}>Select
                        All</Checkbox>
                    {filters.map((filter , index)=> {
                        const onChange = () => {
                            if (selectedKeys.includes(filter.value)) {
                                setSelectedKeys(selectedKeys.filter(val => val !== filter.value))
                            } else {
                                setSelectedKeys([...selectedKeys, filter.value])
                            }
                        }
                        return (
                            <Checkbox
                                key={index}
                                checked={selectedKeys.includes(filter.value)}
                                onChange={onChange}
                                style={{padding: '5px 0 5px 0'}}
                            >
                                {filter.text}
                            </Checkbox>)
                    })}
                    <div style={{borderTop: '1px solid #0000001a'}}>
                        <Button onClick={confirm} style={{border: 'none'}}>OK</Button>
                        <Button onClick={clearFilters} style={{border: 'none'}}>Clear</Button>
                    </div>
                </div>
            )
        },
        onFilter: (value, record) => record.abstract.attributes_value.some(attrValue => attrValue.value === value),
    }
}


