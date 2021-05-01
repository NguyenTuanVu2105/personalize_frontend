import * as qs from 'query-string'
import React, {useEffect} from 'react'
import {withRouter} from 'react-router-dom'

const PayoneerActivationContainer = (props) => {

    const params = qs.parse(props.location.search)
    useEffect(() => {
        if (window.opener) {
            window.opener.postMessage(params)
            window.close()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <div>

        </div>
    )
}


export default withRouter(PayoneerActivationContainer)

