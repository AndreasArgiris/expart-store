import { useRef, type PointerEvent, type RefObject } from 'react'
import { animate, useMotionValue, type MotionValue } from 'motion/react'
import { EASE_IN_OUT } from '../../../shared/motion'
import { burstSplashes, LAND_BURST, type Splash } from './splashes'

// Lead hover blob radius as a fraction of the frame.
const SPOT = 0.11
// The blob springs in with a little overshoot, and drains away on leave.
const LAND = { type: 'spring', stiffness: 160, damping: 11 } as const
const LIFT = { duration: 0.8, ease: EASE_IN_OUT } as const

/**
 * Mouse hover over the cover: tracks the pointer, grows the droplet trail on enter (with a small landing
 * splash) and drains it on leave. Touch is ignored. Spread `hoverHandlers` onto the hover hit area.
 */
export function useCoverHover(size: number, splashes: RefObject<Splash[]>, dropletFill: MotionValue<string>) {
  const pointerX = useMotionValue(size / 2)
  const pointerY = useMotionValue(size / 2)
  const hoverRadius = useMotionValue(0)
  const jumpers = useRef(new Set<() => void>())
  const isHovering = useRef(false)
  const lastSpawn = useRef({ x: 0, y: 0 })

  const moveTo = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    pointerX.set(e.clientX - rect.left)
    pointerY.set(e.clientY - rect.top)
  }

  const hoverHandlers = {
    onPointerEnter: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') return
      moveTo(e)
      jumpers.current.forEach((jump) => jump())
      isHovering.current = true
      lastSpawn.current = { x: pointerX.get(), y: pointerY.get() }
      burstSplashes(splashes.current, size, pointerX.get(), pointerY.get(), { ...LAND_BURST, fill: dropletFill.get() })
      animate(hoverRadius, size * SPOT, LAND)
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse') moveTo(e)
    },
    onPointerLeave: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') return
      moveTo(e)
      isHovering.current = false
      animate(hoverRadius, 0, LIFT)
    },
  }

  return { pointerX, pointerY, hoverRadius, jumpers, isHovering, lastSpawn, hoverHandlers }
}
