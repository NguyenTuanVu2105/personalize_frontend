import React, {useCallback, useContext, useEffect, useState} from 'react'
import DocTitle from '../../shared/DocTitle'
import {Col, message, notification, Row} from 'antd'
import ProductVariantsTable from './product-detail/ProductVariantsTable'
import {
    getAUserProduct,
    getAUserProductAsyncInfo,
    retrieveDefaultCurrency,
    updateAUserProduct
} from '../../../services/api/seller'
import Paths from '../../../routes/Paths'
import ArtworksList from './product-detail/ArtworksList'
import AttributesList from './product-detail/AttributesList'
import UserPageContext from '../../userpage/context/UserPageContext'
import _ from 'lodash'
import AppContext from '../../../AppContext'
import Editor from '../../shared/Editor';
import AdminPreviewProduct from './product-detail/AdminPreviewProduct'
import {productSyncingStatuses} from '../../../configs/productSyncingStatuses'
import {Badge, Card, DisplayText, Stack, TextContainer, TextField, Tooltip} from '@shopify/polaris'
import PricingModal from './product-detail/PricingModal'
import AddStoresProduct from './product-detail/AddStoresProduct'
import {addShopsProductDetail} from '../../../services/api/shops'
import {faPlusSquare} from '@fortawesome/free-regular-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {DeleteProductButton} from './product-detail/DeleteProductButton'
import './ProductDetail.scss'
import {LightboxPreview} from './product-detail/LightboxPreview'
import {ReSyncProductButton} from './product-detail/ReSyncProductButton'
import ContextualSaveBarHeader from '../../userpage/components/ContextualSaveBarHeader'
import {BulkResyncProductButton} from "./BulkResyncProductButton"
import {getDetailCost} from "../../../services/api/products"
import {getShippingCostDetail, setCostDetail} from "../../../shared/setCostDetail"
import {SHOP_USER_PRODUCT_STATUS} from "../contants/ShopUserProductStatus"
import LoadingBar from "react-top-loading-bar"
import {DEFAULT_CURRENCY} from "../../new-product/constants/constants"
import {USER_PRODUCT_STATUS} from "../contants/UserProductStatus"

const NO_REFRESH_SHOP_STATUSES = [SHOP_USER_PRODUCT_STATUS.DELETED, SHOP_USER_PRODUCT_STATUS.SYNCED, SHOP_USER_PRODUCT_STATUS.ERROR]
const LOAD_INTERVAL = 5000

