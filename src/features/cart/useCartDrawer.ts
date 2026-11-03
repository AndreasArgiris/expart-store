import { useEffect, useState } from 'react'
import { useCart } from './cartContext'

/**
 * The cart drawer's behaviour: Escape closes it, the page behind can't scroll while it's open, and after a
 * successful payment it shows the order id (until closed) and empties the cart.
 */
export function useCartDrawer() {
  const cart = useCart()
  const { isOpen, close, clear } = cart
  const [paidOrderId, setPaidOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKeyDown)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = overflow
    }
  }, [isOpen, close])

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
