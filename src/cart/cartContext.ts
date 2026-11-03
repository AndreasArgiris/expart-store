import { createContext, useContext } from 'react'
import { findProduct, type MerchColor, type MerchProduct } from '../data/merch'

export interface CartLine {
  slug: string
  color: MerchColor['id']
  size?: string
  qty: number
}

/** A cart line joined with its catalogue entry. */
export interface CartEntry extends CartLine {
  key: string
  product: MerchProduct
  colorInfo: MerchColor
}

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

export const lineKey = (l: Pick<CartLine, 'slug' | 'color' | 'size'>) => `${l.slug}|${l.color}|${l.size ?? ''}`

/** Drops lines whose product or colour no longer exists in the catalogue. */
export function toEntries(lines: CartLine[]): CartEntry[] {
  return lines.flatMap((line) => {
    const product = findProduct(line.slug)
    const colorInfo = product?.colors.find((c) => c.id === line.color)
    return product && colorInfo ? [{ ...line, key: lineKey(line), product, colorInfo }] : []
  })
}

export const CartContext = createContext<CartState | null>(null)

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('useCart must be used inside <CartProvider>')
  return cart
}
