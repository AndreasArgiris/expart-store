/** Helpers for the looping carousels (events posters, vinyl discs). */

/** Wraps any index onto 0..n-1, so stepping past either end loops round. */
export const wrapIndex = (i: number, n: number) => ((i % n) + n) % n

/** Shortest signed distance from `active` to `i` on a ring of `n` items. */
export function ringOffset(i: number, active: number, n: number) {
  let d = i - active
  if (d > n / 2) d -= n
  if (d < -n / 2) d += n
  return d
}

/** A 0-based index as a two-digit, 1-based label: 0 → "01". */
export const formatIndex = (i: number) => String(i + 1).padStart(2, '0')
