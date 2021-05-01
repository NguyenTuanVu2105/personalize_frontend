import React from 'react'
import {Banner, Button} from '@shopify/polaris'
import {Link} from 'react-router-dom'
import "./NotificationPrompt.scss"

const url = "https://printholo.freshdesk.com/support/solutions/articles/66000459960-printholo-tet-holidays-2021-order-deadlines"
const NotificationPrompt = () => {
    return (
        <div className='m-b-20 notification-banner' >
            <Banner title="Vietnamese New Year 2021 - Cut Off Dates">
                <div className="p-b-10">
                    <p>With Vietnamese New Year right around the corner, it is the most important celebration in Vietnamese culture, the longest holiday in Vietnam. It's time for pilgrims and family reunions that means our staff will leave this time and return to their family. So please check the details of the cut-off dates and see how does this affect you in the button below.</p>
                </div>
                <Link to={{pathname: url}} target={"__blank"}>
                    <Button primary>VIEW MORE</Button>
                </Link>
            </Banner>
        </div>
    )
}
export default NotificationPrompt
