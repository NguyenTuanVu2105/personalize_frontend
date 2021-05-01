import React, {useCallback, useContext, useEffect, useState} from 'react'
import {Avatar, Button, Dropdown, Empty, Icon, Menu, Modal, notification, Popover, Spin, Table, Tooltip} from 'antd'
import {Link, useHistory} from 'react-router-dom'
import {getAllProductsByShop, getProductsByIds} from '../../../services/api/seller'
import Paths from '../../../routes/Paths'
import './ProductTable.scss'
import {formatDatetime, formatShortDate} from '../../../services/util/datetime'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {getProductAdminInShopUrl, getProductPreviewInShopUrl} from '../helpers/ProductHelper'
import {faExternalLinkAlt, faEye, faStore} from '@fortawesome/free-solid-svg-icons'
import {faClone} from '@fortawesome/free-regular-svg-icons'
import {AUTO_REFRESH_PRODUCTS_TABLE} from '../../../configs/autoRefresh'
import ProductSyncStatusTag from '../../orders/components/share/ProductSyncStatusTag'
import {Button as ButtonPolaris, Card, ChoiceList, Filters, Stack} from '@shopify/polaris'
import {getSessionStorage, SESSION_KEY} from '../../../services/storage/sessionStorage'
import CarouselImage from './CarouselImage'
import {DeleteProductButton} from './product-detail/DeleteProductButton'
import CommonStatusTag from '../../shared/CommonStatusTag'
import {BulkResyncProductButton} from "./BulkResyncProductButton"
import TableStatus from "../../shared/TableStatus"
import {Calendar} from "react-date-range"
import {DATE_RANGE} from "../../orders/constants"
import {formatTimeSelect} from "../../../shared/formatTime"
import moment from 'moment-timezone'
import UserPageContext from "../../userpage/context/UserPageContext"
import AddStoresProduct from "./product-detail/AddStoresProduct"
import {addShopsProductDetail} from "../../../services/api/shops"
import LoadingBar from "react-top-loading-bar"
import {USER_PRODUCT_STATUS, USER_PRODUCT_STATUS_TRANSFORM} from "../contants/UserProductStatus"
import createProductImage from "../../../assets/images/create-product.png"

const defaultRowNumber = "10"
const ALL_QUERY_VALUE = "All"

