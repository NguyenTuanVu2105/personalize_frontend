import React, {useContext, useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import ProductsTable from './ProductsTable'
import Paths from '../../../routes/Paths'
import UserPageContext from '../../userpage/context/UserPageContext'
import {Button, DisplayText, TextContainer} from '@shopify/polaris'
import './ProductListContainer.scss'
// import {Tabs} from "antd"
import { SYNCED} from "../contants/UserProductChoice"
import AppContext from "../../../AppContext"

const ProductListContainer = ({location}) => {

    const {setNameMap} = useContext(UserPageContext)
    const {setLoading} = useContext(AppContext)
    const [productChoice, ] = useState(SYNCED)

    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [location.pathname]: 'Products'
        })
        setLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [0])

    // const getProductChoice = (key) => {
    //     setProductChoice(key)
    // }
    return (
        <div className="shop-product-container">
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <TextContainer spacing="tight">
                    <DisplayText element="h3" size="large">My products</DisplayText>
                    <p>
                        All your products are listed below
                    </p>
                </TextContainer>
                <div className="btn-heading">
                    <Link to={{pathname: Paths.NewProduct, deleteSession: true}}>
                        <Button primary>Create product</Button>
                    </Link>
                </div>
            </div>
            <div className="page-main-content">
                {/*<Tabs defaultActiveKey={SYNCED} onChange={getProductChoice}>*/}
                {/*    <Tabs.TabPane tab='Synced' key={SYNCED}></Tabs.TabPane>*/}
                {/*    <Tabs.TabPane tab='Unsync from ecomerce' key={UNSYNCED}></Tabs.TabPane>*/}
                {/*</Tabs>*/}
                <ProductsTable productChoice={productChoice}/>
            </div>
        </div>
    )
}

export default ProductListContainer
