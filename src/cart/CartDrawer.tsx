import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { formatPrice } from '../data/merch'
import { productHref } from '../hooks/usePage'
import { useCart } from './cartContext'
import { PayPalCheckout } from './PayPalCheckout'

const ease = [0.22, 1, 0.36, 1] as const

export function CartDrawer() {
  const { entries, count, subtotal, isOpen, close, setQty, remove, clear } = useCart()
  const [paidOrder, setPaidOrder] = useState<string | null>(null)

  // Escape closes; the page behind doesn't scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [isOpen, close])

  const closeDrawer = () => {
    close()
    setPaidOrder(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cart"
          className="cart-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="cart-backdrop" onClick={closeDrawer} />
          <motion.aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Cart"
            initial={{ x: '105%' }}
            animate={{ x: 0 }}
            exit={{ x: '105%' }}
            transition={{ duration: 0.45, ease }}
          >
            <span className="fc fc-tl" />
            <span className="fc fc-tr" />
            <span className="fc fc-bl" />
            <span className="fc fc-br" />

            <header className="cart-head">
              <span className="cart-tab sq-label">
                Cart <span className="cart-tab-count">({count} items)</span>
              </span>
              <button type="button" className="cart-close" onClick={closeDrawer} aria-label="Close cart">
                ×
              </button>
            </header>

            {paidOrder ? (
              <div className="cart-empty">
                <p className="cart-thanks">Thank you!</p>
                <p>Your payment went through. Order {paidOrder}.</p>
                <p className="text-secondary">PayPal will email you a receipt.</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="cart-empty">
                <p>Your cart is empty.</p>
                <a className="text-link" href="#/shop" onClick={closeDrawer}>
                  Go to the shop ↳
                </a>
              </div>
            ) : (
              <>
                <ul className="cart-lines list-unstyled">
                  {entries.map((e) => (
                    <li key={e.key} className="cart-line">
                      <a href={productHref(e.product.slug, e.color)} onClick={closeDrawer} className="cart-thumb">
                        <img src={e.colorInfo.image} alt="" />
                      </a>
                      <div className="cart-line-info">
                        <div className="fw-bold">{e.product.name}</div>
                        {e.product.colors.length > 1 && <div className="text-secondary">Color: {e.colorInfo.name}</div>}
                        {e.size && <div className="text-secondary">Size: {e.size}</div>}
                        <div className="mt-1">{formatPrice(e.product.price)}</div>
                        <div className="cart-qty">
                          <button type="button" onClick={() => setQty(e.key, e.qty - 1)} aria-label="One less">
                            −
                          </button>
                          <span aria-live="polite">{e.qty}</span>
                          <button type="button" onClick={() => setQty(e.key, e.qty + 1)} aria-label="One more">
                            +
                          </button>
                        </div>
                      </div>
                      <button type="button" className="cart-remove" onClick={() => remove(e.key)} aria-label={`Remove ${e.product.name}`}>
                        ×
                      </button>
                    </li>
                  ))}
                </ul>

                <footer className="cart-foot">
                  <div className="cart-subtotal">
                    <span className="fw-bold">Subtotal</span>
                    <span className="fw-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <PayPalCheckout
                    entries={entries}
                    subtotal={subtotal}
                    onPaid={(id) => {
                      setPaidOrder(id)
                      clear()
                    }}
                  />
                </footer>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
