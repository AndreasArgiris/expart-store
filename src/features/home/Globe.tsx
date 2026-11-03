import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { geoDistance, geoGraticule10, geoOrthographic, geoPath, type GeoPermissibleObjects } from 'd3-geo'
import { feature, mesh } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import worldUrl from 'world-atlas/countries-110m.json?url'
import { formatEventDate, type ShopEvent } from '../events/events'

// Auto-rotation in degrees per ms (≈ 5°/s, one turn every ~72s).
const AUTO_SPEED = 0.005
// Globe is tilted so ~22°N sits in the middle, which keeps Europe and Africa in view.
const TILT = -22
const DRAG_FACTOR = 0.28
const PIN_HIT_RADIUS = 12
const ACCENT = '#e5361f'

interface World {
  land: GeoPermissibleObjects
  borders: GeoPermissibleObjects
}

interface PinPosition {
  event: ShopEvent
  x: number
  y: number
}

interface GlobeProps {
  size: number
  pins: ShopEvent[]
  /** Called every frame with the [lon, lat] currently facing the viewer. */
  onCenterChange?: (lon: number, lat: number) => void
  onPinClick?: (event: ShopEvent) => void
}

/**
 * Slowly rotating orthographic globe with a red square pin per event. Drag to spin it, hover a pin
 * for its name and date (rotation slows down while the pointer is over the globe).
 */
