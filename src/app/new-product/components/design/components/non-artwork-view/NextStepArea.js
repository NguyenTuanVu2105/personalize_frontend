import React, {useCallback, useContext} from 'react'
import ChangeStepContainer from '../../../common/ChangeStepContainer'
import NewProductContext from "../../../../context/NewProductContext"
import {Heading, Stack, TextField} from "@shopify/polaris"

const NextStepArea = (props) => {
    const {product, setProduct} = useContext(NewProductContext)
    const handleTitleChange = useCallback((newValue) => {
        const userProduct = product.userProducts[0] || {
            title: product.abstract.title,
            description: product.description,
            sideLayers: []
        }
        userProduct.title = newValue
        setProduct({userProducts: [userProduct]})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <div className="view-container" style={{flexDirection: "column"}}>
            <div className="flex-shrink ph1em">
                <ChangeStepContainer/>
            </div>
            <hr/>
            <div className={"m-4"}>
                <Stack>
                    <Stack.Item>
                        <Heading>Product Title</Heading>
                    </Stack.Item>
                </Stack>
                <div className={'mt-2'}>
                    <TextField label={"Product Title"} labelHidden value={product.userProducts[0].title}
                               onChange={handleTitleChange}/>
                </div>

            </div>
        </div>
    )
}


export default NextStepArea
