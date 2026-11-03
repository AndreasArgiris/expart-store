import { CURRENCY } from '../shop/merch'
import type { CartEntry } from './cartLines'

const ORDER_DESCRIPTION = 'Expart merch'

/** An amount in PayPal's format: currency code plus a two-decimal string. */
export const toMoney = (value: number) => ({ currency_code: CURRENCY, value: value.toFixed(2) })

/** "Tee / Black / M": the product, plus its colour (when it has a choice) and size. */
export function lineItemName(e: CartEntry) {
  const color = e.product.colors.length > 1 ? ` / ${e.colorInfo.name}` : ''
  const size = e.size ? ` / ${e.size}` : ''
  return `${e.product.name}${color}${size}`
}

/** The single PayPal purchase unit for the cart: one item per line, with a matching item total. */
export function toPurchaseUnit(entries: CartEntry[], subtotal: number) {
  return {
    description: ORDER_DESCRIPTION,
    amount: { ...toMoney(subtotal), breakdown: { item_total: toMoney(subtotal) } },
    items: entries.map((e) => ({
      name: lineItemName(e),
      sku: e.key,
      quantity: String(e.qty),
      unit_amount: toMoney(e.product.price),
      category: 'PHYSICAL_GOODS' as const,
    })),
  }
}

/** Changes whenever the cart's contents do, so the PayPal button rebuilds its order. */
export const cartFingerprint = (entries: CartEntry[], subtotal: number) => [subtotal, entries.map((e) => `${e.key}x${e.qty}`).join()]
