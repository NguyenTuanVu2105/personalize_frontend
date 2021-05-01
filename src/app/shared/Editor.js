import {Editor} from '@tinymce/tinymce-react'
import {tinyEditorAPIKey} from "../../configs/tinyEditor"
import DOMPurify from "dompurify"
import React from "react"

export default (props) => {
    return (
        <Editor
            {...props}
            apiKey={props.apiKey || tinyEditorAPIKey}
            value={DOMPurify.sanitize(props.value)}
        />
    )
}
