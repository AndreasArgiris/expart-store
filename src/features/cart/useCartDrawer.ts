import { useState } from 'react'
import { useOverlayDismiss } from '../../shared/hooks/useOverlayDismiss'
import { useCart } from './cartContext'

/**
 * The cart drawer's behaviour: Escape closes it, the page behind can't scroll while it's open, and after a
 * successful payment it shows the order id (until closed) and empties the cart.
 */
export function useCartDrawer() {
  const cart = useCart()
  const { isOpen, close, clear } = cart
  const [paidOrderId, setPaidOrderId] = useState<string | null>(null)

  useOverlayDismiss(isOpen, close)

  const handleClose = () => {
    close()
    setPaidOrderId(null)
  }

  const handlePaid = (orderId: string) => {
    setPaidOrderId(orderId)
    clear()
  }

  return { ...cart, paidOrderId, handleClose, handlePaid }
}