export function Globe({ size, pins, onCenterChange, onPinClick }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [world, setWorld] = useState<World | null>(null)
  const [hovered, setHovered] = useState<ShopEvent | null>(null)

  const motion = useRef({ lambda: -12, phi: TILT, velocity: AUTO_SPEED, dragging: false, over: false })
  const drag = useRef({ x: 0, y: 0, t: 0, moved: 0 })
  const positions = useRef<PinPosition[]>([])
  const pinsRef = useRef(pins)
  const hoveredRef = useRef<ShopEvent | null>(null)
  const callbacks = useRef({ onCenterChange })

  useEffect(() => {
    pinsRef.current = pins
  }, [pins])

  useEffect(() => {
    hoveredRef.current = hovered
  }, [hovered])

  useEffect(() => {
    callbacks.current.onCenterChange = onCenterChange
  }, [onCenterChange])

  useEffect(() => {
    let cancelled = false
    fetch(worldUrl)
      .then((r) => r.json())
      .then((topo: Topology) => {
        if (cancelled) return
        const countries = topo.objects.countries as GeometryCollection
        setWorld({
          land: feature(topo, countries),
          borders: mesh(topo, countries, (a, b) => a !== b),
        })
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !world) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)

    const projection = geoOrthographic()
      .scale(size / 2 - 2)
      .translate([size / 2, size / 2])
      .clipAngle(90)
      .precision(0.5)
    const path = geoPath(projection, ctx)
    const graticule = geoGraticule10()
    const sphere: GeoPermissibleObjects = { type: 'Sphere' }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let frame = 0
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(now - last, 50)
      last = now
      const m = motion.current

      if (!m.dragging) {
        const target = reducedMotion ? 0 : m.over ? AUTO_SPEED * 0.25 : AUTO_SPEED
        // Ease toward the target speed (also bleeds off any fling from a drag).
        m.velocity += (target - m.velocity) * 0.04
        m.lambda += m.velocity * dt
      }
      projection.rotate([m.lambda, m.phi])

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, size, size)

      ctx.beginPath()
      path(sphere)
      ctx.fillStyle = '#fff'
      ctx.fill()

      ctx.beginPath()
      path(graticule)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.13)'
      ctx.lineWidth = 0.8
      ctx.stroke()

      ctx.beginPath()
      path(world.land)
      ctx.fillStyle = '#dcdcdc'
      ctx.fill()
      ctx.strokeStyle = '#8a8a8a'
      ctx.lineWidth = 0.7
      ctx.stroke()

      ctx.beginPath()
      path(world.borders)
      ctx.strokeStyle = '#9c9c9c'
      ctx.lineWidth = 0.6
      ctx.stroke()

      ctx.beginPath()
      path(sphere)
      ctx.strokeStyle = '#8a8a8a'
      ctx.lineWidth = 1
      ctx.stroke()

      // Pins on the visible hemisphere only.
      const center: [number, number] = [-m.lambda, -m.phi]
      const visible: PinPosition[] = []
      for (const e of pinsRef.current) {
        if (geoDistance(e.coords, center) > Math.PI / 2 - 0.04) continue
        const p = projection(e.coords)
        if (!p) continue
        const [x, y] = p
        visible.push({ event: e, x, y })

        // Expanding square "ping" ring, staggered per event.
        const t = (now / 1800 + e.id * 0.37) % 1
        const ring = 6 + t * 14
        ctx.strokeStyle = `rgba(229, 54, 31, ${(1 - t) * 0.55})`
        ctx.lineWidth = 1.2
        ctx.strokeRect(x - ring, y - ring, ring * 2, ring * 2)

        const half = hoveredRef.current?.id === e.id ? 6.5 : 4.5
        ctx.fillStyle = ACCENT
        ctx.fillRect(x - half, y - half, half * 2, half * 2)
      }
      positions.current = visible

      // Keep the tooltip glued to its pin as the globe turns.
      const tip = tooltipRef.current
      const h = hoveredRef.current
      if (tip && h) {
        const pos = visible.find((v) => v.event.id === h.id)
        tip.style.opacity = pos ? '1' : '0'
        if (pos) tip.style.transform = `translate(${pos.x + 14}px, ${pos.y - 14}px)`
      }

      callbacks.current.onCenterChange?.((((-m.lambda + 540) % 360) + 360) % 360 - 180, -m.phi)
      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [world, size])

  const localPoint = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const pinAt = (x: number, y: number) =>
    positions.current.find((p) => Math.hypot(p.x - x, p.y - y) <= PIN_HIT_RADIUS)?.event ?? null

  return (
    <div className="globe" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        className="globe-canvas"
        style={{ width: size, height: size, cursor: hovered ? 'pointer' : 'grab' }}
        role="img"
        aria-label={`Globe showing ${pins.length} event locations: ${pins.map((p) => p.city).join(', ')}`}
        onPointerEnter={() => (motion.current.over = true)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          motion.current.dragging = true
          drag.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, moved: 0 }
        }}
        onPointerMove={(e) => {
          const m = motion.current
          if (m.dragging) {
            const d = drag.current
            const dx = e.clientX - d.x
            const dy = e.clientY - d.y
            const dt = Math.max(1, e.timeStamp - d.t)
            m.lambda += dx * DRAG_FACTOR
            m.phi = Math.max(-70, Math.min(70, m.phi - dy * DRAG_FACTOR))
            m.velocity = (dx * DRAG_FACTOR) / dt
            drag.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, moved: d.moved + Math.hypot(dx, dy) }
            return
          }
          const { x, y } = localPoint(e)
          const hit = pinAt(x, y)
          if (hit?.id !== hoveredRef.current?.id) setHovered(hit)
        }}
        onPointerUp={(e) => {
          motion.current.dragging = false
          // A press that barely moved is a click: open the pin's event.
          if (drag.current.moved < 5) {
            const { x, y } = localPoint(e)
            const hit = pinAt(x, y)
            if (hit) onPinClick?.(hit)
          }
        }}
        onPointerLeave={() => {
          motion.current.over = false
          setHovered(null)
        }}
      />
      <div ref={tooltipRef} className="globe-tooltip" style={{ opacity: hovered ? 1 : 0 }} aria-hidden="true">
        {hovered && (
          <>
            <div className="sq-label">Expart {hovered.city}</div>
            <div>{formatEventDate(hovered.date)}</div>
          </>
        )}
      </div>
    </div>
  )
}