const ProductsTable = function (props) {
    const sessionShop = getSessionStorage(SESSION_KEY.SHOP)
    const shop_id = props.shopId || (sessionShop ? sessionShop.id : null)
    const [_products, _setProducts] = useState([])
    const [_loading, _setLoading] = useState(true)
    const [_totalProducts, _setTotalProducts] = useState(20)
    const [_page, _setPage] = useState(1)
    const [visible, setVisible] = useState(null)

    const [dateRangeChoice, setDateRangeChoice] = useState(null)
    const [dateRange, setDateRange] = useState(null)
    const [selectedStartDate, setSelectedStartDate] = useState(null)
    const [selectedEndDate, setSelectedEndDate] = useState(null)
    const CUSTOM_TIME_QUERY = '7'

    const [rowNumber, setRowNumber] = useState(defaultRowNumber)
    const [queryValue, setQueryValue] = useState(null)
    const [isActiveFilter, setIsActiveFilter] = useState(USER_PRODUCT_STATUS.ACTIVE)
    const {scrollTable} = useContext(UserPageContext)

    const [clickedProductId, setClickedProductId] = useState(null)
    const [syncModalVisible, setSyncModalVisible] = useState(false)
    const [autoRefreshProgress, setAutoRefreshProgress] = useState(0)

    const history = useHistory()

    useEffect(() => {
        _fetchProducts(1, defaultRowNumber, null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (AUTO_REFRESH_PRODUCTS_TABLE) {
            let tableRefresh = setInterval(() => _fetchProductUnsync(), 5000)
            return () => {
                clearInterval(tableRefresh)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_page, queryValue, rowNumber, _products])

    const _fetchProductByIDs = async (productIds) => {
        const productsRes = await getProductsByIds(productIds)
        setAutoRefreshProgress(80)
        const {success: productSuccess, message: productMessage, data: productsData} = productsRes
        if (!productSuccess)
            return console.log(productMessage)
        const {results: productResult} = productsData
        if (!productResult) return
        let productData = _products.map(product => {
            let newProduct = productResult.find(x => x.id === product.id)
            if (newProduct)
                return JSON.parse(JSON.stringify(newProduct))
            else
                return product
        })
        setAutoRefreshProgress(100)
        _setProducts(productData)
    }

    const _fetchProductUnsync = async () => {
        const productUnsyncIds = _products.filter(product => {
            const shop_user_product = product.shop_user_product_set.filter(x => x.sync_status !== "synced")
            return shop_user_product.length > 0
        }).map(x => x.id)
        if (productUnsyncIds.length === 0) return
        _fetchProductByIDs(productUnsyncIds)
    }


    const _fetchProducts = async (page, limit, query, since, until, isActive = isActiveFilter) => {
        _setLoading(true)
        const activeFilter = !isActive || isActive === ALL_QUERY_VALUE ? null : isActive
        const productsRes = await getAllProductsByShop(shop_id ? shop_id : null, query, page || _page, limit || rowNumber, since, until, activeFilter)

        const {success: productSuccess, message: productMessage, data: productsData} = productsRes

        if (!productSuccess) {
            Modal.error({
                content: productMessage
            })
        }

        _setTotalProducts(productsData.count)

        const {results: productResult} = productsData

        if (!productResult) return
        _setProducts(productResult)
        _setLoading(false)
    }

    const openModal = (id) => {
        setVisible(id)
    }

    const closeModal = () => {
        setVisible(null)
    }

    const _columns = [
        {
            title: '',
            dataIndex: 'preview_image_url',
            width: 102,
            align: "center",
            key: 'preview_image_url',
            render: (image, record) => {
                if (image) {
                    return (
                        <div className={'product-image-preview'} onClick={() => openModal(record.id)}>
                            <Tooltip title='Click to preview image'>
                                <Avatar shape={'square'} src={image} alt={record.title} size={60}/>
                            </Tooltip>
                        </div>
                    )
                } else {
                    const loadingIcon = <Icon type="loading" style={{fontSize: 24}} spin/>;
                    return (
                        <Tooltip title='Generating mockup'>
                            <Avatar shape="square" size={60} icon={<Spin indicator={loadingIcon}/>}/>
                        </Tooltip>
                    )
                }
            }
        },
        {
            title: 'Product',
            dataIndex: 'title',
            key: 'title',
            width: 400,
            render: (text, record) => {
                const shopUserProducts = record.shop_user_product_set
                const syncStatuses = shopUserProducts.map(shopUserProduct => shopUserProduct.sync_status)
                const syncStatusSet = new Set(syncStatuses)
                if (syncStatusSet.size === 1 && syncStatuses[0] === 'new') {
                    return text
                }
                return <React.Fragment>
                    <Link to={Paths.ProductDetail(record.id)}>{text}</Link>
                </React.Fragment>
            }
        },
        {
            title: 'Updated time',
            dataIndex: 'update_time',
            key: 'update_time',
            render: (datetime) => {
                return formatDatetime(datetime)
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                return status === USER_PRODUCT_STATUS.ACTIVE ? (
                    <CommonStatusTag status="success" tooltip="Product is active" progress="complete" text="Active"/>
                ) : (
                    <CommonStatusTag status="warning" tooltip="Product is inactive and will not be fulfilled"
                                     progress="complete" text="Inactive"/>
                )
            }
        },
        {
            title: 'Sync status',
            dataIndex: 'syncStatus',
            align: "left",
            key: 'syncStatus',
            render: (item, record) => {
                const shopUserProducts = record.shop_user_product_set
                const syncStatuses = shopUserProducts.map(shopUserProduct => shopUserProduct.sync_status)
                const syncStatusSet = new Set(syncStatuses)
                let content = null
                if (syncStatusSet.size === 1) {
                    content = (<div>
                        <ProductSyncStatusTag statusText={syncStatuses[0]}/>
                    </div>)
                } else {
                    content = (<div>
                        {Array.from(syncStatusSet.values()).map((status, idx) => {
                            // console.log("syncStatusSet", status)
                            const count = syncStatuses.filter(s => s === status).length
                            return (<ProductSyncStatusTag key={idx} statusText={status} count={count}/>)
                        })}
                    </div>)
                }
                const tooltip = (<div>
                    {shopUserProducts.map((shopProduct, index) => (
                        <div key={index} className="product-sync-status-info-item">
                            <a href={shopProduct.tracking_url} rel="noopener noreferrer">
                                {shopProduct.shop.url}
                            </a>
                            <ProductSyncStatusTag statusText={shopProduct.sync_status}/>
                        </div>
                    ))}
                </div>)
                return (<Popover placement="topLeft" content={tooltip} title="Store syncing statuses">
                    {content}
                </Popover>)
            }
        },
        {
            title: 'Sold',
            dataIndex: 'order_item_quantity',
            key: 'order_item_quantity',
            align: 'center',
            width: 100,
            render: (order_item_quantity) => {
                return (
                    <div>{order_item_quantity || 0}</div>
                )
            }
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            key: 'actions',
            align: 'center',
            render: (item, record) => {
                const hasAdminShops = record.shop_user_product_set.filter(item => item.product_id)
                const hasHandleViewShops = record.shop_user_product_set.filter(item => item.handle)

                // if (record.shop_user_product_set.length === 0) return <div/>
                let viewProductAdminAction = <div/>
                if (hasAdminShops.length === 1) {
                    viewProductAdminAction = (
                        <Button className="ant-dropdown-link"
                                href={getProductAdminInShopUrl(hasAdminShops[0].shop.url, hasAdminShops[0].product_id)}
                                type="link"
                                target={"_blank"}
                        >
                            <FontAwesomeIcon icon={faExternalLinkAlt}/>
                        </Button>
                    )
                } else if (hasAdminShops.length > 1) {
                    viewProductAdminAction = (
                        <Dropdown overlay={
                            <Menu>
                                {hasAdminShops.map((item, index) => {
                                    return (<Menu.Item key={index}>
                                        <a rel="noopener noreferrer"
                                           href={getProductAdminInShopUrl(item.shop.url, item.product_id)}
                                           target={"_blank"}>
                                            {item.shop.url}
                                        </a>
                                    </Menu.Item>)
                                })}
                            </Menu>
                        }>
                            <Button className="ant-dropdown-link" href="#" type="link" target={"_blank"}>
                                <FontAwesomeIcon icon={faExternalLinkAlt}/>
                            </Button>
                        </Dropdown>
                    )
                } else {
                    viewProductAdminAction = (
                        <Button disabled className="ant-dropdown-link"
                                type="link">
                            <FontAwesomeIcon icon={faExternalLinkAlt}/>
                        </Button>
                    )
                }


                let viewProductProductPreviewAction = <div/>
                if (hasHandleViewShops.length === 1) {
                    viewProductProductPreviewAction = (
                        <Button className="ant-dropdown-link"
                                href={getProductPreviewInShopUrl(hasHandleViewShops[0].shop.url, hasHandleViewShops[0].handle)}
                                type="link" target={"_blank"}>
                            <FontAwesomeIcon icon={faEye}/>
                        </Button>)
                } else if (hasHandleViewShops.length > 1) (
                    viewProductProductPreviewAction = (
                        <Dropdown overlay={
                            <Menu>
                                {hasHandleViewShops.map((item, index) => {
                                    return (<Menu.Item key={index}>
                                        <a rel="noopener noreferrer"
                                           href={getProductPreviewInShopUrl(item.shop.url, item.handle)}
                                           target={"_blank"}>
                                            {item.shop.url}
                                        </a>
                                    </Menu.Item>)
                                })}
                            </Menu>
                        }>
                            <Button className="ant-dropdown-link" href="#" type="link" target={"_blank"}>
                                <FontAwesomeIcon icon={faEye}/>
                            </Button>
                        </Dropdown>
                    )
                )
                else {
                    viewProductProductPreviewAction = (
                        <Button disabled className="ant-dropdown-link"
                                type="link" target={"_blank"}>
                            <FontAwesomeIcon icon={faEye}/>
                        </Button>
                    )
                }

                let duplicateProduct = (
                    <Button className="ant-dropdown-link"
                            disabled={!record.can_duplicate}
                            onClick={() => history.push(Paths.DuplicateUserProduct(record.id))}
                            type="link" style={{color: record.can_duplicate ? "#006FBB" : "#00000040"}}>
                        <FontAwesomeIcon icon={faClone}/>
                    </Button>
                )

                // const synced = record.shop_user_product_set.find(shop => shop.sync_status === 'synced')
                // let duplicateProductExeptDesign = synced ? (
                //     <Button className="ant-dropdown-link"
                //             onClick={() => history.push(Paths.DuplicateProduct(record.id))}
                //             type="link" style={{color: "#006FBB"}}>
                //         <FontAwesomeIcon icon={faClone}/>
                //     </Button>
                // ) : (
                //     <Button disabled className="ant-dropdown-link"
                //             type="link">
                //         <FontAwesomeIcon icon={faClone}/>
                //     </Button>
                // )

                const addStoreProductButton = (
                    <Button onClick={() => onClickAddStoresButton(record.id)}
                            className="ant-dropdown-link"
                            href="#"
                            type="link">
                        <FontAwesomeIcon icon={faStore}/>
                    </Button>
                )

                return <div>
                    <Tooltip title="Sync this product to stores">
                        {addStoreProductButton}
                    </Tooltip>
                    <Tooltip title="Visit Product Admin Page">
                        {viewProductAdminAction}
                    </Tooltip>
                    <Tooltip title="Visit Product Preview Page">
                        {viewProductProductPreviewAction}
                    </Tooltip>
                    <Tooltip title="Duplicate This Product">
                        {duplicateProduct}
                    </Tooltip>
                    {/*<Tooltip title="Duplicate This Product (Except Design)">*/}
                    {/*    {duplicateProductExeptDesign}*/}
                    {/*</Tooltip>*/}

                    <Tooltip title="Remove this products">
                        <DeleteProductButton params={[_page, rowNumber, queryValue]} refresh={() => {
                            _fetchProductByIDs([record.id])
                        }}
                                             userProductId={record.id} type={"list"}
                                             isActive={record.status === USER_PRODUCT_STATUS.ACTIVE}
                                             userProductName={record.title}
                                             shopUserProducts={record.shop_user_product_set}/>
                    </Tooltip>
                    <BulkResyncProductButton userProductId={record.id} displayType={"list"}
                                             isActive={record.status === USER_PRODUCT_STATUS.ACTIVE}
                                             refresh={() => {
                                                 _fetchProductByIDs([record.id])
                                             }}
                                             shopUserProducts={record.shop_user_product_set}/>
                </div>
            }
        },
    ]

    const disambiguateLabel = (key, value) => {
        switch (key) {
            case 'dateRange':
                if (value.range) {
                    return `${value.range}`
                } else {
                    return `${DATE_RANGE[value.choice]}`
                }
            case 'isActiveFilter':
                return `Status: ${USER_PRODUCT_STATUS_TRANSFORM[value]}`
            default:
                return value
        }
    }

    const isEmpty = (value) => {
        if (Array.isArray(value)) {
            return value.length === 0
        } else {
            return value === '' || value == null
        }
    }

    const appliedFilters = []

    const _onPageChange = (page) => {
        _setProducts([])
        _setPage(page)
        _fetchProducts(page, rowNumber, queryValue, selectedStartDate, selectedEndDate)
    }

    const handleFiltersQueryChange = (value) => {
        setQueryValue(value)
        _fetchProducts(1, rowNumber, value, selectedStartDate, selectedEndDate)
    }

    const handleActiveFilterChange = (value) => {
        setIsActiveFilter(value[0])
        _fetchProducts(1, rowNumber, queryValue, selectedStartDate, selectedEndDate, value[0])
    }

    const handleRowNumberChange = (value) => {
        setRowNumber(value[0])
        _fetchProducts(1, value[0], queryValue, selectedStartDate, selectedEndDate)
    }

    const handleQueryValueRemove = () => {
        setQueryValue(null)
        _fetchProducts(1, rowNumber, null, selectedStartDate, selectedEndDate)
    }

    const handleActiveFilterRemove = () => {
        setIsActiveFilter(ALL_QUERY_VALUE)
        _fetchProducts(1, rowNumber, queryValue, selectedStartDate, selectedEndDate, ALL_QUERY_VALUE)
    }


    const handleDateRangeChoiceChange = (value) => {
        // // alert(value)
        setDateRangeChoice(value[0])
        setDateRange(null)
        _setPage(1)
        let {since, until} = formatTimeSelect(value[0])
        setSelectedStartDate(since)
        setSelectedEndDate(until)
        return _fetchProducts(1, rowNumber, queryValue, since, until)
    }
    const renderCustomDateRange = () => {
        return dateRangeChoice === CUSTOM_TIME_QUERY ? (
            <div className={'mt-2'}>
                <div>
                    <div className={'mb-3'}>Start Date</div>
                    <Calendar
                        date={selectedStartDate ? new Date(selectedStartDate) : null}
                        onChange={handleStartDateSelect}
                        color={'#5C6AC4'}
                    />
                </div>
                <div>
                    <div className={'my-3'}>End Date</div>
                    <Calendar
                        date={selectedEndDate ? new Date(selectedEndDate) : null}
                        onChange={handleEndDateSelect}
                        color={'#5C6AC4'}
                    />
                </div>

            </div>
        ) : null
    }

    const handleStartDateSelect = (date) => {
        setSelectedStartDate(moment(date.toISOString()).startOf("day").toISOString())
        if (selectedEndDate) {
            setDateRange(`${formatShortDate(date)} - ${formatShortDate(new Date(selectedEndDate))}`)
            _setPage(1)
            return _fetchProducts(1, rowNumber, queryValue, date.toISOString(), selectedEndDate)
        }
    }

    const handleEndDateSelect = (date) => {
        const endTime = moment(date.toISOString()).endOf("day").toISOString()
        setSelectedEndDate(endTime)
        if (selectedStartDate) {
            setDateRange(`${formatShortDate(new Date(selectedStartDate))} - ${formatShortDate(date)}`)
            _setPage(1)
            return _fetchProducts(1, rowNumber, queryValue, selectedStartDate, endTime)
        }
    }


    const handleDateRangeRemove = () => {
        setDateRange(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        setDateRangeChoice(null)
        _setPage(1)
        _fetchProducts(1, rowNumber, queryValue, null, null)
    }


    const handleFiltersClearAll = useCallback(() => {
        setQueryValue(null)
        setRowNumber(defaultRowNumber)
        setIsActiveFilter(ALL_QUERY_VALUE)
        setDateRange(null)
        setDateRangeChoice(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        _setPage(1)
        _fetchProducts(1, defaultRowNumber, null, null, null)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // console.log('reload')


    if (!isEmpty(isActiveFilter)) {
        const key = 'isActiveFilter'
        if (isActiveFilter !== ALL_QUERY_VALUE) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, isActiveFilter),
                onRemove: handleActiveFilterRemove,
            })
        }
    }

    if (!isEmpty(dateRangeChoice)) {
        const key = 'dateRange'
        if (dateRangeChoice !== CUSTOM_TIME_QUERY && dateRangeChoice !== null) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, {choice: dateRangeChoice, range: null}),
                onRemove: handleDateRangeRemove,
            })
        } else if (dateRangeChoice === CUSTOM_TIME_QUERY) {
            if (!isEmpty(dateRange)) {
                appliedFilters.push({
                    key,
                    label: disambiguateLabel(key, {choice: dateRangeChoice, range: dateRange}),
                    onRemove: handleDateRangeRemove,
                })
            } else {
                appliedFilters.push({
                    key,
                    label: disambiguateLabel(key, {choice: dateRangeChoice, range: null}),
                    onRemove: handleDateRangeRemove,
                })
            }
        }
    }

    const filters = [
        {
            key: 'dateRange',
            label: 'Date',
            filter: (
                <div>
                    <ChoiceList
                        title="Date"
                        titleHidden
                        choices={[
                            {label: 'Today', value: '1'},
                            {label: 'Yesterday', value: '2'},
                            {label: 'Last 7 days', value: '3'},
                            {label: 'Last 30 days', value: '4'},
                            {label: 'Last 90 days', value: '5'},
                            {label: 'Last 12 months', value: '6'},
                            {label: 'Custom', value: '7'},
                        ]}
                        selected={dateRangeChoice || []}
                        onChange={handleDateRangeChoiceChange}
                        // allowMultiple
                    />
                    <div>
                        {
                            renderCustomDateRange()
                        }
                    </div>
                </div>
            ),
            // shortcut: true,
        },
        {
            key: 'isActiveFilter',
            label: 'Status',
            filter: (
                <ChoiceList
                    title="Status"
                    titleHidden
                    choices={[
                        {label: ALL_QUERY_VALUE, value: ALL_QUERY_VALUE},
                        {label: 'Active', value: USER_PRODUCT_STATUS.ACTIVE},
                        {label: 'Inactive', value: USER_PRODUCT_STATUS.INACTIVE}
                    ]}
                    selected={isActiveFilter || []}
                    onChange={handleActiveFilterChange}
                    // allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: 'rowNumber',
            label: 'Items per page',
            filter: (
                <ChoiceList
                    title="Items per page"
                    titleHidden
                    choices={[
                        {label: '5', value: '05'},
                        {label: '10', value: '10'},
                        {label: '20', value: '20'},
                        {label: '30', value: '30'},
                        {label: '50', value: '50'},
                    ]}
                    selected={rowNumber || defaultRowNumber}
                    onChange={handleRowNumberChange}
                    // allowMultiple
                />
            ),
            shortcut: true,
        }
    ]

    const saveStoresProduct = async (userProductId, shops) => {
        const respone = await addShopsProductDetail(userProductId, {shop_ids: shops})
        if (respone.success) {
            notification.success({
                message: "Success",
                description: "Add stores successfully"
            })
            _fetchProductByIDs([clickedProductId])
        } else notification.error({
            message: "Error",
            description: "An error occurred when creating this product. Please try again or contact our support team."
        })

    }

    const onClickAddStoresButton = (id) => {
        setClickedProductId(id)
        setSyncModalVisible(true)
    }

    const onClickCloseSyncModal = () => {
        setClickedProductId(null)
        setSyncModalVisible(false)
    }

    const tableContent = () => {
        if (_products.length > 0) {
            return (
                <Table
                    dataSource={_products}
                    loading={_loading}
                    columns={_columns}
                    rowClassName={record => {
                        if (!record.preview_image_url) {
                            return "artwork-pending"
                        } else {
                            return ""
                        }
                    }}
                    {...scrollTable}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: event => {
                            }, // click row
                            onDoubleClick: event => {
                            }, // double click row
                            onContextMenu: event => {
                            }, // right button click row
                            onMouseEnter: event => {
                            }, // mouse enter row
                            onMouseLeave: event => {
                            }, // mouse leave row
                        };
                    }}
                    pagination={{
                        onChange: _onPageChange,
                        total: _totalProducts,
                        pageSize: parseInt(rowNumber),
                        current: _page,
                        showQuickJumper: true,
                        showSizeChanger: false
                    }}
                    rowKey="id"
                />
            )
        } else {
            if (_loading) {
                return (
                    <Table
                        loading={_loading}
                        columns={_columns}
                    />
                )
            } else {
                if (queryValue === null && (isActiveFilter === USER_PRODUCT_STATUS.ACTIVE || isActiveFilter === ALL_QUERY_VALUE) && selectedStartDate === null && selectedEndDate === null) {
                    return (
                        <Empty
                            style={{padding: '2rem'}}
                            description="You don't have any product"
                            imageStyle={{height: 80}}
                            image={createProductImage}
                        >
                            <Link to={{pathname: Paths.NewProduct, deleteSession: true}}>
                                <ButtonPolaris primary>Create product</ButtonPolaris>
                            </Link>
                        </Empty>
                    )
                } else {
                    return (
                        <Table
                            columns={_columns}
                            dataSource={[]}
                        />
                    )
                }
            }
        }

    }

    return (
        <div>
            <LoadingBar height={2} waitingTime={500} color='#1d9ba4' progress={autoRefreshProgress}
                        onLoaderFinished={() => setAutoRefreshProgress(0)}/>
            <Card className={"shopifilize-card"}>
                <Card.Section>
                    <Stack>
                        <Stack.Item fill>
                            <Filters
                                queryPlaceholder={'Product Title, Description'}
                                queryValue={queryValue}
                                filters={filters}
                                appliedFilters={appliedFilters}
                                onQueryChange={handleFiltersQueryChange}
                                onQueryClear={handleQueryValueRemove}
                                onClearAll={handleFiltersClearAll}
                            />
                        </Stack.Item>
                        <Stack.Item>
                            <TableStatus loading={_loading} amount={_totalProducts} objectName={"product"}
                                         verboseObjectName={"products"}/>
                        </Stack.Item>
                    </Stack>
                </Card.Section>
                <div className="shopifilize-table ">
                    {tableContent()}
                </div>
            </Card>
            {visible !== null && <CarouselImage productId={visible} closeModal={closeModal}/>}
            {
                syncModalVisible &&
                <AddStoresProduct visible={syncModalVisible} setVisible={setSyncModalVisible}
                                  onClose={onClickCloseSyncModal} saveShops={saveStoresProduct}
                                  userProductId={clickedProductId}/>
            }
        </div>
    )
}

// export default Form.create({name: 'products-table'})(ProductsTable)
export default ProductsTable
