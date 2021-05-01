import React, {useContext, useEffect, useState} from "react"
import UserPageContext from "../../userpage/context/UserPageContext"
import Paths from "../../../routes/Paths"
import DocTitle from "../../shared/DocTitle"
import {Card, DisplayText, Stack, TextContainer} from "@shopify/polaris"
import StatisticTable from "./StatisticTable"
import ShippingChart from "./ShippingChart"
import "./ProductStatistic.scss"

const ProductStatistic = () => {
    const {setNameMap, setViewWidth, setDefaultViewWidth} = useContext(UserPageContext)
    const [_isLoading, _setIsLoading] = useState(false)


    useEffect(() => {
        _setIsLoading(true)
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.ProductStatistic]: 'Statistic'
        })
        setViewWidth(100)
        _setIsLoading(false)
        return () => {
            setDefaultViewWidth()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <div>
            <DocTitle title={_isLoading ? 'Loading...' : 'Statistic'}/>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <TextContainer spacing="tight">
                    <Stack alignment={'center'}>
                        <DisplayText element="h3" size="large">PrintHolo production statistic</DisplayText>
                    </Stack>
                </TextContainer>
            </div>
            <div className="page-main-content">
                <div className="mt-4 shopifilize-card">
                    <Card sectioned title={"Production time"}>
                        <div className={'shopifilize-table'}>
                            <StatisticTable/>
                        </div>
                    </Card>
                </div>
                <div className="mt-4 shopifilize-card">
                    <Card sectioned title={"Shipping time statistic"}>
                        <div className={'shopifilize-table'}>
                            <ShippingChart/>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )

}


export default ProductStatistic