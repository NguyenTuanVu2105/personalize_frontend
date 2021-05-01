import Paths from '../../routes/Paths'
import {isInFrame} from '../../services/util/windowUtil'
import {
    faChartLine,
    faClipboardList,
    faCog,
    faImage,
    faPowerOff,
    faReceipt,
    faTshirt
} from "@fortawesome/free-solid-svg-icons"
import {faAddressCard, faCreditCard} from "@fortawesome/free-regular-svg-icons"

export const routingMain = [
    {
        path: Paths.Dashboard,
        title: 'Dashboard',
        icon: faChartLine,
        name: 'dashboard'
    },
    {
        path: Paths.Catalog,
        title: 'Catalog',
        icon: faTshirt,
        name: 'catalog',
    },
    {
        path: Paths.Orders,
        title: 'Orders',
        icon: faClipboardList,
        name: 'order',
    },
    {
        path: Paths.Artworks,
        title: 'Artworks',
        icon: faImage,
        name: 'artwork',
    },
    {
        path: Paths.InvoiceList,
        title: 'Billings',
        icon: faReceipt,
        name: 'billings',
    },
    {
        path: Paths.PaymentManager,
        title: 'Payment',
        icon: faCreditCard,
        name: 'payment'
    },
]

export const LOGOUT = "logout"

export const routingUser = [
    [
        {
            path: Paths.Profile,
            title: 'Profile',
            icon: faAddressCard,
            name: 'profile'
        },
        {
            path: Paths.Settings,
            title: 'Settings',
            icon: faCog,
            name: 'setting'
        }
    ]
]

const userLogOut = [
    {
        path: LOGOUT,
        title: 'Logout',
        icon: faPowerOff,
        name: LOGOUT
    }
]

if (!isInFrame()) {
    routingUser.push(userLogOut)
}

routingUser.forEach(group => {
    group.unshift({})
})

