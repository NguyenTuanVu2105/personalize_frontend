import React from "react"

const DesignLabel = ({text}) => {
    return (
        <div className="Polaris-Labelled__LabelWrapper">
            <div className="Polaris-Label">
                <div className="Polaris-Label__Text">
                    {text}
                </div>
            </div>
        </div>
    )
}

export default DesignLabel
