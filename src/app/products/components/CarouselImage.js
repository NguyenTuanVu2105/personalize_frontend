import React, {useContext, useEffect, useState} from 'react'
import {getMockupProductById} from "../../../services/api/products"
// import "react-responsive-carousel/lib/styles/carousel.min.css"
import _ from 'lodash'
import './CarouselImage.scss'
import {LightboxPreview} from "./product-detail/LightboxPreview"
import AppContext from "../../../AppContext"

const CarouselImage = (props) => {
    const {productId, closeModal, isEcomerce, imageList} = props
    const [mockups, setMockups] = useState([])
    const [selected, setSelected] = useState(0)
    const [_loading, _setLoading] = useState(true)
    const {setLoading} = useContext(AppContext)

    useEffect(() => {
        if (!isEcomerce) {
            _fetchData()
        }else {
            setLoading(false)
        }
        // console.log(2)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const _fetchData = async () => {
        setLoading(true)
        _setLoading(true)
        const respone = await getMockupProductById(productId)
        setMockups(_.uniq(respone.data.mockups))
        _setLoading(false)
        setLoading(false)
    }

    return (
        !_loading &&
        (
            <LightboxPreview
                currentIndex={selected}
                imageList={isEcomerce ? imageList : mockups}
                setCurrentIndex={setSelected}
                closeImageView={closeModal}
            />
        )
    )
}

export default CarouselImage