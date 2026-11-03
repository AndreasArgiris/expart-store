import { productHref } from '../../shared/hooks/useRoute'
import { formatPrice } from '../shop/merch'
import type { CartEntry } from './cartLines'

interface CartLineItemProps {
  entry: CartEntry
  onQtyChange: (key: string, qty: number) => void
  onRemove: (key: string) => void
  /** Following the product link leaves the cart, so the drawer closes. */
  onNavigate: () => void
}

/** One cart line: thumbnail, name, colour/size, price, quantity stepper and remove button. */
export function CartLineItem({ entry: e, onQtyChange, onRemove, onNavigate }: CartLineItemProps) {
  return (
    <li className="cart-line">
      <a href={productHref(e.product.slug, e.color)} onClick={onNavigate} className="cart-thumb">
        <img src={e.colorInfo.image} alt="" />
      </a>
      <div className="cart-line-info">
        <div className="fw-bold">{e.product.name}</div>
        {e.product.colors.length > 1 && <div className="text-secondary">Color: {e.colorInfo.name}</div>}
        {e.size && <div className="text-secondary">Size: {e.size}</div>}
        <div className="mt-1">{formatPrice(e.product.price)}</div>
        <div className="cart-qty">
          <button type="button" onClick={() => onQtyChange(e.key, e.qty - 1)} aria-label="One less">
            −
          </button>
          <span aria-live="polite">{e.qty}</span>
          <button type="button" onClick={() => onQtyChange(e.key, e.qty + 1)} aria-label="One more">
            +
          </button>
        </div>
      </div>
      <button type="button" className="cart-remove" onClick={() => onRemove(e.key)} aria-label={`Remove ${e.product.name}`}>
        ×
      </button>
    </li>
  )
}
