import { describe, expect, it } from 'vitest'
import {
  addLine,
  countItems,
  lineKey,
  MAX_QTY,
  parseSavedLines,
  setLineQty,
  subtotalOf,
  toEntries,
  type CartLine,
} from './cartLines'

const tee: Omit<CartLine, 'qty'> = { slug: 'cotton-tee', color: 'black', size: 'M' }

describe('parseSavedLines', () => {
  it('restores a valid saved cart', () => {
    const saved = JSON.stringify([{ ...tee, qty: 2 }])
    expect(parseSavedLines(saved)).toEqual([{ ...tee, qty: 2 }])
  })

  it('drops lines that are malformed or out of range, keeping the rest', () => {
    const saved = JSON.stringify([
      { ...tee, qty: 1 },
      { slug: 'cotton-tee', color: 'purple', qty: 1 }, // unknown colour
      { slug: 'cotton-tee', color: 'black', qty: 0 }, // nothing to buy
      { slug: 'cotton-tee', color: 'black', qty: MAX_QTY + 1 },
      { slug: 42, color: 'black', qty: 1 },
      'not a line',
    ])
    expect(parseSavedLines(saved)).toEqual([{ ...tee, qty: 1 }])
  })

  it('treats missing or corrupt storage as an empty cart', () => {
    expect(parseSavedLines(null)).toEqual([])
    expect(parseSavedLines('{not json')).toEqual([])
    expect(parseSavedLines('{"slug":"x"}')).toEqual([])
  })
})

describe('addLine', () => {
  it('adds a new line', () => {
    expect(addLine([], tee)).toEqual([{ ...tee, qty: 1 }])
  })

  it('merges the same product, colour and size, capped at the maximum', () => {
    const once = addLine([], tee, 3)
    expect(addLine(once, tee, 2)).toEqual([{ ...tee, qty: 5 }])
    expect(addLine(once, tee, MAX_QTY)).toEqual([{ ...tee, qty: MAX_QTY }])
  })

  it('keeps different sizes as separate lines', () => {
    const lines = addLine(addLine([], tee), { ...tee, size: 'L' })
    expect(lines).toHaveLength(2)
  })
})

describe('setLineQty', () => {
  it('changes the quantity, and removes the line at zero', () => {
    const lines = addLine([], tee)
    expect(setLineQty(lines, lineKey(tee), 4)[0].qty).toBe(4)
    expect(setLineQty(lines, lineKey(tee), 0)).toEqual([])
  })
})

describe('totals', () => {
  it('counts items and sums the subtotal from catalogue prices', () => {
    const entries = toEntries([
      { ...tee, qty: 2 },
      { slug: 'sticker-pack', color: 'white', qty: 3 },
    ])
    expect(countItems(entries)).toBe(5)
    expect(subtotalOf(entries)).toBe(2 * 20 + 3 * 2)
  })

  it('ignores lines whose product is no longer sold', () => {
    expect(toEntries([{ slug: 'discontinued', color: 'black', qty: 1 }])).toEqual([])
  })
})
