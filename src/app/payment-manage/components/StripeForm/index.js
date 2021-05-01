import {Elements, StripeProvider} from "react-stripe-elements"
import AddCardForm from "./AddCardForm"
import React, {useEffect, useState} from "react"
import {getPublicKey} from "../../../../services/api/stripeCard"


const StripeForm = () => {
    let [_publicKey, _setPublicKey] = useState(null)
    const _setupStripePublicKey = async () => {
        const resp = await getPublicKey()
        let {api_key: apiKey} = resp.data
        _setPublicKey(apiKey)
    }
    useEffect(() => {
        _setupStripePublicKey()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, _publicKey)
    return (
        <div>
            {_publicKey &&
            <StripeProvider apiKey={_publicKey}>
                <div className="add-customer">
                    <Elements>
                        <AddCardForm/>
                    </Elements>
                </div>
            </StripeProvider>}
        </div>
    )
}


export default StripeForm
