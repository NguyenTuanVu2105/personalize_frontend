import React from "react"
import './TicketAttachment.scss'
import { FileIcon, defaultStyles } from 'react-file-icon'
import {Icon} from 'antd'

const TicketAttachment = ({file, _delete , index}) => {

    const handleDelete = () =>{
        _delete(file,index)
    }


    const extension = () =>{
        let split = file.name.toString().split(".")
        let ex = split[split.length - 1]
        return ex
    }

    function getReadableFileSizeString(fileSizeInBytes) {
        let i = 0;
        let byteUnits = [' Byte', ' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
        while (fileSizeInBytes > 1024){
            fileSizeInBytes = fileSizeInBytes / 1024;
            i++;
        }

        return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
    }

    const download = () =>{
        window.open(file.attachment_url,'_blank')
    }

    const action = () => {
        if (_delete){
            return (
                <div className={"action close"}>
                    <Icon className={"icon"} type="close-circle" onClick={handleDelete}/>
                </div>
            )
        }else {
            return (
                <div className={"action download"}>
                    <Icon className={"icon"} type="download" onClick={download}/>
                </div>
            )
        }
    }




    return (
        <div className={'ticket-attachment'} onClick={_delete ? ()=>{} :download}>
            <div className={"file-image"}>
                <FileIcon extension={extension()} {...defaultStyles[extension()]}/>
            </div>
            <div>
                <div className={"file-name"}><b>{file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}</b></div>
                <div className={"file-size"}>{getReadableFileSizeString(file.size)}</div>
            </div>
            {action()}
        </div>
    )
}

export default TicketAttachment