const ProductDetail = function (props) {

    const {productId} = props

    const {setNameMap} = useContext(UserPageContext)

    const [_productInfo, _setProductInfo] = useState(null)
    const [_attributesSet, _setAttributesSet] = useState({})
    const [title, setTitle] = useState('')
    const [urlImage, setUrlImage] = useState([])
    const {setLoading, setHasContextual} = useContext(AppContext)
    const [visible, setVisible] = useState(false)
    const [visibleShop, setVisibleShop] = useState(false)
    const [pricing, setPricing] = useState()
    const [changeVari, setChangeVari] = useState(false)
    const [change, setChange] = useState(false)
    const [imageView, setImageView] = useState(false)
    const [viewIndex, setViewIndex] = useState(0)
    const [autoRefresh, setAutoRefresh] = useState(false)
    const [autoRefreshProgress, setAutoRefreshProgress] = useState(0)
    const [defaultCurrency, setDefaultCurrency] = useState({})
    const [shippingCosts, setShippingCosts] = useState([])
    const [defaultEndLoading, setDefaultEndLoading] = useState(false)

    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.ListProducts]: 'Products',
            [Paths.ProductDetail(productId)]: productId
        })
        _fetchProductInfo(defaultEndLoading)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId])

    useEffect(() => {
        setDefaultEndLoading(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        let productRefresh = setInterval(() => {
            autoRefresh && fetchAsyncProductData()
        }, LOAD_INTERVAL)
        return () => {
            clearInterval(productRefresh)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefresh, _productInfo])

    useEffect(() => {
        getDefaultCurrency()
    }, [])

    const needToAutoRefresh = (shopUserProducts, sideArtworks) => {
        // return !shopUserProducts.every(shopUserProduct => UNLOAD_SHOP_STATUSES.includes(shopUserProduct.sync_status))
        const loadProductStatusCheck = !shopUserProducts.every(shopUserProduct => NO_REFRESH_SHOP_STATUSES.includes(shopUserProduct.sync_status))
        const loadArtworkFusionCheck = sideArtworks.every(sideArtwork => !sideArtwork.fused_artwork.image_url)
        return loadProductStatusCheck || loadArtworkFusionCheck
    }

    const fetchAsyncProductData = async () => {
        // include ShopSyncingStatus and ArtworkFusion

        setAutoRefreshProgress(80)
        const productsRes = await getAUserProductAsyncInfo(productId)
        const {success: productSuccess, data: productsData} = productsRes

        if (productSuccess) {
            const product = _productInfo
            product.shop_user_product_set = productsData.shop_user_product_set
            product.side_artworks = productsData.side_artworks
            _setProductInfo(product)
            const autoRefresh = needToAutoRefresh(productsData.shop_user_product_set, productsData.side_artworks)
            setAutoRefresh(autoRefresh)
        }
        setAutoRefreshProgress(100)
    }

    const _fetchProductInfo = async (endLoading = true) => {
        setLoading(true)

        const productsRes = await getAUserProduct(productId)

        const {success: productSuccess, data: productsData} = productsRes

        if (!productSuccess)
            return
        const variantsSet = productsData.user_product_variant_set

        const autoRefresh = needToAutoRefresh(productsData.shop_user_product_set, productsData.side_artworks)
        setAutoRefresh(autoRefresh)

        const rawAttributes = variantsSet.map((variant) => {
            return variant.abstract_variant.attributes_value
        })
        const detailCosts = (await getDetailCost(productsData.abstract_product.id)).data

        if (detailCosts) {
            const shippingCosts = detailCosts.costs
            const shippingZones = detailCosts.shipping_zones
            const shippingRates = detailCosts.shipping_rates
            const result = getShippingCostDetail(shippingCosts, shippingZones, shippingRates)
            setShippingCosts(result)
        }

        const attributes = _.groupBy(_.uniqWith(_.flatten(rawAttributes), _.isEqual), 'attribute_name')
        _setAttributesSet(attributes)


        setChange(false)
        setChangeVari(false)

        let pricings = []
        productsData.user_product_variant_set.forEach((item) => {
            const detailCost = detailCosts.costs.find(cost => cost.sku === item.abstract_variant.sku)
            const shippingInfo = {
                shipping_zones: detailCosts.shipping_zones,
                shipping_rates: detailCosts.shipping_rates
            }
            setCostDetail(item, shippingInfo, detailCost)
            item.shipping = []
            item.cost.detail.forEach(costDetail => {
                item.shipping.push({
                    ...costDetail,
                    shipping_zone: costDetail.zone.id,
                    shipping_rate: costDetail.rate.id
                })
            })
            let _pricing = {}
            item.prices.forEach(it => {
                _pricing[it.currency] = {
                    value: parseInt(it.value),
                    inputValue: parseFloat(it.value),
                    baseCost: parseFloat(item.cost.production.min),
                    originBaseCost: detailCost.production_cost_base
                }
            })
            pricings.push({price: _pricing, id: item.id})
        })
        setPricing(pricings)
        setTitle(productsData.title)

        let urlImg = []
        productsData.user_product_variant_set.forEach(item => {
            item.mockup_per_side.forEach(it => {
                if (!urlImg.includes(it.mockup_url)) urlImg.push(it.mockup_url)
            })
        })

        // let pairs = urlImg.reduce((list, _, index, source) => {
        //     if (index % 2 === 0) {
        //         list.push(source.slice(index, index + 2));
        //     }
        //     return list;
        // }, []);
        // console.log(productsData)
        setUrlImage(urlImg)
        _setProductInfo(productsData)
        // console.log("urlImg", pairs)
        // setLoading(false)
        endLoading && setLoading(false)
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
        // console.log(_productInfo)
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
            _fetchProductInfo()
        }
    }

    const submitModal = (product) => () => {
        // console.log(product.variants)
        setPricing(product.variants)
        product.variants.forEach((item, index) => {
            _productInfo.user_product_variant_set[index].prices.forEach(pr => {
                if (item.price[pr.currency]) pr.value = item.price[pr.currency].value
            })
        })
        _setProductInfo(_productInfo)
        setVisible(false)
        setChangeVari(true)
    }

    const submitColor = (product) => {
        // console.log(product)
        setChangeVari(true)
        const variantsSet = product.user_product_variant_set
        const rawAttributes = variantsSet.map((variant) => {
            return variant.abstract_variant.attributes_value
        })
        const attributes = _.groupBy(_.uniqWith(_.flatten(rawAttributes), _.isEqual), 'attribute_name')
        _setAttributesSet(attributes)
        let urlImg = []
        product.user_product_variant_set.forEach(item => {
            item.mockup_per_side.forEach(it => {
                if (!urlImg.includes(it.mockup_url)) urlImg.push(it.mockup_url)
            })
        })
        setUrlImage(urlImg)
        let _pricings = []
        product.user_product_variant_set.forEach((item, index) => {
            let _pricing = {}
            item.prices.forEach(it => {
                _pricing[it.currency] = {
                    value: parseInt(it.value),
                    inputValue: parseFloat(it.value),
                    baseCost: parseFloat(it.base_cost),
                    originBaseCost: item.abstract_variant.base_cost
                }
            })
            _pricings.push({price: _pricing, id: item.id})
        })
        setPricing(_pricings)
        _setProductInfo(product)
    }

    const openModal = () => {
        setVisible(true)
    }

    const closeModal = () => {
        setVisible(false)
    }

    const onCloseModalShop = useCallback(() => setVisibleShop(!visibleShop), [visibleShop])

    const openModalShop = () => {
        setVisibleShop(true)
    }
    const onOkModalShop = () => {
        onCloseModalShop()
    }

    const saveShops = async (userProductId, shops) => {
        const respone = await addShopsProductDetail(userProductId, {shop_ids: shops})
        if (respone.success) {
            notification.success({
                message: "Success",
                description: "Add stores successfully"
            })
            _fetchProductInfo()
        } else notification.error({
            message: "Error",
            description: "An error occurred when creating this product. Please try again or contact our support team."
        })

    }

    const onClickProductImage = (index) => {
        setViewIndex(index)
        setImageView(true)
    }

    const closeImageView = () => {
        setImageView(false)
    }

    const discard = () => {
        _fetchProductInfo()
    }

    const getDefaultCurrency = async () => {
        const {success, data} = await retrieveDefaultCurrency()
        const defaultCurrency = success ? data : DEFAULT_CURRENCY
        setDefaultCurrency({
            name: defaultCurrency.currency,
            exchangeRate: defaultCurrency.rate,
            precision: defaultCurrency.precision
        })
    }

    useEffect(() => {
        setHasContextual(changeVari || change)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changeVari, change])

    if (_productInfo === null) return <div/>

    const getNotEmptySide = () => {
        const sideLayers = _productInfo.abstract_product.combine_fusion === true ?
            _productInfo.side_artworks.filter(i => !i.send_to_fulfill) :
            _productInfo.side_artworks
        const notEmptySides = sideLayers.filter(i => i.fused_artwork && i.fused_artwork.layers.length > 0)
        return notEmptySides.length
    }
    const sideHasArtwork = getNotEmptySide()

    return (
        <div className="product-detail-container product-detail-page">
            <LoadingBar height={2} waitingTime={500} color='#1d9ba4' progress={autoRefreshProgress}
                        onLoaderFinished={() => setAutoRefreshProgress(0)}/>
            <DocTitle title={_productInfo === null ? 'Loading...' : _productInfo.title}/>
            <div>
                {(changeVari || change) && <ContextualSaveBarHeader onSave={submit} onDiscard={discard}/>}
                <div style={{display: 'flex', justifyContent: 'space-between'}} className="flex-start">
                    <TextContainer spacing="tight">
                        <Stack alignment={'center'}>
                            <DisplayText element="h3" size="large">{_productInfo.title}</DisplayText>
                            {
                                _productInfo.order_item_count.order_items__quantity && (
                                    <div>
                                        <Badge
                                            status="success">{_productInfo.order_item_count.order_items__quantity} ordered</Badge>
                                    </div>
                                )
                            }
                        </Stack>
                        <p>
                            All your product attributes are listed below
                        </p>
                        <span id="hiddenField" style={{position: "absolute", zIndex: -2}}/>
                    </TextContainer>
                    <div className={'btn-heading'}>
                        <BulkResyncProductButton userProductId={_productInfo.id} displayType={"detail"}
                                                 isActive={_productInfo.status === USER_PRODUCT_STATUS.ACTIVE}
                                                 refresh={_fetchProductInfo}
                                                 shopUserProducts={_productInfo.shop_user_product_set}/>
                        <DeleteProductButton isActive={_productInfo.status === USER_PRODUCT_STATUS.ACTIVE}
                                             userProductName={_productInfo.title}
                                             shopUserProducts={_productInfo.shop_user_product_set}
                                             userProductId={_productInfo.id} refresh={_fetchProductInfo}/>
                    </div>
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
                                                'insertdatetime table paste code help',
                                                'image imagetools',
                                                'media',
                                            ],
                                            toolbar:
                                                'undo redo | link | bold italic backcolor | alignleft aligncenter alignright alignjustify | image media | bullist numlist outdent indent | removeformat | help',
                                            setup: function (ed) {
                                                ed.on('init', function (ed) {
                                                    this.getBody().style.fontSize = '14px'
                                                    this.getBody().style.fontFamily = 'Helvetica Neue, Helvetica, Arial, sans-serif'
                                                    this.getBody().style.lineHeight = '1.5'
                                                    setLoading(false)
                                                })
                                            },
                                            verify_html: false,
                                            entity_encoding: 'raw',
                                            cleanup: false
                                        }}
                                        onEditorChange={changeEditor}
                                    />
                                </div>
                            </Card>
                            {
                                urlImage.length > 0 && <Card sectioned title='Images' style={{marginTop: '10px'}}>
                                    <Row gutter={16}>
                                        {urlImage.map((url, index) => (
                                            <div key={index} className={'product-image-preview'}
                                                 onClick={() => onClickProductImage(index)}>
                                                <Tooltip content="Click to preview image">
                                                    <Col span={4}>
                                                        <img style={{width: '100%'}} src={url}
                                                             alt={`variant-${index}`}/>
                                                    </Col>
                                                </Tooltip>
                                            </div>
                                        ))}
                                    </Row>
                                </Card>
                            }
                        </Col>
                        <Col span={7}>
                            <Card title='Product in stores'
                                  actions={[{
                                      content: 'Add stores',
                                      icon: <FontAwesomeIcon style={{fontSize: '1.4rem'}} icon={faPlusSquare}/>,
                                      // content: <Button type={"link"} onClick={openModalShop} icon={<FontAwesomeIcon style={{fontSize: '1.7rem'}} icon={faPlusSquare}/>}>Add shops</Button>
                                      onAction: openModalShop
                                  }]}>
                                <Card.Section>
                                    {
                                        _productInfo.shop_user_product_set.length === 0 && <div>
                                            <TextContainer>No store's product syncing</TextContainer>
                                        </div>
                                    }
                                    {
                                        _productInfo.shop_user_product_set.length > 0 &&
                                        <TextContainer>Stores syncing status for this product</TextContainer>
                                    }
                                </Card.Section>
                                {
                                    _productInfo.shop_user_product_set.map((item, idx) => (
                                        <Card.Section key={idx} title={item.shop.url} actions={[
                                            {
                                                content: <Badge
                                                    status={productSyncingStatuses[item.sync_status].status}
                                                    progress={productSyncingStatuses[item.sync_status].progress}>{productSyncingStatuses[item.sync_status].text}</Badge>
                                            }
                                        ]}>
                                            <div>
                                                {item.sync_status === 'synced' &&
                                                <AdminPreviewProduct userProductId={_productInfo.id} product={item}
                                                                     shopUserProductId={item.id}
                                                                     refresh={_fetchProductInfo}/>}
                                                {['deleted', 'error'].includes(item.sync_status) &&
                                                <ReSyncProductButton userProductId={item.user_product}
                                                                     shop={item.shop}
                                                                     refresh={_fetchProductInfo}/>}
                                            </div>
                                        </Card.Section>
                                    ))
                                }
                            </Card>
                            <div style={{marginTop: '10px'}}>
                                <AttributesList submitColor={submitColor} attributes={_attributesSet}
                                                product={_productInfo}/>
                            </div>
                            <div>
                                {
                                    _productInfo.side_artworks.length > 0 &&
                                    <ArtworksList artworks={_productInfo.side_artworks}
                                                  isCombineFusionProduct={_productInfo.combine_fusion}/>
                                }
                            </div>
                        </Col>

                    </Row>
                    <br/>
                    <Row gutter={16}>
                        <Col span={24}>
                            {_productInfo.user_product_variant_set.length > 0 &&
                            <ProductVariantsTable
                                productVariants={_productInfo.user_product_variant_set}
                                child_attributes={_productInfo.child_attributes_data}
                                shops={_productInfo.shops}
                                extra_cost={_productInfo ? Math.max(0, _productInfo.abstract_product.meta.pricing_meta.extra_artwork * (Math.max(1, sideHasArtwork) - 1)) : 0}
                                openModal={openModal}
                                product_preview_image_url={_productInfo.preview_image_url}
                                shippingDetail={shippingCosts}
                            />
                            }
                        </Col>

                    </Row>
                </div>
                {visibleShop &&
                <AddStoresProduct visible={visibleShop} onClose={onCloseModalShop} onOk={onOkModalShop}
                                  product={_productInfo} saveShops={saveShops} defaultCurrency={defaultCurrency}
                                  userProductId={productId}/>}
                {visible &&
                <PricingModal visible={visible} closeModal={closeModal} productInfo={_productInfo}
                              defaultCurrency={defaultCurrency}
                              submitModal={submitModal}/>}
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

export default ProductDetail
