import { useRef, type RefObject } from 'react'
import { useAnimationFrame, useMotionValue, useReducedMotion } from 'motion/react'

const SPEED = 0.04 // px per ms
const SPEED_EASING = 0.06 // share of the gap to the target speed closed per frame

/**
 * Drives an endless strip: `x` drifts left forever. The track must render its items twice; after one full
 * copy it jumps back seamlessly. `pause` / `resume` ease it to a stop and back. Still for reduced motion.
 */
export function useDriftingStrip(trackRef: RefObject<HTMLElement | null>) {
  const x = useMotionValue(0)
  const isReducedMotion = useReducedMotion()
  const speed = useRef(1)
  const targetSpeed = useRef(1)

  useAnimationFrame((_, delta) => {
    const track = trackRef.current
    if (!track || isReducedMotion) return
    speed.current += (targetSpeed.current - speed.current) * SPEED_EASING
    const loop = track.scrollWidth / 2
    let next = x.get() - delta * SPEED * speed.current
    if (next <= -loop) next += loop
    x.set(next)
  })

  return {
    x,
    pause: () => {
      targetSpeed.current = 0
    },
    resume: () => {
      targetSpeed.current = 1
    },
  }
}
