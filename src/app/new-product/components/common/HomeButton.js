import React, {useContext} from "react"
import Paths from "../../../../routes/Paths"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faHome} from "@fortawesome/free-solid-svg-icons"
import {Button} from "@shopify/polaris"
import {Link} from "react-router-dom"
import NewProductContext from "../../context/NewProductContext"
import {removeSessionStorage, SESSION_KEY} from "../../../../services/storage/sessionStorage"

const HomeButton = () => {
    const {removeAllArtworks, hasContainer} = useContext(NewProductContext)

    const handleHomeClick = () => {
        removeAllArtworks()
        removeSessionStorage(SESSION_KEY.NEW_PRODUCT)
    }

    if (hasContainer === true){
        return <div/>
    }else{
        return (
            <Link to={Paths.Dashboard}>
                <Button icon={<FontAwesomeIcon icon={faHome}/>} onClick={handleHomeClick}>
                    Home
                </Button>
            </Link>
        )
    }

}

export default HomeButton