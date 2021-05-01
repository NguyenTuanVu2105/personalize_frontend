import React from 'react'
import {DropTarget} from 'react-dnd'
import {DEFAULT_DRAG} from "../../../../../constants/constants"

const ArtworkItemContainer = ({
                                  isOver,
                                  allowedDropEffect,
                                  currentDrag,
                                  constraints,
                                  connectDropTarget,
                                  onClick,
                                  children,
                                  isFocused,
                                  isSupported,
                                  isProcessing,
                                  maxSize
                              }) => {
    const canDrop =  (currentDrag.width === DEFAULT_DRAG.width && currentDrag.height === DEFAULT_DRAG.height) || (constraints.width === currentDrag.width && constraints.height === currentDrag.height)

    return connectDropTarget(
        <div
            className={`file-item-container ${isFocused ? 'file-item-focused' : 'file-item'} ${canDrop ? "can-drop" : "can-not-drop"} ${isSupported ? '' : 'unsupported'} ${isProcessing ? 'processing' : 'processed'}`}
            onClick={onClick}
            style={{maxHeight: maxSize, maxWidth: maxSize, minWidth: Math.min(70, maxSize)}}
        >
            {children}
        </div>,
    )
}
export default DropTarget(
    'artwork',
    {
        drop: ({sideId, userProductIndex}) => ({
            sideId,
            userProductIndex
        }),
    },
    (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
    }),
)(ArtworkItemContainer)
