import React from 'react'
import {DragSource} from 'react-dnd'
import {Tooltip, Spin, Icon} from 'antd'
import {LAYER_TYPE} from "../../../../../constants/constants"
import textIcon from "../../../../../../../assets/images/textBlack.svg"

const DraggableArtworkItem = ({
                                  name,
                                  isDragging,
                                  connectDragSource,
                                  artwork,
                                  onClickRemove,
                                  dragDisabled,
                                  errorMessage,
                                  constraints,
                                  id
                              }) => {

    return connectDragSource(
        <div className={`sub-file-item `} id={id}>
            {
                errorMessage
                    ? (
                        <Tooltip placement="leftTop" title={errorMessage}>
                            {
                                artwork.data ? <img src={artwork.data} alt={artwork.name} className={'file-content'}/>
                                    : <div className="d-flex align-items-center justify-content-center"
                                           style={{width: '100%', height: '100%'}}>
                                        <Spin indicator={<Icon type="loading" style={{fontSize: 24}} spin/>}/>
                                    </div>
                            }
                        </Tooltip>
                    )
                    : (
                        artwork.type === LAYER_TYPE.text
                            ? (<img src={textIcon} alt={artwork.name} className={'file-content'}/>)
                            : (
                                artwork.data
                                    ? (<img src={artwork.data} alt={artwork.name} className={'file-content'}/>)
                                    : (
                                        <div className="d-flex align-items-center justify-content-center"
                                             style={{width: '100%', height: '100%'}}>
                                            <Spin indicator={<Icon type="loading" style={{fontSize: 24}} spin/>}/>
                                        </div>
                                    )
                            )
                    )
            }


            {/*<Tooltip title="Remove Artwork">*/}
            {/*    <FontAwesomeIcon*/}
            {/*        onClick={(e) => {*/}
            {/*            e.stopPropagation()*/}
            {/*            onClickRemove()*/}
            {/*        }}*/}
            {/*        icon={faTimesCircle}*/}
            {/*        className="file-remove-btn"*/}
            {/*    />*/}
            {/*</Tooltip>*/}
        </div>
    )
}
export default DragSource(
    'artwork',
    {
        beginDrag: (props) => {
            if (props.beginDrag)
                props.beginDrag()
            return {
                name: props.name,
                artwork: props.artwork,
                onDragged: props.onDragged
            }
        },
        endDrag(props, monitor) {
            const item = monitor.getItem()
            const dropResult = monitor.getDropResult()
            if (dropResult) {
                item.onDragged(dropResult.sideId, dropResult.userProductIndex)
            } else {
                if (props.failDrag) {
                    props.failDrag()
                }
            }
        },
        canDrag: props => !props.dragDisabled,

    },
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    }),
)(DraggableArtworkItem)
