import React, {useCallback, useContext, useEffect, useState} from 'react'
import Paths from '../../../routes/Paths'
import UserPageContext from '../../userpage/context/UserPageContext'
import {Avatar, Icon, notification, Spin, Table} from 'antd'
import './Artwork.scss'
import {formatDatetime, formatShortDate} from '../../../services/util/datetime'
import ArtworkUpdate from './ArtworkUpdate'
import ArtworkHistory from './ArtworkHistory'
import {
    Button,
    ButtonGroup,
    Card,
    ChoiceList,
    DisplayText,
    Filters,
    Modal,
    Stack,
    TextContainer
} from '@shopify/polaris'
import {artworkBulkActive, artworkBulkDeactive} from '../../../services/api/artworkUpdate'
import CommonStatusTag from '../../shared/CommonStatusTag'
import TableStatus from "../../shared/TableStatus"
import ArtworkDeactivate from './ArtworkDeactivate'
import {Calendar} from "react-date-range"
import {DATE_RANGE} from "../../orders/constants"
import {formatTimeSelect} from "../../../shared/formatTime"
import moment from 'moment-timezone'
import {getAllArtworks} from "../../../services/api/artwork"
import {
    ARTWORK_REVERSED_STATUSES,
    ALL_QUERY_INDEX,
    ARTWORK_STATUS_CODES,
    SERVER_ALL_QUERY_INDEX
} from "../constants/artworkStatuses"
import AppContext from "../../../AppContext"
import UploadArtworkModal from "./UploadArtworkModal";

const antIcon = <Icon type="loading" style={{fontSize: 16}} spin/>
const defaultRowNumber = "10"


