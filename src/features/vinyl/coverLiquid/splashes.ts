import type { Lead } from '../../../shared/liquid/Blob'
import { rand } from './liquidMath'

/** One splash droplet: flung out, skids to a stop, lingers, then evaporates. */
export interface Splash {
  alive: boolean
  x: number
  y: number
  vx: number
  vy: number
  r0: number
  age: number
  life: number
  fill: string
}

export type Range = [number, number]

export const SPLASH_MAX = 36
// Distance (fraction of frame) the lead blob travels between splashes.
const SPLASH_SPACING = 0.045
// Per-second velocity retained: low = droplets skid to a stop quickly.
const SPLASH_FRICTION = 0.03
const GROW_MS = 140 // a droplet swells to full size over this long
const LINGER = 0.45 // share of its life a droplet holds full size before evaporating
const MS_PER_S = 1000

// Droplets thrown off the hover path: to either side, with some scatter.
const FAST_LEAD = 0.35 // lead speed (0–1) above which two droplets are thrown at once
const PATH_SCATTER = 0.6 // rad
const PATH_OFFSET: Range = [0.6, 1.1] // × lead radius, where along its edge a droplet leaves
const PATH_SPEED: Range = [50, 170] // px/s
const PATH_SPEED_BOOST = 160 // px/s added at full lead speed
const PATH_RADIUS: Range = [0.012, 0.03] // × frame size
const PATH_LIFE: Range = [1100, 2000] // ms

const BURST_SCATTER = 0.4 // rad of jitter on each burst droplet's direction
const BURST_LIFE: Range = [1200, 2100] // ms

/** True for droplets that punch holes (any fill other than white). */
const isHole = (fill: string) => fill !== '#fff' && fill !== 'rgb(255,255,255)'

export function createSplashPool(): Splash[] {
  return Array.from({ length: SPLASH_MAX }, () => ({ alive: false, x: 0, y: 0, vx: 0, vy: 0, r0: 0, age: 0, life: 1, fill: '#fff' }))
}

/** Starts a droplet in a free slot, or recycles the one closest to evaporating. */
export function spawnSplash(pool: Splash[], x: number, y: number, angle: number, speed: number, r0: number, life: number, fill: string) {
  const s = pool.find((p) => !p.alive) ?? pool.reduce((a, b) => (a.age / a.life > b.age / b.life ? a : b))
  Object.assign(s, { alive: true, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r0, age: 0, life, fill })
}

/** A ring of droplets: how many, their colour in the mask, speed (px/s) and radius (× frame size). */
export interface Burst {
  count: number
  fill: string
  speed: Range
  radius: Range
}

/** White drops splashing out as the cover pours in. */
export const REVEAL_BURST: Burst = { count: 12, fill: '#fff', speed: [160, 380], radius: [0.018, 0.04] }
/** Holes punched through the cover as it starts draining. */
export const DRAIN_BURST: Burst = { count: 10, fill: '#000', speed: [120, 300], radius: [0.016, 0.034] }
/** A small ring where the hover blob lands (its fill follows the cover: reveal or erase). */
export const LAND_BURST: Omit<Burst, 'fill'> = { count: 6, speed: [90, 220], radius: [0.012, 0.026] }

/** Throws a ring of droplets out from (x, y) in a frame of `size` px. */
export function burstSplashes(pool: Splash[], size: number, x: number, y: number, { count, fill, speed, radius }: Burst) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + rand(-BURST_SCATTER, BURST_SCATTER)
    spawnSplash(pool, x, y, angle, rand(...speed), size * rand(...radius), rand(...BURST_LIFE), fill)
  }
}

/** Throws droplets sideways off the lead blob's path, once per `SPLASH_SPACING` of travel. Updates `last`. */
export function flingFromLead(pool: Splash[], lead: Lead, last: { x: number; y: number }, size: number, fill: string) {
  if (Math.hypot(lead.x - last.x, lead.y - last.y) <= size * SPLASH_SPACING) return
  last.x = lead.x
  last.y = lead.y
  const count = lead.speed > FAST_LEAD ? 2 : 1
  for (let i = 0; i < count; i++) {
    const side = Math.random() < 0.5 ? -1 : 1
    const angle = lead.angle + side * (Math.PI / 2 + rand(-PATH_SCATTER, PATH_SCATTER))
    const offset = lead.r * rand(...PATH_OFFSET)
    spawnSplash(
      pool,
      lead.x + Math.cos(angle) * offset,
      lead.y + Math.sin(angle) * offset,
      angle,
      rand(...PATH_SPEED) + lead.speed * PATH_SPEED_BOOST,
      size * rand(...PATH_RADIUS),
      rand(...PATH_LIFE),
      fill,
    )
  }
}

/** Advances every droplet by `dt` ms and draws it into its circle. Reports whether any are alive, and any are holes. */
export function stepSplashes(pool: Splash[], els: (SVGCircleElement | null)[], dt: number) {
  let isSplashing = false
  let hasHoles = false
  const friction = SPLASH_FRICTION ** (dt / MS_PER_S)
  pool.forEach((s, i) => {
    if (!s.alive) return
    const el = els[i]
    s.age += dt
    const t = s.age / s.life
    if (t >= 1) {
      s.alive = false
      el?.setAttribute('r', '0')
      return
    }
    isSplashing = true
    if (isHole(s.fill)) hasHoles = true
    s.x += (s.vx * dt) / MS_PER_S
    s.y += (s.vy * dt) / MS_PER_S
    s.vx *= friction
    s.vy *= friction
    const grow = Math.min(1, s.age / GROW_MS)
    const fade = t < LINGER ? 1 : 1 - ((t - LINGER) / (1 - LINGER)) ** 2
    el?.setAttribute('cx', s.x.toFixed(2))
    el?.setAttribute('cy', s.y.toFixed(2))
    el?.setAttribute('r', (s.r0 * grow * fade).toFixed(2))
    el?.setAttribute('fill', s.fill)
  })
  return { isSplashing, hasHoles }
}
