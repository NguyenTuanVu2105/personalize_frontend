import React from 'react'
import {getProductAdminInShopUrl, getProductPreviewInShopUrl} from '../../helpers/ProductHelper'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt, faEye} from '@fortawesome/free-solid-svg-icons'
import {Link} from "@shopify/polaris"

const AdminPreviewEcomerceProduct = (props) => {
    return (<div>
        <span className={'mr-3'}>
            <Link url={getProductAdminInShopUrl(props.shop_url, props.product_id)}
                  external>
                <FontAwesomeIcon icon={faExternalLinkAlt}/>&nbsp;Admin View
            </Link>
        </span>
        <span className={'mx-3'}>
            <Link url={getProductPreviewInShopUrl(props.shop_url, props.handle)} external>
                <FontAwesomeIcon icon={faEye}/>&nbsp;Preview
            </Link>
        </span>
    </div>)
}

export default AdminPreviewEcomerceProduct