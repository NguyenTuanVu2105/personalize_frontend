import React from 'react'

const PolarisStyleInput = function ({value, onChange, inputType = 'text', inputWidth = 100, inputDisabled = false, inputId, inputClassName}) {
    const inputCombinedClass = inputClassName ? `Polaris-TextField__Input ${inputClassName}` : 'Polaris-TextField__Input'
    return (
        <div className="Polaris-Connected">
            <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                <div className="Polaris-TextField Polaris-TextField--hasValue">
                    <input id={!inputId ? `input-${btoa(Math.random().toString()).substr(10, 10)}` : inputId}
                           className={inputCombinedClass}
                           type={inputType}
                           disabled={inputDisabled}
                           onChange={onChange}
                           style={{width: inputWidth}}
                           value={value}/>
                    <div className="Polaris-TextField__Backdrop"/>
                </div>
            </div>
        </div>
    )
}

export default PolarisStyleInput