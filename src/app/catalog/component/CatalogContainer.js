import React, {useContext, useEffect} from "react"
import NewProductContainer from "../../new-product/components/NewProductContainer"
import UserPageContext from "../../userpage/context/UserPageContext"

import "./CatalogContainer.scss"

const Catalog = (props) => {
    const {setNameMap} = useContext(UserPageContext)
    props.location.deleteSession = true

    useEffect(() => {
        setNameMap({})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <div style={{marginBottom: -30}}>
            {/*<Card sectioned>*/}
            <div className="catalog-container">
                <NewProductContainer {...props} title={"Catalog"} hasContainer={true}/>
            </div>
            {/*</Card>*/}
        </div>

    )
}

export default Catalog