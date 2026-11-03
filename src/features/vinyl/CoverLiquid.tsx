import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'
import { animate, motion, useAnimationFrame, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react'
import { EASE_IN_OUT } from '../../shared/motion'
import { useSvgId } from '../../shared/hooks/useSvgId'

// Lead hover blob radius as a fraction of the frame.
const SPOT = 0.11
// Trailing droplets: each smaller and lazier. Low damping lets them overshoot and wobble like jelly;
// `stretch` is how much they elongate along their direction of travel.
const TRAIL = [
  { scale: 1, stiffness: 130, damping: 14, stretch: 1 },
  { scale: 0.72, stiffness: 85, damping: 12, stretch: 0.8 },
  { scale: 0.52, stiffness: 55, damping: 10, stretch: 0.6 },
  { scale: 0.38, stiffness: 34, damping: 9, stretch: 0.4 },
]

// Splash droplets flung off the hover path (and on enter / reveal / hide).
const SPLASH_MAX = 36
const SPLASH_SLOTS = Array.from({ length: SPLASH_MAX }, (_, i) => i)
// Distance (fraction of frame) the lead blob travels between splashes.
const SPLASH_SPACING = 0.045
// Per-second velocity retained: low = droplets skid to a stop quickly.
const SPLASH_FRICTION = 0.03

// Reveal "pour": satellite blobs that splash out from the centre before the main pool floods in.
const POUR_DROPS = Array.from({ length: 9 }, (_, i) => ({
  angle: (i / 9) * Math.PI * 2 + (Math.random() - 0.5) * 0.7,
  dist: 0.2 + Math.random() * 0.22,
  size: 0.05 + Math.random() * 0.07,
  delay: Math.random() * 0.25,
}))
// Main pool radius that covers the corners from the centre, with headroom for the edge warp.
const POOL = 0.9

const PADDING = 0.07
// Max ripple (px) the cover gets while the hover blob moves fast.
const REFRACTION = 18
// Seconds a revealed cover takes to clear when switching release (the discs slide for 0.7s).
const SWITCH_FADE = 0.25
// Reveal pour timing: long, decelerating tail so it lands softly.
const pourOut = [0.3, 0.05, 0.15, 1] as const
// Portion of the pour (0–1) over which a clean, unmasked cover fades in to settle the liquid edges.
const SETTLE_FROM = 0.8

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const easeOutBack = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2
const rand = (min: number, max: number) => min + Math.random() * (max - min)

interface Lead {
  x: number
  y: number
  r: number
  speed: number
  angle: number
}

interface Splash {
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

interface BlobProps {
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  radius: MotionValue<number>
  fill: MotionValue<string>
  scale: number
  stiffness: number
  damping: number
  stretch: number
  jumpers: RefObject<Set<() => void>>
  /** Lead blob only: called with its position, radius and smoothed motion every frame. */
  onLead?: (lead: Lead) => void
}

/** A droplet that springs after the pointer and stretches along its velocity. Also used by LiquidLogo. */
export function Blob({ pointerX, pointerY, radius, fill, scale, stiffness, damping, stretch, jumpers, onLead }: BlobProps) {
  const ref = useRef<SVGEllipseElement>(null)
  const cx = useSpring(pointerX, { stiffness, damping })
  const cy = useSpring(pointerY, { stiffness, damping })
  const motionState = useRef({ speed: 0, angle: 0, hidden: false })

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

    if (r <= 0.5) {
      st.speed = 0
      onLead?.({ x, y, r: 0, speed: 0, angle: st.angle })
      if (!st.hidden) {
        el.setAttribute('rx', '0')
        el.setAttribute('ry', '0')
        st.hidden = true
      }
      return
    }
    st.hidden = false

    const vx = cx.getVelocity()
    const vy = cy.getVelocity()
    const rawSpeed = Math.hypot(vx, vy)

    // Ease speed and heading so the shape morphs instead of snapping.
    st.speed += (Math.min(rawSpeed / 1800, 1) - st.speed) * 0.1
    if (rawSpeed > 30) {
      const target = Math.atan2(vy, vx)
      const delta = Math.atan2(Math.sin(target - st.angle), Math.cos(target - st.angle))
      st.angle += delta * 0.15
    }
    onLead?.({ x, y, r, speed: st.speed, angle: st.angle })

    const k = 1 + st.speed * stretch
    el.setAttribute('cx', x.toFixed(2))
    el.setAttribute('cy', y.toFixed(2))
    el.setAttribute('rx', (r * k).toFixed(2))
    el.setAttribute('ry', (r / Math.sqrt(k)).toFixed(2))
    el.setAttribute('transform', `rotate(${((st.angle * 180) / Math.PI).toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})`)
    el.setAttribute('fill', fill.get())
  })

  return <ellipse ref={ref} rx={0} ry={0} />
}

