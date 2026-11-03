import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CartContext, lineKey, toEntries, type CartLine, type CartState } from './cartContext'

const STORAGE_KEY = 'expart-cart'
const MAX_QTY = 20

function loadLines(): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? (parsed as CartLine[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadLines)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const add = useCallback<CartState['add']>((line, qty = 1) => {
    const key = lineKey(line)
    setLines((prev) => {
      const existing = prev.find((l) => lineKey(l) === key)
      if (!existing) return [...prev, { ...line, qty }]
      return prev.map((l) => (l === existing ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
    })
    setIsOpen(true)
  }, [])

  const setQty = useCallback<CartState['setQty']>((key, qty) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => lineKey(l) !== key)
        : prev.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
    )
  }, [])

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => lineKey(l) !== key)), [])
  const clear = useCallback(() => setLines([]), [])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartState>(() => {
    const entries = toEntries(lines)
    return {
      entries,
      count: entries.reduce((n, e) => n + e.qty, 0),
      subtotal: entries.reduce((sum, e) => sum + e.qty * e.product.price, 0),
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
