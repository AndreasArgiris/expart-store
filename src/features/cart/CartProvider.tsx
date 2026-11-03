import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CartContext, type CartState } from './cartContext'
import {
  addLine,
  countItems,
  parseSavedLines,
  removeLine,
  setLineQty,
  subtotalOf,
  toEntries,
  type CartLine,
} from './cartLines'

const STORAGE_KEY = 'expart-cart'

/** Holds the cart (saved to localStorage, so it survives reloads) and the drawer's open state. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => parseSavedLines(localStorage.getItem(STORAGE_KEY)))
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const add = useCallback<CartState['add']>((line, qty = 1) => {
    setLines((prev) => addLine(prev, line, qty))
    setIsOpen(true)
  }, [])
  const setQty = useCallback<CartState['setQty']>((key, qty) => setLines((prev) => setLineQty(prev, key, qty)), [])
  const remove = useCallback((key: string) => setLines((prev) => removeLine(prev, key)), [])
  const clear = useCallback(() => setLines([]), [])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartState>(() => {
    const entries = toEntries(lines)
    return {
      entries,
      count: countItems(entries),
      subtotal: subtotalOf(entries),
      isOpen,
      open,
      close,
      add,
      setQty,
      remove,
      clear,
    }
  }, [lines, isOpen, open, close, add, setQty, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
