import { useCallback, useRef, type RefObject } from 'react'
import { useAnimationFrame, type MotionValue } from 'motion/react'
import type { Lead } from '../../../shared/liquid/Blob'
import { smoothstep } from './liquidMath'
import { clearPour, drawPour } from './pour'
import { flingFromLead, stepSplashes, type Splash } from './splashes'
import type { CoverElements } from './useCoverLiquid'

const MAX_DT = 50 // ms, so a backgrounded tab doesn't jump the physics on return
const MS_PER_S = 1000
const VISIBLE_RADIUS = 0.5 // px; a smaller hover blob counts as gone
const LEAD_FLINGS_ABOVE = 1 // px lead radius before it starts flinging splashes
// Portion of the pour (0–1) over which a clean, unmasked cover fades in to settle the liquid edges.
const SETTLE_FROM = 0.8
// Share of the gap closed per frame as the clean cover steps aside for holes (fast) or returns (slow).
const HOLE_MIX_IN = 0.2
const HOLE_MIX_OUT = 0.04
const OPACITY_STEPS = 1000 // round opacity so the DOM is only touched when it visibly changes
// Noise drift: a slow loop, as a share of the frame, so edges flow rather than flicker.
const NOISE_DRIFT = 0.08
const NOISE_RATE_X = 0.5
const NOISE_RATE_Y = 0.37
// Max ripple (px) the cover gets while the hover blob moves fast.
const REFRACTION = 18
const REFRACTION_STEPS = 10

interface CoverFrameArgs {
  size: number
  els: CoverElements
  pour: MotionValue<number>
  splashes: RefObject<Splash[]>
  lead: RefObject<Lead>
  dropletFill: MotionValue<string>
  hoverRadius: MotionValue<number>
  isHovering: RefObject<boolean>
  lastSpawn: RefObject<{ x: number; y: number }>
}

/**
 * The cover liquid's per-frame drawing: pour, splashes, the clean-cover settle, noise drift and refraction.
 * Returns a stable `clearMask` that empties the pour and clean cover immediately, without waiting a frame.
 */
export function useCoverFrame({ size, els, pour, splashes, lead, dropletFill, hoverRadius, isHovering, lastSpawn }: CoverFrameArgs) {
  // 0–1: how much hover holes/splashes need the masked layer visible (clean layer steps aside).
  const holeMix = useRef(0)
  const lastRefraction = useRef(-1)
  const lastClean = useRef(-1)

  const clearMask = useCallback(() => {
    clearPour(els.pool.current, els.pourDrops.current)
    els.clean.current?.setAttribute('opacity', '0')
    lastClean.current = 0
  }, [els])

  useAnimationFrame((time, rawDelta) => {
    const dt = Math.min(rawDelta, MAX_DT)

    // Pour: satellites splash out first, then the main pool floods over them.
    const p = pour.get()
    drawPour(p, size, els.pool.current, els.pourDrops.current)

    // Splashes flung sideways off the hover path, then their physics.
    const l = lead.current
    if (isHovering.current && l.r > LEAD_FLINGS_ABOVE) flingFromLead(splashes.current, l, lastSpawn.current, size, dropletFill.get())
    const { isSplashing, hasHoles } = stepSplashes(splashes.current, els.splashDrops.current, dt)

    // Settle: fade a clean cover over the end of the pour so the warped edges melt away.
    // It steps aside (quickly) while hover holes or hole-splashes need to show, and returns slowly.
    const isHoverShowing = hoverRadius.get() > VISIBLE_RADIUS
    const holeTarget = isHovering.current || isHoverShowing || hasHoles ? 1 : 0
    holeMix.current += (holeTarget - holeMix.current) * (holeTarget ? HOLE_MIX_IN : HOLE_MIX_OUT)
    const clean = Math.round(smoothstep(SETTLE_FROM, 1, p) * (1 - holeMix.current) * OPACITY_STEPS) / OPACITY_STEPS
    if (clean !== lastClean.current) {
      els.clean.current?.setAttribute('opacity', String(clean))
      lastClean.current = clean
    }

    if (!(isSplashing || isHoverShowing || pour.isAnimating() || p > 0)) return

    const sec = time / MS_PER_S
    const dx = (Math.sin(sec * NOISE_RATE_X) * size * NOISE_DRIFT).toFixed(2)
    const dy = (Math.cos(sec * NOISE_RATE_Y) * size * NOISE_DRIFT).toFixed(2)
    els.gooOffset.current?.setAttribute('dx', dx)
    els.gooOffset.current?.setAttribute('dy', dy)
    els.refractOffset.current?.setAttribute('dx', dy)
    els.refractOffset.current?.setAttribute('dy', dx)

    // Ripple the cover while the hover blob moves; settle back to sharp when it stops.
    const refraction = Math.round(l.speed * REFRACTION * REFRACTION_STEPS) / REFRACTION_STEPS
    if (refraction !== lastRefraction.current) {
      els.refractMap.current?.setAttribute('scale', String(refraction))
      lastRefraction.current = refraction
    }
  })

  return clearMask
}
