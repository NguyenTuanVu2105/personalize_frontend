import React, {useState} from 'react'
import {Button} from "antd"
import VariantMappingModal from "./VariantMappingModal"

const EcomerceChooseVariantMapping = function (props) {
    const [visible, setVisible] = useState(false)
    // mapping variant

    return (
        <div>
            <Button type='primary' style={{marginRight: '10px'}} onClick={() => {setVisible(true)}}>Choose variant</Button>
            <Button>Ignore variant</Button>
            <VariantMappingModal visible={visible} setVisible={setVisible} variant={props.variant} fetchData={props.fetchData}></VariantMappingModal>
        </div>
    )
}

export default EcomerceChooseVariantMapping
