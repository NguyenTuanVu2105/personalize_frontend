import UserPageContainer from '../app/userpage/components/UserPageContainer'
import OrdersContainer from '../app/orders/components/OrdersContainer'
import BillingContainer from '../app/billings/components/BillingContainer'
import InvoiceDetailContainer from '../app/billings/components/InvoiceDetailContainer'
import ShopProductContainer from '../app/shop/components/ShopProductContainer'
import App from '../App'
import HomePageContainer from '../app/homepage/components/HomePageContainer'
import NewProductContainer from '../app/new-product/components/NewProductContainer'
import Paths from './Paths'
import LoginContainer from '../app/login/components/LoginContainer'
import OrderDetail from '../app/orders/components/OrderDetail'
import getHistory from '../store/getHistory'
import ShopifyAuthContainer from '../app/auth/ShopifyAuthContainer'
import ProductListContainer from '../app/products/components/ProductListContainer'
import ShopManageContainer from '../app/shop/components/ShopManageContainer'
import RegisterContainer from '../app/register/components/RegisterContainer'
import PaymentManagerContainer from '../app/payment-manage/components/PaymentManagerContainer'
import ArtworksContainer from '../app/artwork/components/ArtworksContainer'
import ProfileContainer from '../app/profile/components/ProfileContainer'
import DashboardContainer from '../app/dashboard/components/DashboardContainer'
import ShopSettingContainer from '../app/shop-setting/components/ShopSettingContainer'
import PayoneerActivationContainer from '../app/payment-manage/components/PayoneerForm/PayoneerActivationContainer'
import UserSettings from "../app/user-settings/SettingContainer"
import DuplicateProductContainer
    from '../app/new-product/components/duplicate-product-except-design/DuplicateProductContainer'
import DefaultPageContainer from '../app/userpage/components/DefaultPageContainer'
import NotFoundPageContainer from '../app/not-found/components/NotFoundPageContainer'
import TokenLoginContainer from '../app/token-login/TokenLoginContainer'
import AccountActivationContainer from '../app/account-activation/components/AccountActivationContainer'
import ResetPasswordContainer from "../app/reset-password/components/ResetPasswordContainer"
import ForgotPasswordContainer from "../app/reset-password/components/ForgotPasswordContainer"
import EcommerceProductDetail from "../app/products/components/EcommerceProductDetail"
import TicketsContainer from "../app/tickets/components/TicketsContainer"
import TicketDetailContainer from "../app/tickets/components/ticket-detail/TicketDetailContainer"
import SecurityAccessWarningPage from '../app/warning/SecurityAccessWarningPage'
import ShopAccessWarningPage from '../app/warning/ShopAccessWarningPage'
import NewOrderContainer from "../app/new-order/NewOrderContainer"
import AddStoreTest from "../app/dev-test/AddStoreTest"
import SecurityOpenFullsiteWarningModal from "../app/warning/SecurityOpenFullsiteWarningModal"
import ProductStatistic from "../app/product-statistic/component/ProductStatistic"
import Catalog from "../app/catalog/component/CatalogContainer"
import CustomizeSampleProduct from "../app/new-product/components/sample-product-copy/CustomizeSampleProduct"
import ProductDetailContainer from "../app/products/components/ProductDetailContainer"
import DuplicateUserProduct from "../app/new-product/components/duplicate-product/DuplicateUserProduct"
import TrackingContainer from "../app/tracking/component/TrackingContainer"

