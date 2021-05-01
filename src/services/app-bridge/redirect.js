import {getReactEnv} from "../env/getEnv"
import createApp from '@shopify/app-bridge'
import {Redirect} from '@shopify/app-bridge/actions'

export const appBridgeRedirect = (shopUrl, action, path) => {
    const config = {
        apiKey: getReactEnv("SHOPIFY_CLIENT_ID"),
        shopOrigin: shopUrl
    }
    const app = createApp(config)
    const redirect = Redirect.create(app)
    return redirect.dispatch(action, path)
}