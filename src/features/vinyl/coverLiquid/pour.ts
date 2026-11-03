import { clamp01, easeInOutCubic, easeOutBack, easeOutCubic } from './liquidMath'

const DROP_COUNT = 9

// Reveal "pour": satellite blobs that splash out from the centre before the main pool floods in.
// Randomised once per page load, so each visit pours a little differently.
export const POUR_DROPS = Array.from({ length: DROP_COUNT }, (_, i) => ({
  angle: (i / DROP_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.7,
  dist: 0.2 + Math.random() * 0.22, // × frame size
  size: 0.05 + Math.random() * 0.07, // × frame size
  delay: Math.random() * 0.25, // share of the pour before this drop starts
}))

// Main pool radius that covers the corners from the centre, with headroom for the edge warp.
const POOL = 0.9
const POOL_START = 0.2 // share of the pour before the main pool starts flooding in
const DROP_DURATION = 0.5 // share of the pour each satellite drop takes to land

/** Draws the pour at progress `p` (0 hidden – 1 fully poured) into the pool and satellite-drop circles. */
export function drawPour(
  p: number,
  size: number,
  poolEl: SVGCircleElement | null,
  dropEls: (SVGCircleElement | null)[],
) {
  const half = size / 2
  const qMain = clamp01((p - POOL_START) / (1 - POOL_START))
  poolEl?.setAttribute('r', (size * POOL * easeInOutCubic(qMain)).toFixed(2))
  POUR_DROPS.forEach((d, i) => {
    const el = dropEls[i]
    if (!el) return
    const q = clamp01((p - d.delay) / DROP_DURATION)
    const dist = size * d.dist * easeOutCubic(q)
    el.setAttribute('cx', (half + Math.cos(d.angle) * dist).toFixed(2))
    el.setAttribute('cy', (half + Math.sin(d.angle) * dist).toFixed(2))
    el.setAttribute('r', Math.max(0, size * d.size * easeOutBack(q)).toFixed(2))
  })
}

/** Instantly empties the pour, without waiting for the next animation frame. */
export function clearPour(poolEl: SVGCircleElement | null, dropEls: (SVGCircleElement | null)[]) {
  poolEl?.setAttribute('r', '0')
  dropEls.forEach((el) => el?.setAttribute('r', '0'))
}
