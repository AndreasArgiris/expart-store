import { findProduct, type MerchColor, type MerchProduct } from '../shop/merch'

/** One product/colour/size in the cart, and how many. This is what gets saved. */
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

export const MAX_QTY = 20
const COLOR_IDS: readonly string[] = ['black', 'white'] satisfies MerchColor['id'][]

export const lineKey = (l: Pick<CartLine, 'slug' | 'color' | 'size'>) => `${l.slug}|${l.color}|${l.size ?? ''}`

const isColorId = (v: unknown): v is MerchColor['id'] => typeof v === 'string' && COLOR_IDS.includes(v)

/** Checks a saved value really is a cart line (saved carts can be stale or edited by hand). */
export function isCartLine(v: unknown): v is CartLine {
  if (typeof v !== 'object' || v === null) return false
  if (!('slug' in v) || typeof v.slug !== 'string') return false
  if (!('color' in v) || !isColorId(v.color)) return false
  if ('size' in v && v.size !== undefined && typeof v.size !== 'string') return false
  return 'qty' in v && typeof v.qty === 'number' && Number.isInteger(v.qty) && v.qty > 0 && v.qty <= MAX_QTY
}

/** Parses a saved cart, keeping only the valid lines. Anything unreadable becomes an empty cart. */
export function parseSavedLines(json: string | null): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(json ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : []
  } catch {
    return []
  }
}

/** Adds `qty` of a line, merging with a matching line (capped at `MAX_QTY`). */
export function addLine(lines: CartLine[], line: Omit<CartLine, 'qty'>, qty = 1): CartLine[] {
  const key = lineKey(line)
  const existing = lines.find((l) => lineKey(l) === key)
  if (!existing) return [...lines, { ...line, qty }]
  return lines.map((l) => (l === existing ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
}

/** Sets a line's quantity (capped at `MAX_QTY`); zero or less removes it. */
export function setLineQty(lines: CartLine[], key: string, qty: number): CartLine[] {
  if (qty <= 0) return removeLine(lines, key)
  return lines.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l))
}

export const removeLine = (lines: CartLine[], key: string) => lines.filter((l) => lineKey(l) !== key)

/** Joins lines with the catalogue, dropping any whose product or colour no longer exists. */
export function toEntries(lines: CartLine[]): CartEntry[] {
  return lines.flatMap((line) => {
    const product = findProduct(line.slug)
    const colorInfo = product?.colors.find((c) => c.id === line.color)
    return product && colorInfo ? [{ ...line, key: lineKey(line), product, colorInfo }] : []
  })
}

export const countItems = (entries: CartEntry[]) => entries.reduce((n, e) => n + e.qty, 0)
export const subtotalOf = (entries: CartEntry[]) => entries.reduce((sum, e) => sum + e.qty * e.product.price, 0)
