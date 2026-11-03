import { pageHref } from '../../shared/hooks/useRoute'

/** Shown after a successful payment. */
export function CartThanks({ orderId }: { orderId: string }) {
  return (
    <div className="cart-empty">
      <p className="cart-thanks">Thank you!</p>
      <p>Your payment went through. Order {orderId}.</p>
      <p className="text-secondary">PayPal will email you a receipt.</p>
    </div>
  )
}

/** Shown when there's nothing in the cart; the shop link closes the drawer. */
export function CartEmpty({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="cart-empty">
      <p>Your cart is empty.</p>
      <a className="text-link" href={pageHref.shop} onClick={onNavigate}>
        Go to the shop ↳
      </a>
    </div>
  )
}
