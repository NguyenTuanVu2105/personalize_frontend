import React from "react"
import "./styles.scss"
import Paths from "../../../../routes/Paths"
import {Link} from "react-router-dom"

const BannerContainer = () => {
    return (
        <div className={"banner-container m-l-30"}>
            <div className={'info'}>
                <h1 className={"title"}>Design Now</h1>
                <p className={"description"}>Connect your online store to PrintHolo and fill it with products covered in
                    your designs.</p>
                <Link className={"action"} to={{pathname: Paths.NewProduct, deleteSession: true}}>
                    <span>Create Product</span>
                </Link>
            </div>
        </div>
    )
}

export default BannerContainer
