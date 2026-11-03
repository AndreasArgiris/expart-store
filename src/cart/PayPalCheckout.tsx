import { useState } from 'react'
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { CURRENCY } from '../data/merch'
import type { CartEntry } from './cartContext'

// Set VITE_PAYPAL_CLIENT_ID in .env (see .env.example). "test" is PayPal's sandbox placeholder:
// the button works, but no real money moves.
const CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test'

const money = (value: number) => ({ currency_code: CURRENCY, value: value.toFixed(2) })

interface Props {
  entries: CartEntry[]
  subtotal: number
  onPaid: (orderId: string) => void
}

function Buttons({ entries, subtotal, onPaid }: Props) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer()
  const [error, setError] = useState<string | null>(null)

  if (isRejected) return <p className="checkout-msg is-error">PayPal couldn't be loaded. Please try again later.</p>

  return (
    <>
      {isPending && <p className="checkout-msg">Loading PayPal…</p>}
      <PayPalButtons
        fundingSource="paypal"
        style={{ layout: 'vertical', color: 'black', shape: 'rect', label: 'checkout', height: 48 }}
        // Rebuild the order whenever the cart changes.
        forceReRender={[subtotal, entries.map((e) => `${e.key}x${e.qty}`).join()]}
        createOrder={(_, actions) => {
          setError(null)
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                description: 'Expart merch',
                amount: { ...money(subtotal), breakdown: { item_total: money(subtotal) } },
                items: entries.map((e) => ({
                  name: `${e.product.name}${e.product.colors.length > 1 ? ` / ${e.colorInfo.name}` : ''}${e.size ? ` / ${e.size}` : ''}`,
                  sku: e.key,
                  quantity: String(e.qty),
                  unit_amount: money(e.product.price),
                  category: 'PHYSICAL_GOODS',
                })),
              },
            ],
          })
        }}
        onApprove={async (_, actions) => {
          const order = await actions.order?.capture()
          if (order?.id) onPaid(order.id)
        }}
        onError={() => setError('Something went wrong with PayPal. Your cart is still here; please try again.')}
      />
      {error && <p className="checkout-msg is-error">{error}</p>}
    </>
  )
}

/** PayPal is the only payment method: cards, Pay Later and Venmo are switched off. */
export function PayPalCheckout(props: Props) {
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
      <Buttons {...props} />
    </PayPalScriptProvider>
  )
}
