import React, {useState} from 'react'
import {Avatar, Icon, Spin, Table} from 'antd'
import {Link} from "react-router-dom"
import {formatDatetime} from "../../../services/util/datetime"
import {artworkHistory} from "../../../services/api/artworkHistory"
import './ArtworkHistory.scss'
import {Modal} from '@shopify/polaris'

const antIcon = <Icon type="loading" style={{fontSize: 16}} spin/>
const pageSize = 3

const ArtworkHistory = (props) => {
    const [visibleHistory, setVisibleHistory] = useState(false)
    const [_loading, _setLoading] = useState(true)
    const artworkId = props.artworkId
    const artworkName = props.artworkName
    const [artworkHistories, setArtworkHistories] = useState([])
    const [artworkHistoriesCount, setArtworkHistoriesCount] = useState([])

    const _fetchData = async (page, limit = pageSize) => {
        _setLoading(true)
        const {success, data: artworkHistoryData} = await artworkHistory(artworkId, page, limit)
        if (success) {
            const {count: resultCount, results: artworkHistoryResult} = artworkHistoryData
            setArtworkHistoriesCount(resultCount)
            const history = await Promise.all(artworkHistoryResult.map(async (artworkHistory) => {
                const {id, original_image_url, original_name, create_time, original_width, original_height} = artworkHistory
                return ({
                    id, original_image_url, original_name, create_time,
                    size: `${original_width} x ${original_height} px`
                })
            }))

            setArtworkHistories(history)
            _setLoading(false)
        }
    }

    const showArtworkHistory = () => {
        _fetchData(1)
        setVisibleHistory(true)
    }

    const _onPageChange = (page) => {
        showArtworkHistory([])
        _fetchData(page)
    }

    const _columns = [
        {
            title: '',
            dataIndex: 'original_image_url',
            width: 110,
            key: 'original_image_url',
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
            title: 'Artwork Name',
            dataIndex: 'original_name',
            key: 'original_name',
            width:300,
            render: (text, record) => (
                <React.Fragment>
                    <h6>{text}</h6>
                </React.Fragment>
            )
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            // render: (text, record) => (
            //     <React.Fragment>
            //         <h6>{text}</h6>
            //     </React.Fragment>
            // )
        },
        {
            title: 'Replace time',
            dataIndex: 'create_time',
            key: 'create_time',
            render: (datetime) => {
                return formatDatetime(datetime)
            }
        }
    ]

    return (
        <div>
            <div className="flex-start">
                <Link to={'#'} onClick={showArtworkHistory}>{artworkName}</Link>
            </div>
            <Modal
                open={visibleHistory}
                onClose={() => {
                    setVisibleHistory(false)
                }}
                title="Artwork History"
                primaryAction={{
                    content: 'OK',
                    onAction: () => {
                        setVisibleHistory(false)
                    },
                }}
            >
                <Table dataSource={artworkHistories} loading={_loading} columns={_columns} rowKey={record => record.id}
                       pagination={{
                           onChange: _onPageChange,
                           total: artworkHistoriesCount,
                           pageSize: pageSize,
                           showSizeChanger: false
                       }}/>


            </Modal>
        </div>
    )
}

export default ArtworkHistory