const Artworks = (props) => {
    const [artworks, setArtworks] = useState([])
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [visibleDelete, setVisibleDelete] = useState(false)

    const [sizes, setSizes] = useState([])
    const {setNameMap, scrollTable} = useContext(UserPageContext)
    const {setLoading: setAppLoading} = useContext(AppContext)
    const [_loading, _setLoading] = useState(true)
    const [_totalArtworks, _setTotalArtworks] = useState(20)
    const [_page, _setPage] = useState(1)

    const [size, setSize] = useState([])
    const [tmpSize, setTmpSize] = useState(null)
    const [activeStatus, setActiveStatus] = useState(ALL_QUERY_INDEX)
    const [rowNumber, setRowNumber] = useState(defaultRowNumber)
    const [queryValue, setQueryValue] = useState(null)

    const [dateRangeChoice, setDateRangeChoice] = useState(null)
    const [dateRange, setDateRange] = useState(null)
    const [selectedStartDate, setSelectedStartDate] = useState(null)
    const [selectedEndDate, setSelectedEndDate] = useState(null)

    const [modalVisible, setModalVisible] = useState(false)
    const CUSTOM_TIME_QUERY = '7'

    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.Artworks]: 'Artworks'
        })
        _fetchData(1, defaultRowNumber, null, null, null, null, null, ALL_QUERY_INDEX)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const _fetchData = async (page, limit = 10, query, sizes = size, display, since = null, until = null, setSize = false) => {
        _setLoading(true)
        // console.log(since)
        // console.log(until)
        const displayStatusQuery = display === ALL_QUERY_INDEX ? SERVER_ALL_QUERY_INDEX : display

        let reqSize = null

        if (!isEmpty(sizes)) {
            reqSize = sizes.map((size) => `${size.width}x${size.height}`).join(',')
        }

        const {data: artworkData} = await getAllArtworks(page, limit, query, reqSize, displayStatusQuery, since, until)

        const {count: artworkCount, results: artworkResult, options: optionResult} = artworkData
        _setTotalArtworks(artworkCount)

        const artworks = await Promise.all(artworkResult.map(async (artwork) => {
            const {id, file_url, name, status, update_time, width, height} = artwork
            return ({
                id,
                file_url, name, status, update_time, width, height,
                size: `${width} x ${height} px`
            })
        }))

        if (setSize) {
            const sizeResult = optionResult.sizes
            const sizes = await Promise.all(sizeResult.map(async (size) => {
                const {width, height} = size
                return ({
                    label: `${width} x ${height} px`,
                    value: `${width}x${height}`
                })
            }))

            setSizes(sizes)
        }
        setArtworks(artworks)
        _setLoading(false)
        setAppLoading(false)
    }

    const onSelectChange = selectedRowKeys => {
        setSelectedRowKeys(selectedRowKeys)
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    }

    const hasSelected = selectedRowKeys.length > 0

    const _onPageChange = (page) => {
        setArtworks([])
        _setPage(page)
        _fetchData(page, defaultRowNumber, queryValue, size, activeStatus, selectedStartDate, selectedEndDate)
    }

    const setLoading = (loading) => {
        _setLoading(loading)
    }

    const _columns = [
        {
            title: '',
            dataIndex: 'file_url',
            width: 110,
            key: 'file_url',
            render: (image, record) => {
                if (image)
                    return (<Avatar shape="square" size={75} src={image} className={'border-avatar'}/>)
                // return (<img src={image} alt={record.title} height={72}/>)
                else
                    return (<Spin size={'small'} indicator={antIcon}>
                        <Avatar shape="square" size={72} icon="file-image"/>
                    </Spin>)
            }
        },
        {
            title: 'Artwork name',
            dataIndex: 'name',
            key: 'name',
            width: 400,
            render: (text, record) => (
                <React.Fragment>
                    <ArtworkHistory artworkId={record.id} artworkName={text}/>
                </React.Fragment>
            )
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                return (status === ARTWORK_STATUS_CODES.ACTIVE ?
                    <CommonStatusTag status="success" tooltip="Artwork is active" progress="complete" text="Active"/> :
                    <CommonStatusTag status="warning"
                                     tooltip="Artwork is inactive and will not be shown when you create products"
                                     progress="complete" text="Inactive"/>)
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
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            align: 'center',
            render: (artworkId, record) => {
                return (
                    <div className="flex-center">
                        <ArtworkUpdate onUpdate={setLoading} artwork={record}
                                       reloadData={() => _fetchData(1, rowNumber)}/>
                        <ArtworkDeactivate onUpdate={setLoading} artwork={record}
                                           reloadData={() => _fetchData(1, rowNumber)}/>
                    </div>

                )
            }
        }
    ]

    const handleSizeFilterChange = (value) => {
        setTmpSize(value)
        const sizes = value.map((size) => {
            const splitedSize = size.split('x')
            return {
                width: splitedSize[0],
                height: splitedSize[1]
            }
        })

        setSize(sizes)
        _fetchData(1, rowNumber, queryValue, sizes, activeStatus, selectedStartDate, selectedEndDate)
    }

    const handleActiveStatusChange = (value) => {
        setActiveStatus(value[0])
        _fetchData(1, rowNumber, queryValue, size, value[0], selectedStartDate, selectedEndDate)
    }

    const handleFiltersQueryChange = (value) => {
        setQueryValue(value)
        _fetchData(1, rowNumber, value, size, activeStatus, selectedStartDate, selectedEndDate)
    }

    const handleRowNumberChange = (value) => {
        setRowNumber(value[0])
        _fetchData(1, value[0], queryValue, size, activeStatus, selectedStartDate, selectedEndDate)
    }

    const handleSizeFilterRemove = () => {
        setTmpSize([])
        setSize([])
        _fetchData(1, rowNumber, queryValue, null, activeStatus, selectedStartDate, selectedEndDate)
    }

    const handleActiveStatusRemove = () => {
        setActiveStatus(null)
        _fetchData(1, rowNumber, queryValue, size, null, selectedStartDate, selectedEndDate)

    }

    const handleQueryValueRemove = () => {
        setQueryValue(null)
        _fetchData(1, rowNumber, null, size, activeStatus, selectedStartDate, selectedEndDate)
    }

    const handleFiltersClearAll = useCallback(() => {
        setSize([])
        setActiveStatus(null)
        setQueryValue(null)
        setRowNumber(defaultRowNumber)
        setDateRange(null)
        setDateRangeChoice(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        _setPage(1)
        _fetchData(1, defaultRowNumber, null, null, null, null, null)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleDateRangeChoiceChange = (value) => {
        // // alert(value)
        setDateRangeChoice(value[0])
        setDateRange(null)
        _setPage(1)
        let {since, until} = formatTimeSelect(value[0])
        setSelectedStartDate(since)
        setSelectedEndDate(until)
        return _fetchData(1, rowNumber, queryValue, size, activeStatus, since, until)
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
            return _fetchData(1, rowNumber, queryValue, date.toISOString(), selectedEndDate)
        }
    }

    const handleEndDateSelect = (date) => {
        const endTime = moment(date.toISOString()).endOf("day").toISOString()
        setSelectedEndDate(endTime)
        if (selectedStartDate) {
            setDateRange(`${formatShortDate(new Date(selectedStartDate))} - ${formatShortDate(date)}`)
            _setPage(1)
            return _fetchData(1, rowNumber, queryValue, size, activeStatus, selectedStartDate, endTime)
        }
    }


    const handleDateRangeRemove = () => {
        setDateRange(null)
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        setDateRangeChoice(null)
        _setPage(1)
        _fetchData(1, rowNumber, queryValue, size, activeStatus, null, null)
    }

    const disambiguateLabel = (key, value) => {
        switch (key) {
            case 'dateRange':
                if (value.range) {
                    return `${value.range}`
                } else {
                    return `${DATE_RANGE[value.choice]}`
                }
            case 'activeStatus':
                return `Active Status: ${ARTWORK_REVERSED_STATUSES[value]}`
            case 'size':
                return "Size: " + value.map((val) => `${val.width} x ${val.height} px`).join(', ');
            // case 'rowNumber':
            //     return `Item per page: ${value}`
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

    if (!isEmpty(size)) {
        const key = 'size'
        if (size !== []) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, size),
                onRemove: handleSizeFilterRemove,
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

    if (!isEmpty(activeStatus)) {
        const key = 'activeStatus'
        if (activeStatus !== ALL_QUERY_INDEX) {
            appliedFilters.push({
                key,
                label: disambiguateLabel(key, activeStatus),
                onRemove: handleActiveStatusRemove,
            })
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
            key: 'activeStatus',
            label: 'Status',
            filter: (
                <ChoiceList
                    title="Active Status"
                    titleHidden
                    choices={[
                        // {label: 'All', value: ALL_QUERY_INDEX},
                        {label: 'Active', value: ARTWORK_STATUS_CODES.ACTIVE},
                        {label: 'Inacive', value: ARTWORK_STATUS_CODES.INACTIVE},
                    ]}
                    selected={activeStatus || ALL_QUERY_INDEX}
                    onChange={handleActiveStatusChange}
                    // allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: 'size',
            label: 'Size',
            filter: (
                <ChoiceList
                    title="Size"
                    titleHidden
                    choices={sizes}
                    selected={tmpSize || []}
                    onChange={handleSizeFilterChange}
                    allowMultiple
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
                    selected={rowNumber || '10'}
                    onChange={handleRowNumberChange}
                    // allowMultiple
                />
            ),
            // shortcut: true,
        }
    ]

    const onClickBulkActive = async () => {
        const {data} = await artworkBulkActive(selectedRowKeys)
        if (data.success) {
            notification.success({
                message: 'Active successfully',
            })
            _fetchData('1', rowNumber, null)
        } else {
            notification.error({
                message: 'An error occurred, please try again',
            })
        }
    }

    const onClickBulkDeactive = () => {
        setVisibleDelete(true)
    }

    const handleDelete = async (e) => {
        const {data} = await artworkBulkDeactive(selectedRowKeys)
        if (data.success) {
            setVisibleDelete(false)
            notification.success({
                message: 'Deactive successfully',
            })
            _fetchData('1', rowNumber, null)
        } else {
            notification.error({
                message: 'An error occurred, please try again',
            })
        }
    }

    const openModal = () => {
        setModalVisible(true);
    }

    return (
        <div>
            {/*<DocTitle>{_loading ? 'Loading...' : 'Artworks'}</DocTitle>*/}
            <div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <TextContainer spacing="tight">
                        <DisplayText element="h3" size="large">Artworks</DisplayText>
                        <p>
                            All your artworks are listed below
                        </p>
                    </TextContainer>
                    <div className="btn-heading">
                        <Button
                            onClick={openModal} primary>Upload artwork</Button>
                        <UploadArtworkModal
                            visible={modalVisible}
                            setVisible={setModalVisible}
                            onSuccess={() => {
                                _fetchData(1, defaultRowNumber, null, null, null, null, null, ALL_QUERY_INDEX)
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="page-main-content">
                <Card className={'artwork-card shopifilize-card'}>
                    <Card.Section>
                        <Stack>
                            <Stack.Item fill>
                                <Filters
                                    queryPlaceholder={'Artwork Name, ID'}
                                    queryValue={queryValue}
                                    filters={filters}
                                    appliedFilters={appliedFilters}
                                    onQueryChange={handleFiltersQueryChange}
                                    onQueryClear={handleQueryValueRemove}
                                    onClearAll={handleFiltersClearAll}
                                />
                            </Stack.Item>
                            <Stack.Item>
                                <TableStatus loading={_loading} amount={_totalArtworks} objectName={"artwork"}
                                             verboseObjectName={"artworks"}/>
                            </Stack.Item>
                        </Stack>
                    </Card.Section>
                    <Card.Section>
                        {hasSelected ? (
                            <ButtonGroup segmented>
                                <Button size="slim" disabled>Selected {selectedRowKeys.length} items</Button>
                                <Button size="slim" onClick={onClickBulkActive}>Activate Artworks</Button>
                                <Button size="slim" destructive onClick={onClickBulkDeactive}>Deactivate
                                    Artworks</Button>
                            </ButtonGroup>
                        ) : ''}
                    </Card.Section>
                    <div className="shopifilize-table">
                        <Table
                            dataSource={artworks}
                            loading={_loading}
                            rowSelection={rowSelection}
                            columns={_columns}
                            {...scrollTable}
                            pagination={{
                                onChange: _onPageChange,
                                total: _totalArtworks,
                                pageSize: parseInt(rowNumber),
                                current: _page,
                                showQuickJumper: true,
                                showSizeChanger: false
                            }}
                            rowKey="id"
                        />
                    </div>
                    <Modal
                        open={visibleDelete}
                        onClose={() => {
                            setVisibleDelete(false)
                        }}
                        title="Deactive Artwork"
                        primaryAction={{
                            content: 'Confirm',
                            onAction: handleDelete,
                            // loading: loading
                        }}
                        secondaryActions={[
                            {
                                content: 'Cancel',
                                onAction: () => {
                                    setVisibleDelete(false)
                                },
                            },
                        ]}

                    >
                        <Modal.Section>
                            <p>Are you sure to deactive this artwork?</p>
                        </Modal.Section>
                    </Modal>
                </Card>
            </div>
        </div>
    )
}

export default Artworks