interface CoverLiquidProps {
  src: string
  alt: string
  size: number
  showInfo: boolean
}

/**
 * Cover art revealed through a liquid SVG mask: blurred + thresholded ("goo") shapes whose edges are
 * warped by slowly drifting noise. Revealing pours the cover out from the centre in a splash and
 * hiding drains it back; hovering drags a small wobbling droplet trail that flings off splashes,
 * revealing the cover or, when it's shown, cutting through it to the vinyl.
 */
export function CoverLiquid({ src, alt, size, showInfo }: CoverLiquidProps) {
  const id = useSvgId()
  const gooId = `liquid-${id}`
  const refractId = `refract-${id}`
  const maskId = `liquid-mask-${id}`

  const gooOffsetRef = useRef<SVGFEOffsetElement>(null)
  const refractOffsetRef = useRef<SVGFEOffsetElement>(null)
  const refractMapRef = useRef<SVGFEDisplacementMapElement>(null)
  const poolRef = useRef<SVGCircleElement>(null)
  const pourEls = useRef<(SVGCircleElement | null)[]>([])
  const splashEls = useRef<(SVGCircleElement | null)[]>([])
  const splashes = useRef<Splash[]>(
    Array.from({ length: SPLASH_MAX }, () => ({ alive: false, x: 0, y: 0, vx: 0, vy: 0, r0: 0, age: 0, life: 1, fill: '#fff' })),
  )
  const jumpers = useRef(new Set<() => void>())
  const lead = useRef<Lead>({ x: 0, y: 0, r: 0, speed: 0, angle: 0 })
  const lastSpawn = useRef({ x: 0, y: 0 })
  const hovering = useRef(false)
  const lastRefraction = useRef(-1)
  const mounted = useRef(false)
  const cleanRef = useRef<SVGGElement>(null)
  // 0–1: how much hover holes/splashes need the masked layer visible (clean layer steps aside).
  const holeMix = useRef(0)
  const lastClean = useRef(-1)

  const pointerX = useMotionValue(size / 2)
  const pointerY = useMotionValue(size / 2)
  const hoverRadius = useMotionValue(0)
  const pour = useMotionValue(showInfo ? 1 : 0)

  // Whole-cover opacity, used to clear a revealed cover quickly when the release changes.
  const switchFade = useMotionValue(1)

  // Changing release while a cover is out: keep drawing the outgoing art while it fades away, so the
  // next release's art never flashes in and the old cover never lingers over the next vinyl.
  const [prevSrc, setPrevSrc] = useState(src)
  const [heldSrc, setHeldSrc] = useState<string | null>(null)
  if (src !== prevSrc) {
    setPrevSrc(src)
    if (!showInfo && pour.get() > 0) setHeldSrc(heldSrc ?? prevSrc)
  }
  if (showInfo && heldSrc) setHeldSrc(null)
  const shownSrc = heldSrc ?? src
  // Hover droplets reveal (white) with the cover hidden and erase (black) with it shown.
  const coverAlpha = useMotionValue(showInfo ? 1 : 0)
  const dropletFill = useTransform(coverAlpha, (a) => {
    const c = Math.round(255 * (1 - a))
    return `rgb(${c},${c},${c})`
  })

  const setLead = useCallback((next: Lead) => {
    lead.current = next
  }, [])

  const spawn = useCallback((x: number, y: number, angle: number, speed: number, r0: number, life: number, fill: string) => {
    const pool = splashes.current
    const s = pool.find((p) => !p.alive) ?? pool.reduce((a, b) => (a.age / a.life > b.age / b.life ? a : b))
    Object.assign(s, { alive: true, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r0, age: 0, life, fill })
  }, [])

  const burst = useCallback(
    (x: number, y: number, count: number, fill: string, spread: [number, number], radius: [number, number]) => {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + rand(-0.4, 0.4)
        spawn(x, y, angle, rand(...spread), size * rand(...radius), rand(1200, 2100), fill)
      }
    },
    [size, spawn],
  )

  useEffect(() => {
    const a = animate(
      pour,
      showInfo ? 1 : 0,
      showInfo ? { duration: 2.2, ease: pourOut } : { duration: 1.4, ease: 'linear' },
    )
    const b = animate(coverAlpha, showInfo ? 1 : 0, { duration: 0.7, ease: EASE_IN_OUT })

    // Splash as the cover pours in (white drops) or starts draining (holes punched through it).
    if (mounted.current) {
      const c = size / 2
      if (showInfo) burst(c, c, 12, '#fff', [160, 380], [0.018, 0.04])
      else burst(c, c, 10, '#000', [120, 300], [0.016, 0.034])
    }
    mounted.current = true

    return () => {
      a.stop()
      b.stop()
    }
  }, [showInfo, size, pour, coverAlpha, burst])

  // Release changed with the cover out: fade the old cover away fast, then reset to fully hidden.
  // (jump() also stops the slow drain, so nothing is left to finish on the next release.)
  useEffect(() => {
    if (!heldSrc) return
    const fade = animate(switchFade, 0, {
      duration: SWITCH_FADE,
      ease: EASE_IN_OUT,
      onComplete: () => {
        pour.jump(0)
        coverAlpha.jump(0)
        // Clear the mask now rather than on the next animation frame, so the new art can't flash in
        // for a frame once the opacity comes back.
        poolRef.current?.setAttribute('r', '0')
        pourEls.current.forEach((el) => el?.setAttribute('r', '0'))
        cleanRef.current?.setAttribute('opacity', '0')
        lastClean.current = 0
        setHeldSrc(null)
      },
    })
    return () => {
      fade.stop()
      switchFade.jump(1)
    }
  }, [heldSrc, switchFade, pour, coverAlpha])

  useAnimationFrame((time, rawDelta) => {
    const dt = Math.min(rawDelta, 50)
    const half = size / 2

    // --- Pour: satellites splash out first, then the main pool floods over them.
    const p = pour.get()
    const qMain = clamp01((p - 0.2) / 0.8)
    poolRef.current?.setAttribute('r', (size * POOL * easeInOutCubic(qMain)).toFixed(2))
    POUR_DROPS.forEach((d, i) => {
      const el = pourEls.current[i]
      if (!el) return
      const q = clamp01((p - d.delay) / 0.5)
      const dist = size * d.dist * easeOutCubic(q)
      el.setAttribute('cx', (half + Math.cos(d.angle) * dist).toFixed(2))
      el.setAttribute('cy', (half + Math.sin(d.angle) * dist).toFixed(2))
      el.setAttribute('r', Math.max(0, size * d.size * easeOutBack(q)).toFixed(2))
    })

    // --- Splashes flung sideways off the hover path.
    const l = lead.current
    if (hovering.current && l.r > 1) {
      const last = lastSpawn.current
      if (Math.hypot(l.x - last.x, l.y - last.y) > size * SPLASH_SPACING) {
        last.x = l.x
        last.y = l.y
        const count = l.speed > 0.35 ? 2 : 1
        for (let i = 0; i < count; i++) {
          const side = Math.random() < 0.5 ? -1 : 1
          const angle = l.angle + side * (Math.PI / 2 + rand(-0.6, 0.6))
          const offset = l.r * rand(0.6, 1.1)
          spawn(
            l.x + Math.cos(angle) * offset,
            l.y + Math.sin(angle) * offset,
            angle,
            rand(50, 170) + l.speed * 160,
            size * rand(0.012, 0.03),
            rand(1100, 2000),
            dropletFill.get(),
          )
        }
      }
    }

    // --- Splash physics: skid out, linger, then evaporate.
    let splashing = false
    let holes = false
    const friction = SPLASH_FRICTION ** (dt / 1000)
    splashes.current.forEach((s, i) => {
      if (!s.alive) return
      const el = splashEls.current[i]
      s.age += dt
      const t = s.age / s.life
      if (t >= 1) {
        s.alive = false
        el?.setAttribute('r', '0')
        return
      }
      splashing = true
      if (s.fill !== '#fff' && s.fill !== 'rgb(255,255,255)') holes = true
      s.x += (s.vx * dt) / 1000
      s.y += (s.vy * dt) / 1000
      s.vx *= friction
      s.vy *= friction
      const grow = Math.min(1, s.age / 140)
      const fade = t < 0.45 ? 1 : 1 - ((t - 0.45) / 0.55) ** 2
      el?.setAttribute('cx', s.x.toFixed(2))
      el?.setAttribute('cy', s.y.toFixed(2))
      el?.setAttribute('r', (s.r0 * grow * fade).toFixed(2))
      el?.setAttribute('fill', s.fill)
    })

    // --- Settle: fade a clean cover over the end of the pour so the warped edges melt away.
    // It steps aside (quickly) while hover holes or hole-splashes need to show, and returns slowly.
    const holeTarget = hovering.current || hoverRadius.get() > 0.5 || holes ? 1 : 0
    holeMix.current += (holeTarget - holeMix.current) * (holeTarget ? 0.2 : 0.04)
    const clean = Math.round(smoothstep(SETTLE_FROM, 1, p) * (1 - holeMix.current) * 1000) / 1000
    if (clean !== lastClean.current) {
      cleanRef.current?.setAttribute('opacity', String(clean))
      lastClean.current = clean
    }

    const active = splashing || hoverRadius.get() > 0.5 || pour.isAnimating() || p > 0
    if (!active) return

    // Drift the noise in a slow loop so edges flow rather than flicker.
    const sec = time / 1000
    const dx = (Math.sin(sec * 0.5) * size * 0.08).toFixed(2)
    const dy = (Math.cos(sec * 0.37) * size * 0.08).toFixed(2)
    gooOffsetRef.current?.setAttribute('dx', dx)
    gooOffsetRef.current?.setAttribute('dy', dy)
    refractOffsetRef.current?.setAttribute('dx', dy)
    refractOffsetRef.current?.setAttribute('dy', dx)

    // Ripple the cover while the hover blob moves; settle back to sharp when it stops.
    const refraction = Math.round(l.speed * REFRACTION * 10) / 10
    if (refraction !== lastRefraction.current) {
      refractMapRef.current?.setAttribute('scale', String(refraction))
      lastRefraction.current = refraction
    }
  })

  const moveTo = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    pointerX.set(e.clientX - rect.left)
    pointerY.set(e.clientY - rect.top)
  }

  const pad = size * PADDING
  const region = { x: -size * 0.25, y: -size * 0.25, width: size * 1.5, height: size * 1.5 }

  return (
    <>
      <motion.svg
        className="cover-liquid"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={alt}
        aria-hidden={!showInfo}
        style={{ opacity: switchFade }}
      >
        <defs>
          <filter id={gooId} filterUnits="userSpaceOnUse" {...region} colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves={1} seed={7} result="noiseRaw" />
            <feOffset ref={gooOffsetRef} in="noiseRaw" result="noise" />
            <feGaussianBlur in="SourceGraphic" stdDeviation={size * 0.022} result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="goo" />
            <feDisplacementMap in="goo" in2="noise" scale={size * 0.035} xChannelSelector="R" yChannelSelector="G" result="warped" />
            <feGaussianBlur in="warped" stdDeviation={1.2} />
          </filter>

          <filter id={refractId} filterUnits="userSpaceOnUse" {...region} colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={1} seed={3} result="noiseRaw" />
            <feOffset ref={refractOffsetRef} in="noiseRaw" result="noise" />
            <feDisplacementMap ref={refractMapRef} in="SourceGraphic" in2="noise" scale={0} xChannelSelector="R" yChannelSelector="G" />
          </filter>

          <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={size} height={size}>
            <g filter={`url(#${gooId})`}>
              <circle ref={poolRef} cx={size / 2} cy={size / 2} r={0} fill="#fff" />
              {POUR_DROPS.map((_, i) => (
                <circle key={`pour-${i}`} ref={(el) => void (pourEls.current[i] = el)} r={0} fill="#fff" />
              ))}
              {TRAIL.map((t, i) => (
                <Blob
                  key={`trail-${i}`}
                  pointerX={pointerX}
                  pointerY={pointerY}
                  radius={hoverRadius}
                  fill={dropletFill}
                  jumpers={jumpers}
                  onLead={i === 0 ? setLead : undefined}
                  {...t}
                />
              ))}
              {SPLASH_SLOTS.map((i) => (
                <circle key={`splash-${i}`} ref={(el) => void (splashEls.current[i] = el)} r={0} />
              ))}
            </g>
          </mask>
        </defs>

        <g mask={`url(#${maskId})`}>
          <rect width={size} height={size} fill="#fff" />
          <image
            href={shownSrc}
            x={pad}
            y={pad}
            width={size - pad * 2}
            height={size - pad * 2}
            preserveAspectRatio="xMidYMid slice"
            filter={`url(#${refractId})`}
          />
        </g>

        <g ref={cleanRef} opacity={0}>
          <rect width={size} height={size} fill="#fff" />
          <image href={shownSrc} x={pad} y={pad} width={size - pad * 2} height={size - pad * 2} preserveAspectRatio="xMidYMid slice" />
        </g>
      </motion.svg>

      {/* Separate hit area: neighbour discs are DOM children of the frame but sit outside it. */}
      <div
        className="hover-zone"
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return
          moveTo(e)
          jumpers.current.forEach((jump) => jump())
          hovering.current = true
          lastSpawn.current = { x: pointerX.get(), y: pointerY.get() }
          // A drop landing: small splash ring, blob springs in with a little overshoot.
          burst(pointerX.get(), pointerY.get(), 6, dropletFill.get(), [90, 220], [0.012, 0.026])
          animate(hoverRadius, size * SPOT, { type: 'spring', stiffness: 160, damping: 11 })
        }}
        onPointerMove={(e) => {
          if (e.pointerType === 'mouse') moveTo(e)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== 'mouse') return
          moveTo(e)
          hovering.current = false
          animate(hoverRadius, 0, { duration: 0.8, ease: EASE_IN_OUT })
        }}
      />
    </>
  )
}
