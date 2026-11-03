import { useEffect, useRef, type RefObject } from 'react'
import { useAnimationFrame, useSpring, type MotionValue } from 'motion/react'

/** The lead blob's position, radius and smoothed motion, reported every frame. */
export interface Lead {
  x: number
  y: number
  r: number
  speed: number
  angle: number
}

/** How one droplet in a trail follows the pointer. */
export interface TrailDrop {
  /** Size relative to the trail's radius. */
  scale: number
  stiffness: number
  /** Low damping lets a droplet overshoot and wobble like jelly. */
  damping: number
  /** How much it elongates along its direction of travel. */
  stretch: number
}

interface BlobProps extends TrailDrop {
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  radius: MotionValue<number>
  fill: MotionValue<string>
  /** Register a function that snaps this droplet straight to the pointer. */
  jumpers: RefObject<Set<() => void>>
  /** Lead blob only: called with its position, radius and smoothed motion every frame. */
  onLead?: (lead: Lead) => void
}

const HIDDEN_BELOW = 0.5 // px radius under which the droplet is treated as gone
const FULL_STRETCH_SPEED = 1800 // px/s at which the droplet is stretched the most
const SPEED_SMOOTHING = 0.1 // share of the gap to the real speed closed each frame
const TURN_MIN_SPEED = 30 // px/s; slower than this, the heading holds still
const TURN_SMOOTHING = 0.15 // share of the turn toward the real heading taken each frame
const DEGREES_PER_RADIAN = 180 / Math.PI

/** A droplet that springs after the pointer and stretches along its velocity. Draw several inside a goo filter. */
export function Blob({ pointerX, pointerY, radius, fill, scale, stiffness, damping, stretch, jumpers, onLead }: BlobProps) {
  const ref = useRef<SVGEllipseElement>(null)
  const cx = useSpring(pointerX, { stiffness, damping })
  const cy = useSpring(pointerY, { stiffness, damping })
  const motionState = useRef({ speed: 0, angle: 0, isHidden: false })

  useEffect(() => {
    const set = jumpers.current
    const jump = () => {
      cx.jump(pointerX.get())
      cy.jump(pointerY.get())
    }
    set.add(jump)
    return () => {
      set.delete(jump)
    }
  }, [cx, cy, pointerX, pointerY, jumpers])

  useAnimationFrame(() => {
    const el = ref.current
    if (!el) return
    const st = motionState.current
    const r = radius.get() * scale
    const x = cx.get()
    const y = cy.get()

    if (r <= HIDDEN_BELOW) {
      st.speed = 0
      onLead?.({ x, y, r: 0, speed: 0, angle: st.angle })
      if (!st.isHidden) {
        el.setAttribute('rx', '0')
        el.setAttribute('ry', '0')
        st.isHidden = true
      }
      return
    }
    st.isHidden = false

    const vx = cx.getVelocity()
    const vy = cy.getVelocity()
    const rawSpeed = Math.hypot(vx, vy)

    // Ease speed and heading so the shape morphs instead of snapping.
    st.speed += (Math.min(rawSpeed / FULL_STRETCH_SPEED, 1) - st.speed) * SPEED_SMOOTHING
    if (rawSpeed > TURN_MIN_SPEED) {
      const target = Math.atan2(vy, vx)
      const delta = Math.atan2(Math.sin(target - st.angle), Math.cos(target - st.angle))
      st.angle += delta * TURN_SMOOTHING
    }
    onLead?.({ x, y, r, speed: st.speed, angle: st.angle })

    const k = 1 + st.speed * stretch
    el.setAttribute('cx', x.toFixed(2))
    el.setAttribute('cy', y.toFixed(2))
    el.setAttribute('rx', (r * k).toFixed(2))
    el.setAttribute('ry', (r / Math.sqrt(k)).toFixed(2))
    el.setAttribute('transform', `rotate(${(st.angle * DEGREES_PER_RADIAN).toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})`)
    el.setAttribute('fill', fill.get())
  })

  return <ellipse ref={ref} rx={0} ry={0} />
}
