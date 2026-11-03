/** Formatting for the readouts beside the globe: local time, time zone and coordinates. */

const MINUTES_PER_HOUR = 60
const COORD_DECIMALS = 4

/** "14:05:09", 24-hour. */
export const formatTime = (d: Date) =>
  d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

/** The visitor's zone as an offset: "GMT+2 (UTC+2)", or "GMT+5:30 (UTC+5:30)". */
export function formatZone(d: Date) {
  const minutes = -d.getTimezoneOffset()
  const sign = minutes >= 0 ? '+' : '-'
  const h = Math.floor(Math.abs(minutes) / MINUTES_PER_HOUR)
  const m = Math.abs(minutes) % MINUTES_PER_HOUR
  const offset = `${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`
  return `GMT${offset} (UTC${offset})`
}

/** "35.8989° N": absolute value with the hemisphere letter (`pos` when ≥ 0, else `neg`). */
export const formatCoord = (value: number, pos: string, neg: string) =>
  `${Math.abs(value).toFixed(COORD_DECIMALS)}° ${value >= 0 ? pos : neg}`
