import { useRef, type PointerEvent } from 'react'
import { animate, useMotionValue } from 'motion/react'
import { EASE_IN_OUT } from '../shared/motion'

const LAND = { type: 'spring', stiffness: 170, damping: 12 } as const // blob lands with a little overshoot
const DRAIN = { duration: 0.7, ease: EASE_IN_OUT } as const
const FILL = '#fff' // white in the mask = show the red copy

type SvgPointer = PointerEvent<SVGSVGElement>

/**
 * Mouse hover over the logo, in its viewBox units (`vbW` × `vbH`): the liquid trail grows to `spot` on enter
 * and drains away on leave. Touch is ignored. Spread `handlers` onto the <svg>, and `trail` onto each `Blob`.
 */
export function useLogoLiquid(vbW: number, vbH: number, spot: number) {
  const pointerX = useMotionValue(vbW / 2)
  const pointerY = useMotionValue(vbH / 2)
  const radius = useMotionValue(0)
  const fill = useMotionValue(FILL)
  const jumpers = useRef(new Set<() => void>())

  const moveTo = (e: SvgPointer) => {
    const rect = e.currentTarget.getBoundingClientRect()
    pointerX.set(((e.clientX - rect.left) / rect.width) * vbW)
    pointerY.set(((e.clientY - rect.top) / rect.height) * vbH)
  }

  const handlers = {
    onPointerEnter: (e: SvgPointer) => {
      if (e.pointerType !== 'mouse') return
      moveTo(e)
      jumpers.current.forEach((jump) => jump())
      animate(radius, spot, LAND)
    },
    onPointerMove: (e: SvgPointer) => {
      if (e.pointerType === 'mouse') moveTo(e)
    },
    onPointerLeave: (e: SvgPointer) => {
      if (e.pointerType !== 'mouse') return
      moveTo(e)
      animate(radius, 0, DRAIN)
    },
  }

  return { trail: { pointerX, pointerY, radius, fill, jumpers }, handlers }
}
