import React from 'react'
import {ContextualSaveBar, Frame} from "@shopify/polaris"
import './ContextualSaveBarHeader.scss'

const ContextualSaveBarHeader = ({onSave, onDiscard, message, saveContent, saveLoading, saveDisabled, fullWidth = true}) => {
    return <div className='contextual-frame'>
        <Frame>
            <ContextualSaveBar
                message={message || "Unsaved changes"}
                saveAction={{
                    content: saveContent || "Save",
                    onAction: onSave,
                    loading: saveLoading || false,
                    disabled: saveDisabled || false,
                }}
                discardAction={{
                    onAction: onDiscard,
                }}
                fullWidth
            />
        </Frame>
    </div>
}

export default ContextualSaveBarHeader