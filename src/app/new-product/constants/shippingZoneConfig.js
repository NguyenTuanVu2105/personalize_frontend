import usShippingSvg from '../../../assets/images/usShipping.svg'
import wwShippingSvg from '../../../assets/images/wwShipping.svg'
import canadaShippingSvg from '../../../assets/images/canadaShipping.svg'
import ukShipping from '../../../assets/images/ukShipping.svg'
import euShipping from '../../../assets/images/euShipping.svg'

export const ShippingZoneConfig = {
    'ROW': {
        'label': 'WW',
        'backgroundColor': 'steelblue',
        'color': 'steelblue',
        'tooltip': 'World Wide Shipping',
        'title': 'World Wide',
        'icon': wwShippingSvg
    },
    'US': {
        'label': 'US',
        'color': 'darkred',
        'backgroundColor': 'darkred',
        'tooltip': 'United States Shipping',
        'title': 'United States',
        'icon': usShippingSvg
    },
    'CA': {
        'label': 'CA',
        'color': 'darkred',
        'backgroundColor': 'darkred',
        'tooltip': 'Canada Shipping',
        'title': 'Canada',
        'icon': canadaShippingSvg
    },
    'UK': {
        'label': 'UK',
        'color': 'darkred',
        'backgroundColor': 'darkred',
        'tooltip': 'United Kingdom Shipping',
        'title': 'United Kingdom',
        'icon': ukShipping
    },
    'EU': {
        'label': 'EU',
        'color': 'darkred',
        'backgroundColor': 'darkred',
        'tooltip': 'European Union Shipping',
        'title': 'European Union',
        'icon': euShipping
    }
}