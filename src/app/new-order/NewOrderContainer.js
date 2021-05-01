import React, {useContext, useEffect, useState} from 'react'
import DocTitle from '../shared/DocTitle'
import NewOrderContext from './context/NewOrderContext'
import Paths from "../../routes/Paths"
import UserPageContext from "../userpage/context/UserPageContext"
import {DisplayText, TextContainer} from "@shopify/polaris"
import NewOrder from "./NewOrder"
import _ from "lodash"

const NewOrderContainer = function (props) {
    const [contextSelectedVariants, setContextSelectedVariants] = useState([])
    const [contextSelectedVariantIds, setContextSelectedVariantIds] = useState([])
    const {setNameMap} = useContext(UserPageContext)

    useEffect(() => {
        setNameMap({
            [Paths.Orders]: 'Order',
            [Paths.NewOrder]: 'Create order'
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // const appendContextSelectedVariants = (variants, ids) => {
    //     setContextSelectedVariants(_.uniqBy([...contextSelectedVariants, ...variants], 'user_variant'))
    //     setContextSelectedVariantIds(_.uniq([...contextSelectedVariantIds, ...ids]))
    // }

    const setContextSelectedVariantAndIds = (variants, ids) => {
        setContextSelectedVariants(variants)
        setContextSelectedVariantIds(ids)
    }


    const removeContextVariant = (variant) => {
        // alert(variant)
        const tmpSelectedVariants = contextSelectedVariants
        const tmpSelectedVariantIds = contextSelectedVariantIds
        _.remove(tmpSelectedVariants, {user_variant: parseInt(variant)})
        const iIndex = tmpSelectedVariantIds.indexOf(variant.toString())
        // alert(iIndex)
        if (iIndex >= 0) {
            tmpSelectedVariantIds.splice(iIndex, 1)
        }
        // console.log(tmpSelectedVariants)
        // console.log(tmpSelectedVariantIds)
        setContextSelectedVariantIds([...tmpSelectedVariantIds])
        setContextSelectedVariants([...tmpSelectedVariants])
        return [...tmpSelectedVariants]
    }

    return (
        <NewOrderContext.Provider value={{
            contextSelectedVariants,
            contextSelectedVariantIds,
            removeContextVariant,
            setContextSelectedVariants,
            setContextSelectedVariantAndIds
        }}>
            <DocTitle title={"Create order"}/>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <TextContainer spacing="tight">
                    <DisplayText element="h3" size="large">Create Order</DisplayText>
                    <p>
                        Create a custom order
                    </p>
                </TextContainer>
            </div>
            <div className="page-main-content">
                <NewOrder/>
            </div>

        </NewOrderContext.Provider>
    )
}


export default NewOrderContainer