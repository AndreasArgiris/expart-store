import { createRef, useCallback, useEffect, useRef, useState } from 'react'
import { animate, useMotionValue, useTransform } from 'motion/react'
import { EASE_IN_OUT } from '../../../shared/motion'
import type { Lead } from '../../../shared/liquid/Blob'
import { burstSplashes, createSplashPool, DRAIN_BURST, REVEAL_BURST } from './splashes'
import { useCoverFrame } from './useCoverFrame'
import { useCoverHover } from './useCoverHover'
import { useHeldCover } from './useHeldCover'

// Reveal pour timing: long, decelerating tail so it lands softly.
const POUR_IN = { duration: 2.2, ease: [0.3, 0.05, 0.15, 1] } as const
const DRAIN = { duration: 1.4, ease: 'linear' } as const
// Hover droplets switch between revealing and erasing over this long.
const COVER_ALPHA = { duration: 0.7, ease: EASE_IN_OUT } as const
const MAX_CHANNEL = 255

/** The SVG nodes the liquid draws into directly every frame (bypassing React for speed). One stable object. */
function useCoverElements() {
  const [els] = useState(() => ({
    gooOffset: createRef<SVGFEOffsetElement>(),
    refractOffset: createRef<SVGFEOffsetElement>(),
    refractMap: createRef<SVGFEDisplacementMapElement>(),
    pool: createRef<SVGCircleElement>(),
    pourDrops: { current: [] as (SVGCircleElement | null)[] },
    splashDrops: { current: [] as (SVGCircleElement | null)[] },
    clean: createRef<SVGGElement>(),
  }))
  return els
}
export type CoverElements = ReturnType<typeof useCoverElements>

/**
 * Everything behind the liquid cover: the pour/drain when `isRevealed` toggles, splashes, the hover trail and
 * the release-switch fade. Returns the motion values and refs `CoverLiquid` renders with.
 */
export function useCoverLiquid(src: string, size: number, isRevealed: boolean) {
  const els = useCoverElements()
  const splashes = useRef(createSplashPool())
  const lead = useRef<Lead>({ x: 0, y: 0, r: 0, speed: 0, angle: 0 })
  const hasMounted = useRef(false)

  const pour = useMotionValue(isRevealed ? 1 : 0)
  // Hover droplets reveal (white) with the cover hidden and erase (black) with it shown.
  const coverAlpha = useMotionValue(isRevealed ? 1 : 0)
  const dropletFill = useTransform(coverAlpha, (a) => {
    const c = Math.round(MAX_CHANNEL * (1 - a))
    return `rgb(${c},${c},${c})`
  })

  const { pointerX, pointerY, hoverRadius, jumpers, isHovering, lastSpawn, hoverHandlers } = useCoverHover(
    size,
    splashes,
    dropletFill,
  )
  const clearMask = useCoverFrame({ size, els, pour, splashes, lead, dropletFill, hoverRadius, isHovering, lastSpawn })
  const { shownSrc, switchFade } = useHeldCover(src, isRevealed, pour, coverAlpha, clearMask)

  const setLead = useCallback((next: Lead) => {
    lead.current = next
  }, [])

  useEffect(() => {
    const a = animate(pour, isRevealed ? 1 : 0, isRevealed ? POUR_IN : DRAIN)
    const b = animate(coverAlpha, isRevealed ? 1 : 0, COVER_ALPHA)

    // Splash as the cover pours in (white drops) or starts draining (holes punched through it).
    if (hasMounted.current) {
      const c = size / 2
      burstSplashes(splashes.current, size, c, c, isRevealed ? REVEAL_BURST : DRAIN_BURST)
    }
    hasMounted.current = true

    return () => {
      a.stop()
      b.stop()
    }
  }, [isRevealed, size, pour, coverAlpha])

  return {
    els,
    shownSrc,
    switchFade,
    trail: { pointerX, pointerY, radius: hoverRadius, fill: dropletFill, jumpers },
    setLead,
    hoverHandlers,
  }
}
