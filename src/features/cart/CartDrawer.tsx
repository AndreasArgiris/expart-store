import { AnimatePresence, motion } from 'motion/react'
import { CornerMarks } from '../../shared/components/CornerMarks'
import { EASE_OUT } from '../../shared/motion'
import { formatPrice } from '../shop/merch'
import { CartLineItem } from './CartLineItem'
import { CartEmpty, CartThanks } from './CartMessages'
import { PayPalCheckout } from './PayPalCheckout'
import { useCartDrawer } from './useCartDrawer'

const BACKDROP_FADE = { duration: 0.25 }
const SLIDE_IN = { duration: 0.45, ease: EASE_OUT }
const OFFSCREEN = '105%' // just past the right edge, so the drawer's shadow is hidden too

/** Slide-in cart: the lines with quantity controls, the subtotal and PayPal checkout, or a thank-you once paid. */
export function CartDrawer() {
  const cart = useCartDrawer()
  const { entries, isOpen, paidOrderId, handleClose } = cart

  const body = paidOrderId ? (
    <CartThanks orderId={paidOrderId} />
  ) : entries.length === 0 ? (
    <CartEmpty onNavigate={handleClose} />
  ) : (
    <>
      <ul className="cart-lines list-unstyled">
        {entries.map((e) => (
          <CartLineItem key={e.key} entry={e} onQtyChange={cart.setQty} onRemove={cart.remove} onNavigate={handleClose} />
        ))}
      </ul>
      <footer className="cart-foot">
        <div className="cart-subtotal">
          <span className="fw-bold">Subtotal</span>
          <span className="fw-bold">{formatPrice(cart.subtotal)}</span>
        </div>
        <PayPalCheckout entries={entries} subtotal={cart.subtotal} onPaid={cart.handlePaid} />
      </footer>
    </>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="cart" className="cart-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={BACKDROP_FADE}>
          <div className="cart-backdrop" onClick={handleClose} />
          <motion.aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Cart"
            initial={{ x: OFFSCREEN }}
            animate={{ x: 0 }}
            exit={{ x: OFFSCREEN }}
            transition={SLIDE_IN}
          >
            <CornerMarks />
            <header className="cart-head">
              <span className="cart-tab sq-label">
                Cart <span className="cart-tab-count">({cart.count} items)</span>
              </span>
              <button type="button" className="cart-close" onClick={handleClose} aria-label="Close cart">
                ×
              </button>
            </header>
            {body}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
