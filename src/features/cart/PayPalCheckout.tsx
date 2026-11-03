import { useState } from 'react'
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { CURRENCY } from '../shop/merch'
import type { CartEntry } from './cartLines'
import { cartFingerprint, toPurchaseUnit } from './paypalOrder'

// Set VITE_PAYPAL_CLIENT_ID in .env (see .env.example). "test" is PayPal's sandbox placeholder:
// the button works, but no real money moves.
const CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test'
const BUTTON_STYLE = { layout: 'vertical', color: 'black', shape: 'rect', label: 'checkout', height: 48 } as const
const PAYPAL_ERROR = 'Something went wrong with PayPal. Your cart is still here; please try again.'

interface PayPalCheckoutProps {
  entries: CartEntry[]
  subtotal: number
  onPaid: (orderId: string) => void
}

function CheckoutButtons({ entries, subtotal, onPaid }: PayPalCheckoutProps) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer()
  const [error, setError] = useState<string | null>(null)

  if (isRejected) return <p className="checkout-msg is-error">PayPal couldn't be loaded. Please try again later.</p>

  return (
    <>
      {isPending && <p className="checkout-msg">Loading PayPal…</p>}
      <PayPalButtons
        fundingSource="paypal"
        style={BUTTON_STYLE}
        forceReRender={cartFingerprint(entries, subtotal)}
        createOrder={(_, actions) => {
          setError(null)
          return actions.order.create({ intent: 'CAPTURE', purchase_units: [toPurchaseUnit(entries, subtotal)] })
        }}
        onApprove={async (_, actions) => {
          const order = await actions.order?.capture()
          if (order?.id) onPaid(order.id)
        }}
        onError={() => setError(PAYPAL_ERROR)}
      />
      {error && <p className="checkout-msg is-error">{error}</p>}
    </>
  )
}

/** PayPal is the only payment method: cards, Pay Later and Venmo are switched off. */
export function PayPalCheckout(props: PayPalCheckoutProps) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: CLIENT_ID,
        currency: CURRENCY,
        intent: 'capture',
        components: 'buttons',
        disableFunding: ['card', 'credit', 'paylater', 'venmo'],
      }}
    >
      <CheckoutButtons {...props} />
    </PayPalScriptProvider>
  )
}
