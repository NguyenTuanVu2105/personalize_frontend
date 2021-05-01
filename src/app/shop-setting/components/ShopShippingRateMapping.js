import React, {useContext, useEffect, useState} from 'react'
import {message, Select, Table} from 'antd'
import {getShopShippingByShopId, updateShopShippingRateMappings} from '../../../services/api/shops'
import AppContext from '../../../AppContext'
import {Button, Heading, TextContainer} from '@shopify/polaris'
import {COUNTRY_CODES} from '../../../shared/countryCode'
import {withRouter} from 'react-router-dom'

const {Option} = Select

const ShopShippingRateMapping = (props) => {

    const {shopId, setLoadingShippingRate} = props

    const [_isLoading, _setIsLoading] = useState(false)
    const [shippingRateMappings, setShippingRateMappings] = useState([])
    const [_shippingRates, _setShippingRates] = useState([])
    const {setLoading} = useContext(AppContext)

    useEffect(() => {
        _fetchData().then()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleLoad = async () => {
        _setIsLoading(true)

        const resp = await getShopShippingByShopId(shopId, `/shop-shipping-rate-mapping/sync-shop/`)
        const {data: shippingRate} = resp
        setShippingRateMappings(shippingRate.shipping_rate_mappings)
        _setIsLoading(false)
    }

    const _fetchData = async () => {
        _setIsLoading(true)

        const resp = await getShopShippingByShopId(shopId, `/shop-shipping-rate-mapping/`)
        const {data: shippingRate} = resp
        // console.log(resp)
        setShippingRateMappings(shippingRate.shipping_rate_mappings)
        _setShippingRates(shippingRate.shipping_rates)
        setLoadingShippingRate(true)
        _setIsLoading(false)
    }


    const selectChange = (id) => (value) => {
        const shippingRateMapping = shippingRateMappings.find(item => item.id === id)
        shippingRateMapping.shipping_rate = value
        setShippingRateMappings([...shippingRateMappings])
    }

    const handleSubmit = async () => {
        setLoading(true)
        let dataSubmit = {
            shop_id: shopId,
            shipping_rate_mappings: shippingRateMappings
        }
        const res = await updateShopShippingRateMappings(dataSubmit)
        if (res.success) setLoading(false)
        else message.error('Network error!')
    }

    const getTableData = () => {
        // console.log(shippingRateMappings)
        const zones = {}
        shippingRateMappings.forEach((rate) => {
            const countryStr = rate.countries.join(',')
            rate.countryStr = countryStr
            if (zones[countryStr]) {
                zones[countryStr].push(rate)
            } else {
                zones[countryStr] = [rate]
            }
            return countryStr
        })
        // console.log(zones)
        const tableData = []
        for (const zone in zones) {
            tableData.push({
                'key': zone,
                'type': 'zone',
                'countries': zones[zone][0].countries
            })
            tableData.push(...zones[zone].map(rate => ({type: 'rate', key: rate.id, ...rate})))
        }
        return tableData
    }

    const columns = [
        {
            title: 'Shopify shipping method',
            dataIndex: 'type',
            key: 'type',
            render: (type, record, index) => {
                if (type === 'zone') {
                    let zoneTitle = ''
                    zoneTitle = record.countries.slice(0, 5)
                        .map(country => country === '*' ? 'Rest Of World' : COUNTRY_CODES[country]).join(', ')
                    if (record.countries.length > 5) zoneTitle += (" and " + (record.countries.length - 5) + " others")
                    return {
                        children: (<Heading element="h6">
                            Shipping zone: {zoneTitle}
                        </Heading>),
                        props: {colSpan: 2}
                    }
                } else {
                    return {children: record.e_commerce_shipping_rate_name, props: {colSpan: 1}}
                }
            }
        },
        {
            title: 'PrintHolo shipping rate',
            dataIndex: 'shipping_rate',
            key: 'shipping_rate',
            render: (id, record, index) => {
                if (record.type === 'zone') return {children: '', props: {colSpan: 0}}
                return (<div className='step-change-shipping-rate'>
                        <Select defaultValue={id} style={{width: 120}} onChange={selectChange(record.key)}>
                            {_shippingRates.map(it => (
                                <Option key={it.id} value={it.id}>{it.name}</Option>
                            ))}
                        </Select>
                    </div>
                )
            },
        }
    ]


    return (<div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <TextContainer spacing="tight">
                <Heading element="h3">Shipping rate mapping</Heading>
                <TextContainer>Shops syncing status for this product</TextContainer>
            </TextContainer>

            <div className="btn-heading">
                <div >
                    <Button id='step-load-shipping-method' onClick={handleLoad}>Load shopify shipping methods</Button>&nbsp;
                    <Button primary onClick={handleSubmit}>Save</Button>
                </div>
            </div>
        </div>
        <br/>
        <Table loading={_isLoading} columns={columns} dataSource={getTableData()} pagination={false}/>
    </div>)
}

export default withRouter(ShopShippingRateMapping)
