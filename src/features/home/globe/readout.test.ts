import { describe, expect, it } from 'vitest'
import { formatCoord, formatZone } from './readout'

/** A Date whose time-zone offset is fixed, whatever zone the test machine is in. */
const dateWithOffset = (minutesBehindUtc: number) => {
  const d = new Date(0)
  d.getTimezoneOffset = () => minutesBehindUtc
  return d
}

describe('formatCoord', () => {
  it('shows four decimals with the hemisphere letter', () => {
    expect(formatCoord(35.91331, 'N', 'S')).toBe('35.9133° N')
    expect(formatCoord(-12.5, 'E', 'W')).toBe('12.5000° W')
  })
})

describe('formatZone', () => {
  it('shows whole-hour offsets without minutes', () => {
    expect(formatZone(dateWithOffset(-120))).toBe('GMT+2 (UTC+2)')
    expect(formatZone(dateWithOffset(300))).toBe('GMT-5 (UTC-5)')
  })

  it('shows half-hour offsets with minutes', () => {
    expect(formatZone(dateWithOffset(-330))).toBe('GMT+5:30 (UTC+5:30)')
  })
})
