import {getReactEnv} from '../../../services/env/getEnv'

const clientId = getReactEnv('SHOPIFY_CLIENT_ID')
const redirectUrl = getReactEnv('SHOPIFY_REDIRECT_URL')

export const getShopIfyAuthUrl = (shopName) => {
    let shopDomain = shopName.replace('https://', '').replace('http://', '').trim()
    const slash = shopDomain.indexOf('/')
    if (slash >= 0) shopDomain = shopDomain.substr(0, slash)
    return `https://${shopDomain}/admin/oauth/request_grant?client_id=${clientId}&redirect_uri=${redirectUrl}&scope=read_products%2Cwrite_products%2Cread_orders%2Cwrite_orders%2Cread_fulfillments%2Cwrite_fulfillments%2Cread_shipping%2Cwrite_shipping`
}
