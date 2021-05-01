import React, {useContext, useEffect, useState} from "react"
import ProductDetail from "./ProductDetail"
import AppContext from "../../../AppContext"
import UserPageContext from "../../userpage/context/UserPageContext"

const ProductDetailContainer = (props) => {
    const {productId} = props.match.params
    const [curProductId, setCurProductId] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [_timeout, _setTimout] = useState(null)

    const {setLoading} = useContext(AppContext)
    const {setNameMap} = useContext(UserPageContext)

    useEffect(() => {
        clearTimeout(_timeout)
        setIsLoading(true)
        setLoading(true)
        setNameMap({})
        setCurProductId(productId)
        const timeout = setTimeout(() => {
            setIsLoading(false)
        }, 300)
        _setTimout(timeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId])

    return (
        <div>
            {
                !isLoading && curProductId
                    ? (<ProductDetail productId={curProductId}/>)
                    : (<div/>)
            }
        </div>
    )
}

export default ProductDetailContainer