const routes = [
    {
        component: App,
        routes: [
            {
                path: Paths.AddStoreTest,
                exact: true,
                component: AddStoreTest
            },
            {
                path: Paths.HomePage,
                exact: true,
                component: HomePageContainer
            },
            {
                path: Paths.Tracking(),
                exact: true,
                component: TrackingContainer
            },
            {
                path: Paths.Login,
                exact: true,
                component: LoginContainer
            },
            {
                path: Paths.Register,
                exact: true,
                component: RegisterContainer
            },
            {
                path: Paths.ShopifyAuth,
                exact: true,
                component: ShopifyAuthContainer
            },
            {
                path: Paths.TokenLogin,
                exact: true,
                component: TokenLoginContainer
            },
            {
                path: Paths.PayoneerActivate,
                exact: true,
                component: PayoneerActivationContainer
            },
            {
                path: Paths.SecurityAccessWarning,
                component: SecurityAccessWarningPage
            },
            {
                path: Paths.SecurityOpenFullsiteWarning,
                component: SecurityOpenFullsiteWarningModal
            },
            {
                path: Paths.ShopAccessWarning,
                component: ShopAccessWarningPage
            },
            {
                path: Paths.UserPage,
                component: UserPageContainer,

                routes: [
                    {
                        path: Paths.NewProduct,
                        exact: true,
                        component: NewProductContainer
                    },
                    {
                        path: Paths.DuplicateProduct(),
                        component: DuplicateProductContainer
                    },
                    {
                        path: Paths.CustomizeSampleProduct(),
                        component: CustomizeSampleProduct
                    },
                    {
                        path: Paths.DuplicateUserProduct(),
                        component: DuplicateUserProduct
                    },
                    {
                        component: DefaultPageContainer,
                        routes: [
                            {
                                path: Paths.ListShop(),
                                exact: true,
                                component: ShopManageContainer,
                            },
                            {
                                path: Paths.ShopSetting(),
                                exact: true,
                                component: ShopSettingContainer,
                            },
                            {
                                path: Paths.Catalog,
                                exact: true,
                                component: Catalog
                            },
                            {
                                path: Paths.ListProductsByShop(),
                                exact: true,
                                component: ShopProductContainer
                            },

                            {
                                path: Paths.ListProducts,
                                exact: true,
                                component: ProductListContainer,
                            },
                            {
                                path: Paths.ProductDetail(),
                                exact: true,
                                component: ProductDetailContainer
                            },
                            {
                                path: Paths.EcommerceProductDetail(),
                                component: EcommerceProductDetail
                            },
                            {
                                path: Paths.Orders,
                                exact: true,
                                component: OrdersContainer,
                            },
                            {
                                path: Paths.NewOrder,
                                exact: true,
                                component: NewOrderContainer
                            },
                            {
                                path: Paths.Support,
                                exact: true,
                                component: TicketsContainer,
                            },
                            {
                                path: Paths.TicketDetail(),
                                exact: true,
                                component: TicketDetailContainer,
                            },
                            {
                                path: Paths.OrderDetail(),
                                component: OrderDetail
                            },
                            {
                                path: Paths.InvoiceList,
                                exact: true,
                                component: BillingContainer
                            },
                            {
                                path: Paths.InvoiceDetail(),
                                exact: true,
                                component: InvoiceDetailContainer
                            },
                            {
                                path: Paths.PaymentManager,
                                exact: true,
                                component: PaymentManagerContainer
                            },
                            {
                                path: Paths.Artworks,
                                exact: true,
                                component: ArtworksContainer
                            },
                            {
                                path: Paths.Profile,
                                component: ProfileContainer
                            },
                            {
                                path: Paths.Dashboard,
                                component: DashboardContainer
                            },
                            {
                                path: Paths.Settings,
                                component: UserSettings
                            },
                            {
                                path: Paths.ProductStatistic,
                                exact: true,
                                component: ProductStatistic,
                            },
                            {
                                path: "*",
                                component: NotFoundPageContainer
                            },
                        ]
                    },
                    {
                        path: "*",
                        component: NotFoundPageContainer
                    },
                ]
            },
            {
                path: Paths.AccountActivation(),
                component: AccountActivationContainer
            },
            {
                path: Paths.ForgotPassword,
                component: ForgotPasswordContainer
            },
            {
                path: Paths.ResetPassword(),
                component: ResetPasswordContainer
            },
            {
                path: "*",
                component: NotFoundPageContainer
            },

        ]
    }
]


getHistory().listen((location, action) => {
    window.scrollTo(0, 0)
})


export default routes


