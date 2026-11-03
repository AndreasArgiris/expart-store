import { useEffect, useRef, type RefObject } from 'react'
import { useReducedMotion } from 'motion/react'
import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import type { ShopEvent } from '../../events/events'
import { drawGlobe, drawPins, type PinPosition } from './drawGlobe'
import { AUTO_SPEED, type Spin } from './useGlobePointer'
import type { World } from './worldAtlas'

const MAX_DT = 50 // ms, so a backgrounded tab doesn't spin the globe on return
const HOVER_SLOWDOWN = 0.25 // share of the auto speed while the pointer is over the globe
const SPEED_EASING = 0.04 // share of the gap to the target speed closed per frame (also bleeds off flings)
const RIM = 2 // px between the globe and the canvas edge
const TOOLTIP_OFFSET = 14 // px from the pin to the tooltip
const HALF_TURN = 180

interface GlobeLoopArgs {
  canvasRef: RefObject<HTMLCanvasElement | null>
  tooltipRef: RefObject<HTMLDivElement | null>
  world: World | null
  size: number
  pins: ShopEvent[]
  hovered: ShopEvent | null
  spin: RefObject<Spin>
  positions: RefObject<PinPosition[]>
  /** Called every frame with the [lon, lat] currently facing the viewer. */
  onCenterChange?: (lon: number, lat: number) => void
}

/** Keeps a value readable from inside the animation loop without restarting it when the value changes. */
function useLatest<T>(value: T) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref
}

/** Wraps a longitude into -180..180. */
const wrapLongitude = (lon: number) => ((((lon + HALF_TURN * 3) % 360) + 360) % 360) - HALF_TURN

/** Runs the globe's animation loop: eases the spin, draws the globe and pins, and keeps the tooltip on its pin. */
export function useGlobeLoop({
  canvasRef,
  tooltipRef,
  world,
  size,
  pins,
  hovered,
  spin,
  positions,
  onCenterChange,
}: GlobeLoopArgs) {
  const isReducedMotion = useReducedMotion()
  const pinsRef = useLatest(pins)
  const hoveredRef = useLatest(hovered)
  const onCenterChangeRef = useLatest(onCenterChange)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !world) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)

    const projection = geoOrthographic()
      .scale(size / 2 - RIM)
      .translate([size / 2, size / 2])
      .clipAngle(90)
      .precision(0.5)
    const path = geoPath(projection, ctx)
    const graticule = geoGraticule10()

    let frame = 0
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(now - last, MAX_DT)
      last = now
      const m = spin.current

      if (!m.isDragging) {
        const target = isReducedMotion ? 0 : m.isOver ? AUTO_SPEED * HOVER_SLOWDOWN : AUTO_SPEED
        m.velocity += (target - m.velocity) * SPEED_EASING
        m.lambda += m.velocity * dt
      }
      projection.rotate([m.lambda, m.phi])

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, size, size)
      drawGlobe(ctx, path, world, graticule)
      const visible = drawPins(ctx, projection, pinsRef.current, [-m.lambda, -m.phi], now, hoveredRef.current?.id)
      positions.current = visible

      // Keep the tooltip glued to its pin as the globe turns.
      const tip = tooltipRef.current
      const h = hoveredRef.current
      if (tip && h) {
        const pos = visible.find((v) => v.event.id === h.id)
        tip.style.opacity = pos ? '1' : '0'
        if (pos) tip.style.transform = `translate(${pos.x + TOOLTIP_OFFSET}px, ${pos.y - TOOLTIP_OFFSET}px)`
      }

      onCenterChangeRef.current?.(wrapLongitude(-m.lambda), -m.phi)
      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [world, size, isReducedMotion, canvasRef, tooltipRef, spin, positions, pinsRef, hoveredRef, onCenterChangeRef])
}
