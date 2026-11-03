import { describe, expect, it } from 'vitest'
import { toEntries } from './cartLines'
import { lineItemName, toPurchaseUnit } from './paypalOrder'

const entries = toEntries([
  { slug: 'cotton-tee', color: 'white', size: 'S', qty: 2 },
  { slug: 'sticker-pack', color: 'white', qty: 1 },
])

describe('lineItemName', () => {
  it('names the colour only when the product comes in several, and the size when it has one', () => {
    expect(lineItemName(entries[0])).toBe('Lightweight Cotton Tee / White / S')
    expect(lineItemName(entries[1])).toBe('Sticker Pack (x5)')
  })
})

describe('toPurchaseUnit', () => {
  it('lists every line and totals match the item breakdown, to two decimals', () => {
    const unit = toPurchaseUnit(entries, 42)
    expect(unit.amount).toEqual({
      currency_code: 'USD',
      value: '42.00',
      breakdown: { item_total: { currency_code: 'USD', value: '42.00' } },
    })
    expect(unit.items.map((i) => [i.name, i.quantity, i.unit_amount.value])).toEqual([
      ['Lightweight Cotton Tee / White / S', '2', '20.00'],
      ['Sticker Pack (x5)', '1', '2.00'],
    ])
  })
})
