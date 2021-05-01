import React, {useEffect, useState} from 'react'
import {Heading} from '@shopify/polaris'
import {Avatar, Empty, Typography} from 'antd'
import {getBestSellingProducts} from '../../../../services/api/analytics'
import Paths from '../../../../routes/Paths'
import './BestSellerContainer.scss'
//import {numberFormatCurrency} from '../../../shared/FormatNumber'
import {Link} from "react-router-dom"

const {Text} = Typography

const BestSellerContainer = (props) => {
    const {timeRange} = props

    const [products, setProducts] = useState([])

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRange])

    const fetchData = async () => {
        let startDate = timeRange.startDate ? timeRange.startDate.format() : ''
        let endDate = timeRange.endDate ? timeRange.endDate.subtract(1, 'seconds').format() : ''
        const result = await getBestSellingProducts(startDate, endDate)
        setProducts(result.data.data)
    }

    return (
        <div className={'best-selling-products-container'}>
            <div className={'best-selling-products-heading'}>
                <Heading>Best selling products ({timeRange.rangeTitle.toLowerCase()})</Heading>
            </div>
            {products.length === 0 ? <Empty
                    className='text-center' image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <span>
                        No product is sold {timeRange.rangeTitle}
                        </span>
                    }
                />
                :
                <div className='row best-selling-product-list'>

                    {products.slice(0, 6).map((item, index) => {
                        const attributes = item.user_variant.abstract_variant.attributes_value
                        return <div key={index} className='col-12'>
                            <div className="item-detail">
                                <div className={'item-position'}>
                                    #{index + 1}
                                </div>
                                <div className={'vertical-divider'}><span>&nbsp;</span></div>
                                <div className="row no-padding w-100">
                                    <div className='col-4 col-sm-3 col-md-2'>
                                        <Avatar style={{padding: '-2rem'}} shape="square" size={80}
                                                src={item.user_variant.mockup_per_side.length > 0 ?
                                                    item.user_variant.mockup_per_side[0].mockup_url : item.user_variant.preview_image_url}
                                                className={'border-avatar'}/>
                                    </div>
                                    <div className="col-8 col-sm-9 col-md-10 flex-space-between">
                                        <div className="row col-12 no-padding">
                                            <div className="col-12 col-lg-9 m-b-5 no-padding p-r-15">
                                                <Link
                                                    className="item-title"
                                                    to={Paths.ProductDetail(item.user_variant.user_product_id)}
                                                >
                                                    <Text ellipsis={true} style={{width: "100%", color: "inherit"}}>
                                                        {item.user_variant.title.slice(0, 20)}
                                                    </Text>
                                                </Link>
                                                <p className="item-description">{attributes.map(a => a.label).join(' / ')}</p>
                                            </div>
                                            <div className="row col-12 col-lg-3">
                                                <div className='col-12 item-ranking-attribute no-padding'>
                                                    <div className="attribute attribute-right width-100">
                                                        <p>Purchased</p>
                                                        <p>{item.purchased_quantity}</p>
                                                    </div>
                                                    {/*<div className="attribute attribute-right">*/}
                                                    {/*    <p>Total Profit</p>*/}
                                                    {/*    <p>{numberFormatCurrency(item.total_profit)}</p>*/}
                                                    {/*</div>*/}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    })}
                </div>}
        </div>
    )

}

export default BestSellerContainer
