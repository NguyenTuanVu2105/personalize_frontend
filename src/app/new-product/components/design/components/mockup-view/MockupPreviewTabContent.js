import DesignMockupPreview from "../DesignMockupPreview"
import {Card} from "@shopify/polaris"
import React, {useContext, useState} from "react"
import _ from "lodash"
import NewProductContext from "../../../../context/NewProductContext"
import BackgroundCustomizationModal from "./BackgroundCustomizationModal"
import NewProductDesignContext from "../../context/NewProductDesignContext"

const MockupPreviewTabContent = (props) => {
    const {product} = useContext(NewProductContext)
    const [hasMockup, setHasMockup] = useState(false)

    const mockupInfos = product.abstract.mockup_infos
    const {designState} = useContext(NewProductDesignContext)
    const userProduct = product.userProducts[designState.currentProductIndex] || {}

    const disableChangeBackground = () => {
        let mockupInfoIds = userProduct.previews ? userProduct.previews.map(item => item.mockup_info_id) : []
        mockupInfoIds = _.uniq(mockupInfoIds)
        const filteredMockupInfos = mockupInfos.filter(info => mockupInfoIds.includes(info.id))
        const isMaskValid = filteredMockupInfos && filteredMockupInfos.length > 0 ? filteredMockupInfos.every(mockupInfo => {
            const mockupInfoMeta = mockupInfo.meta
            return mockupInfoMeta.mockup_infos.every(item => !!item.mask)
        }) : false
        return !(hasMockup && isMaskValid)
    }

    const actions = disableChangeBackground() ? [] : [{
        content: <BackgroundCustomizationModal/>
    }]

    return (
        <Card title="Mockup Preview" sectioned actions={actions}>
            <div className={'design-section'}>
                <DesignMockupPreview setHasMockup={setHasMockup}/>
            </div>
        </Card>
    )
}

export default MockupPreviewTabContent