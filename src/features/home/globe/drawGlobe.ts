import { geoDistance, type GeoPath, type GeoPermissibleObjects, type GeoProjection } from 'd3-geo'
import type { ShopEvent } from '../../events/events'
import { ACCENT, ACCENT_RGB } from '../../../shared/theme'
import type { World } from './worldAtlas'

/** Where a visible pin landed on the canvas this frame. */
export interface PinPosition {
  event: ShopEvent
  x: number
  y: number
}

const SEA = '#fff'
const GRATICULE = 'rgba(0, 0, 0, 0.13)'
const LAND = '#dcdcdc'
const OUTLINE = '#8a8a8a'
const BORDER = '#9c9c9c'
const SPHERE: GeoPermissibleObjects = { type: 'Sphere' }

// Pins just short of the horizon are hidden, so they don't sit squashed on the rim.
const HORIZON_MARGIN = 0.04 // rad
// Expanding square "ping" ring around each pin, staggered per event.
const PING_PERIOD = 1800 // ms
const PING_STAGGER = 0.37 // share of a period between neighbouring events
const PING_START = 6 // px half-size
const PING_GROWTH = 14 // px it grows over one period
const PING_ALPHA = 0.55
const PIN_HALF = 4.5 // px
const PIN_HALF_HOVERED = 6.5 // px

/** Draws the sea, graticule, land, borders and outline. `path` must be bound to the canvas context. */
export function drawGlobe(
  ctx: CanvasRenderingContext2D,
  path: GeoPath,
  world: World,
  graticule: GeoPermissibleObjects,
) {
  const shape = (geo: GeoPermissibleObjects) => {
    ctx.beginPath()
    path(geo)
  }
  const stroke = (color: string, width: number) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.stroke()
  }

  shape(SPHERE)
  ctx.fillStyle = SEA
  ctx.fill()

  shape(graticule)
  stroke(GRATICULE, 0.8)

  shape(world.land)
  ctx.fillStyle = LAND
  ctx.fill()
  stroke(OUTLINE, 0.7)

  shape(world.borders)
  stroke(BORDER, 0.6)

  shape(SPHERE)
  stroke(OUTLINE, 1)
}

/** Draws a pinging square pin per event on the visible hemisphere, and returns where each landed. */
export function drawPins(
  ctx: CanvasRenderingContext2D,
  projection: GeoProjection,
  pins: ShopEvent[],
  center: [number, number],
  now: number,
  hoveredId: number | undefined,
): PinPosition[] {
  const visible: PinPosition[] = []
  for (const e of pins) {
    if (geoDistance(e.coords, center) > Math.PI / 2 - HORIZON_MARGIN) continue
    const p = projection(e.coords)
    if (!p) continue
    const [x, y] = p
    visible.push({ event: e, x, y })

    const t = (now / PING_PERIOD + e.id * PING_STAGGER) % 1
    const ring = PING_START + t * PING_GROWTH
    ctx.strokeStyle = `rgba(${ACCENT_RGB}, ${(1 - t) * PING_ALPHA})`
    ctx.lineWidth = 1.2
    ctx.strokeRect(x - ring, y - ring, ring * 2, ring * 2)

    const half = hoveredId === e.id ? PIN_HALF_HOVERED : PIN_HALF
    ctx.fillStyle = ACCENT
    ctx.fillRect(x - half, y - half, half * 2, half * 2)
  }
  return visible
}
