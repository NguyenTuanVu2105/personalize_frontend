import {getPaypalCheckoutForm} from '../../../../services/api/invoices'
import {addDangerousHiddenStringHTMLtoDOM} from '../../../../services/util/dom'

export const PAYPAL_FORM_CONTAINER_DOM_ID = 'paypal-form-container'

export const appendPaypalCheckoutForm = async (invoiceId) => {
    const resp = await getPaypalCheckoutForm(invoiceId)
    const form = resp.data
    addDangerousHiddenStringHTMLtoDOM(form, PAYPAL_FORM_CONTAINER_DOM_ID)
}
