import React from 'react'
import './LoadingScreen.scss'

const LoadingScreen = (props) => {
    return (
        <div className="loader ">
            <div className="loader-inner loading">
                <div className="loading-box">
                    <div className="circular-loader">
                    </div>
                </div>
            </div>
        </div>
    )
}


export default LoadingScreen
