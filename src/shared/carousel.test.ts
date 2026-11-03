import { describe, expect, it } from 'vitest'
import { formatIndex, ringOffset, wrapIndex } from './carousel'

describe('wrapIndex', () => {
  it('loops past either end', () => {
    expect(wrapIndex(5, 5)).toBe(0)
    expect(wrapIndex(-1, 5)).toBe(4)
    expect(wrapIndex(12, 5)).toBe(2)
  })
})

describe('ringOffset', () => {
  it('gives the shortest signed distance around the ring', () => {
    expect(ringOffset(1, 0, 5)).toBe(1)
    expect(ringOffset(4, 0, 5)).toBe(-1) // going back one is shorter than forward four
    expect(ringOffset(0, 4, 5)).toBe(1)
    expect(ringOffset(2, 2, 5)).toBe(0)
  })
})

describe('formatIndex', () => {
  it('shows a 0-based index as a two-digit 1-based label', () => {
    expect(formatIndex(0)).toBe('01')
    expect(formatIndex(11)).toBe('12')
  })
})
