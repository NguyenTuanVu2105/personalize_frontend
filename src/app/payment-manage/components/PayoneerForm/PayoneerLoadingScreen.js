import React from 'react'
import {Button} from '@shopify/polaris'

const PayoneerLoadingScreen = (props) => {
    const {onClose} = props
    return (
        <div className="loader">
            <div className="loader-inner loading">
                <div className="loading-box">
                    <div className="circular-loader">
                    </div>
                    <div className="m25 flex-center" style={{color: "#333"}}>
                        <div style={{padding: "3rem", backgroundColor: "#fff", width: "37vw", borderRadius: 3 }}>
                            <div>
                                Don’t see the Payoneer login window opened? Check if your browser is blocking pop up
                                window.
                            </div>
                            <br/>
                            <div>
                                <Button plain onClick={onClose}>
                                    Click here to try again
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default PayoneerLoadingScreen
