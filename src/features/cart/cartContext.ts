import { createContext, useContext } from 'react'
import type { CartEntry, CartLine } from './cartLines'

export type { CartEntry, CartLine } from './cartLines'

export interface CartState {
  entries: CartEntry[]
  count: number
  subtotal: number
  isOpen: boolean
  open: () => void
  close: () => void
  add: (line: Omit<CartLine, 'qty'>, qty?: number) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
}

export const CartContext = createContext<CartState | null>(null)

/** The shopping cart: its lines, totals, the drawer's open state and actions. Must be inside `<CartProvider>`. */
export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('useCart must be used inside <CartProvider>')
  return cart
}
