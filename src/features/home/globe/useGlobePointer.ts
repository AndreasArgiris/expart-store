import { useRef, useState, type PointerEvent } from 'react'
import type { ShopEvent } from '../../events/events'
import type { PinPosition } from './drawGlobe'

// Auto-rotation in degrees per ms (≈ 5°/s, one turn every ~72s).
export const AUTO_SPEED = 0.005
// Globe is tilted so ~22°N sits in the middle, which keeps Europe and Africa in view.
const TILT = -22
const START_LONGITUDE = -12
const DRAG_FACTOR = 0.28 // degrees of turn per px dragged
const MAX_TILT = 70 // degrees the globe can be tipped by dragging
const PIN_HIT_RADIUS = 12 // px
const CLICK_SLOP = 5 // px a press can move and still count as a click

/** The globe's rotation, mutated in place every frame by the loop and by dragging. */
export interface Spin {
  lambda: number
  phi: number
  velocity: number
  isDragging: boolean
  isOver: boolean
}

type CanvasPointer = PointerEvent<HTMLCanvasElement>

const localPoint = (e: CanvasPointer) => {
  const rect = e.currentTarget.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

/**
 * Pointer interaction with the globe canvas: drag to spin (with fling), hover a pin to highlight it, click a
 * pin to open its event. `positions` must be kept up to date with where pins were drawn.
 */
export function useGlobePointer(onPinClick?: (event: ShopEvent) => void) {
  const spin = useRef<Spin>({ lambda: START_LONGITUDE, phi: TILT, velocity: AUTO_SPEED, isDragging: false, isOver: false })
  const positions = useRef<PinPosition[]>([])
  const drag = useRef({ x: 0, y: 0, t: 0, moved: 0 })
  const [hovered, setHovered] = useState<ShopEvent | null>(null)

  const pinAt = (e: CanvasPointer) => {
    const { x, y } = localPoint(e)
    return positions.current.find((p) => Math.hypot(p.x - x, p.y - y) <= PIN_HIT_RADIUS)?.event ?? null
  }

  const handleDrag = (e: CanvasPointer) => {
    const m = spin.current
    const d = drag.current
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    const dt = Math.max(1, e.timeStamp - d.t)
    m.lambda += dx * DRAG_FACTOR
    m.phi = Math.max(-MAX_TILT, Math.min(MAX_TILT, m.phi - dy * DRAG_FACTOR))
    m.velocity = (dx * DRAG_FACTOR) / dt
    drag.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, moved: d.moved + Math.hypot(dx, dy) }
  }

  const handlers = {
    onPointerEnter: () => {
      spin.current.isOver = true
    },
    onPointerDown: (e: CanvasPointer) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      spin.current.isDragging = true
      drag.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, moved: 0 }
    },
    onPointerMove: (e: CanvasPointer) => {
      if (spin.current.isDragging) return handleDrag(e)
      const hit = pinAt(e)
      if (hit?.id !== hovered?.id) setHovered(hit)
    },
    onPointerUp: (e: CanvasPointer) => {
      spin.current.isDragging = false
      // A press that barely moved is a click: open the pin's event.
      if (drag.current.moved >= CLICK_SLOP) return
      const hit = pinAt(e)
      if (hit) onPinClick?.(hit)
    },
    onPointerLeave: () => {
      spin.current.isOver = false
      setHovered(null)
    },
  }

  return { spin, positions, hovered, handlers }
}
