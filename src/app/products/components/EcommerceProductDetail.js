import React, { useContext, useEffect, useState} from 'react'
import DocTitle from '../../shared/DocTitle'
import {Col, message, Row} from 'antd'
import {getAEcomerceProducts, updateAUserProduct} from '../../../services/api/seller'
import Paths from '../../../routes/Paths'
import UserPageContext from '../../userpage/context/UserPageContext'
import AppContext from '../../../AppContext'
import Editor from '../../shared/Editor'
import {productSyncingStatuses} from '../../../configs/productSyncingStatuses'
import {
    Badge,
    Card,
    DisplayText,
    Stack,
    TextContainer,
    TextField,
    Tooltip
} from '@shopify/polaris'
import './ProductDetail.scss'
import {LightboxPreview} from "./product-detail/LightboxPreview"
import ContextualSaveBarHeader from "../../userpage/components/ContextualSaveBarHeader"
import AdminPreviewEcomerceProduct from "./product-detail/AdminPreviewEcomerceProduct"
import VariantEcommerceTable from "./product-detail/VariantEcommerceTable"

const EcommerceProductDetail = function (props) {
    const {productId} = props.match ? props.match.params : props

    const {setNameMap} = props

    const [_productInfo, _setProductInfo] = useState(null)
    // const [_attributesSet, _setAttributesSet] = useState({})
    const [title, setTitle] = useState('')
    const [urlImage, setUrlImage] = useState([])
    const {setLoading} = useContext(AppContext)
    const [, setVisible] = useState(false)
    // const [visibleShop, setVisibleShop] = useState(false)
    const [pricing, ] = useState()
    const [changeVari,] = useState(false)
    const [change, setChange] = useState(false)
    const [imageView, setImageView] = useState(false)
    const [viewIndex, setViewIndex] = useState(0)
    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.ListProducts]: 'Products',
            [Paths.ProductDetail(productId)]: productId
        })
        _fetUnsyncProduct()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const _fetUnsyncProduct = async () => {
        setLoading(true)
        const productRes = await getAEcomerceProducts(productId)
        const {success: productSuccess, data: productData} = productRes
        if (!productSuccess)
            return
        // const variantsSet = productData.ecommerce_variant_set
        _setProductInfo(productData)
        setTitle(productData.title)
        const urlImg = productData.product_meta.images.map(x => x.src)
        setUrlImage(urlImg)
        setLoading(false)
    }
    const changeInput = (v) => {
        setTitle(v)
        setChange(true)
    }

    const changeEditor = (value) => {
        _productInfo.description = value
        _setProductInfo(_productInfo)
        setChange(true)
    }

    const submit = async () => {
        setLoading(true)
        _productInfo.title = title
        _setProductInfo(_productInfo)
        // console.log(pricing)
        let productSubmit = {
            title: _productInfo.title,
            description: _productInfo.description,
        }
        if (changeVari) productSubmit['variants'] = pricing.map((item, index) => {
            let vari = {price: item.price}
            if (item.id) vari['id'] = item.id
            else vari['abstract_variant'] = _productInfo.user_product_variant_set[index].abstract_variant.id
            return vari
        })
        const resp = await updateAUserProduct(productId, productSubmit)
        setLoading(false)
        if (!resp.success) message.error('Update error!')
        else {
            message.success('Update Product Success')
            // _fetchProductInfo()
        }
    }
    console.log(title)
    // const submitModal = (product) => () => {
    //     // console.log(product.variants)
    //     setPricing(product.variants)
    //     product.variants.forEach((item, index) => {
    //         _productInfo.user_product_variant_set[index].prices.forEach(pr => {
    //             pr.value = item.price[pr.currency].value
    //         })
    //     })
    //     _setProductInfo(_productInfo)
    //     setVisible(false)
    //     setChangeVari(true)
    // }

    // const submitColor = (product) => {
    //     // console.log(product)
    //     setChangeVari(true)
    //     const variantsSet = product.user_product_variant_set
    //     const rawAttributes = variantsSet.map((variant) => {
    //         return variant.abstract_variant.attributes_value
    //     })
    //     const attributes = _.groupBy(_.uniqWith(_.flatten(rawAttributes), _.isEqual), 'attribute_name')
    //     _setAttributesSet(attributes)
    //     let urlImg = []
    //     product.user_product_variant_set.forEach(item => {
    //         item.mockup_per_side.forEach(it => {
    //             if (!urlImg.includes(it.mockup_url)) urlImg.push(it.mockup_url)
    //         })
    //     })
    //     setUrlImage(urlImg)
    //     let _pricings = []
    //     product.user_product_variant_set.forEach((item, index) => {
    //         let _pricing = {}
    //         item.prices.forEach(it => {
    //             _pricing[it.currency] = {
    //                 value: parseInt(it.value),
    //                 inputValue: parseFloat(it.value),
    //                 baseCost: parseFloat(it.base_cost),
    //                 originBaseCost: item.abstract_variant.base_cost
    //             }
    //         })
    //         _pricings.push({price: _pricing, id: item.id})
    //     })
    //     setPricing(_pricings)
    //     _setProductInfo(product)
    // }

    const openModal = () => {
        setVisible(true)
    }

    // const closeModal = () => {
    //     setVisible(false)
    // }

    // const onCloseModalShop = useCallback(() => setVisibleShop(!visibleShop), [visibleShop])

    // const openModalShop = () => {
    //     setVisibleShop(true)
    // }
    // const onOkModalShop = () => {
    //     onCloseModalShop()
    // }


    const onClickProductImage = (index) => {
        setViewIndex(index)
        setImageView(true)
    }

    const closeImageView = () => {
        setImageView(false)
    }

    const discard = () => {
        _fetUnsyncProduct()
    }

    const sync_ecomerce_status = 'unsync'
    if (_productInfo === null) return <div/>
    return (
        <div className="product-detail-container product-detail-page">
            <DocTitle title={_productInfo === null ? 'Loading...' : _productInfo.title}/>
            <div>
                {(changeVari || change) && <ContextualSaveBarHeader onSave={submit} onDiscard={discard}/>}
                <div style={{display: 'flex', justifyContent: 'space-between'}} className="flex-start">
                    <TextContainer spacing="tight">
                        <Stack alignment={"center"}>
                            <DisplayText element="h3" size="large">{_productInfo.title}</DisplayText>
                        </Stack>
                        <p>
                            All your product attributes are listed below
                        </p>
                    </TextContainer>
                    {/*<div className={'btn-heading'}>*/}
                    {/*    <DeleteProductButton isActive={_productInfo.is_active}*/}
                    {/*                         shopUserProducts={_productInfo.shop_user_product_set}*/}
                    {/*                         userProductId={_productInfo.id} refresh={_fetchProductInfo}/>*/}
                    {/*</div>*/}
                </div>

                <div className="page-main-content">
                    <Row gutter={16}>
                        <Col span={17}>
                            <Card sectioned className="product-info">
                                <div>
                                    <TextField label="Title" value={title} onChange={changeInput}/>
                                </div>
                                <div style={{marginTop: '15px'}}>
                                    <div style={{fontSize: '1.4rem', marginBottom: '.4rem'}}>Description</div>
                                    <Editor
                                        value={_productInfo.description}
                                        init={{
                                            height: 800,
                                            menubar: false,
                                            plugins: [
                                                'advlist autolink lists link image charmap print preview anchor',
                                                'searchreplace visualblocks code',
                                                'insertdatetime table paste code help'
                                            ],
                                            toolbar:
                                                'undo redo | link | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                                            setup: function (ed) {
                                                ed.on('init', function (ed) {
                                                    this.getBody().style.fontSize = '14px'
                                                    this.getBody().style.fontFamily = 'Helvetica Neue, Helvetica, Arial, sans-serif'
                                                    this.getBody().style.lineHeight = '1.5'
                                                    setLoading(false)
                                                })
                                            },
                                            verify_html: false,
                                            entity_encoding: "raw",
                                            cleanup: false
                                        }}
                                        onEditorChange={changeEditor}
                                    />
                                </div>
                            </Card>
                            <Card sectioned title='Images' style={{marginTop: '10px'}}>
                                <Row gutter={16}>
                                    {urlImage.map((url, index) => (
                                        <div key={index} className={"product-image-preview"}
                                             onClick={() => onClickProductImage(index)}>
                                            <Tooltip content="Click to preview image">
                                                <Col span={4}>
                                                    <img style={{width: '100%'}} src={url} alt={`variant-${index}`}/>
                                                </Col>
                                            </Tooltip>
                                        </div>
                                    ))}
                                </Row>
                            </Card>
                        </Col>
                        <Col span={7}>
                            <Card title='Product in stores'>
                                <Card.Section>
                                    <TextContainer>Stores syncing status for this product</TextContainer>
                                </Card.Section>
                                <div className={'disable-props'}>
                                    {
                                        <Card.Section title={_productInfo.shop.url} actions={[
                                            {
                                                content: <Badge
                                                    status={productSyncingStatuses[sync_ecomerce_status].status}
                                                    progress={productSyncingStatuses[sync_ecomerce_status].progress}>{productSyncingStatuses[sync_ecomerce_status].text}</Badge>
                                            }
                                        ]}>
                                            <AdminPreviewEcomerceProduct
                                                product_id={_productInfo.product_meta.id}
                                                shop_url={_productInfo.shop.url}
                                                handle={_productInfo.product_meta.handle}
                                            >
                                            </AdminPreviewEcomerceProduct>
                                        </Card.Section>
                                    }
                                </div>
                            </Card>
                        </Col>

                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            {_productInfo.ecommerce_variant_set.length > 0 &&
                            <VariantEcommerceTable productVariants={_productInfo.ecommerce_variant_set}
                                                   child_attributes={_productInfo.product_meta.options}
                                                   shops={_productInfo.shop}
                                                   openModal={openModal}
                                                   fetchData={_fetUnsyncProduct}

                            />
                            }
                        </Col>
                    </Row>
                </div>
                {/*{visibleShop &&*/}
                {/*<AddShopsProductDetail visible={visibleShop} onClose={onCloseModalShop} onOk={onOkModalShop}*/}
                {/*                       product={_productInfo} saveShops={saveShops}/>}*/}
                {/*{visible &&*/}
                {/*<PricingModal visible={visible} closeModal={closeModal} productInfo={_productInfo}*/}
                {/*              setProductInfo={_setProductInfo} submitModal={submitModal}/>}*/}
            </div>
            <div>
                {imageView && (
                    <LightboxPreview currentIndex={viewIndex}
                                     imageList={urlImage}
                                     setCurrentIndex={setViewIndex}
                                     closeImageView={closeImageView}/>
                )}
            </div>
        </div>
    )
}

export default (props) => <UserPageContext.Consumer>
    {(context) => {
        return (<EcommerceProductDetail {...{...props, ...context}} />)
    }}
</UserPageContext.Consumer>
