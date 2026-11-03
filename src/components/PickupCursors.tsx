import { useEffect } from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion'

// Redrawn from public/media/pickup=cursors.svg (viewBox 0 0 426 315.786): five fader tracks, each
// with a cap. The caps are split out so they can slide along continuous tracks.
const VB_W = 426
const VB_H = 315.786
const CAP_H = 90

interface Fader {
  /** Track's left edge and width. */
  trackX: number
  trackW: number
  /** Cap's left edge, width, and top in the original drawing. */
  capX: number
  capW: number
  top: number
  /** Cap tops (absolute, viewBox units) the cap travels through, looping. */
  stops: number[]
  duration: number
}

const FADERS: Fader[] = [
  { trackX: 24, trackW: 9, capX: 0, capW: 57, top: 193.986, stops: [193.986, 60, 150, 193.986], duration: 5.2 },
  { trackX: 117, trackW: 8, capX: 93, capW: 56, top: 111.986, stops: [111.986, 200, 30, 111.986], duration: 4.6 },
  { trackX: 209, trackW: 8, capX: 185, capW: 56, top: 29.986, stops: [29.986, 170, 90, 29.986], duration: 5.6 },
  { trackX: 301, trackW: 8.5, capX: 277, capW: 56, top: 111.986, stops: [111.986, 20, 190, 111.986], duration: 4.9 },
  { trackX: 393, trackW: 9, capX: 369, capW: 57, top: 193.986, stops: [193.986, 110, 40, 193.986], duration: 5.4 },
]

/**
 * Fader cap: thin top rule, grip body with three grooves, thin bottom rule.
 * Drawn at (0,0) with the original proportions; positioned by its parent group.
 */
function Cap({ w }: { w: number }) {
  const grooves = [24, 44.5, 66]
  return (
    <>
      {/* Hides the track behind the cap, and shows through the grooves and gaps. */}
      <rect width={w} height={CAP_H} fill="#fff" />
      <rect width={w} height={4} />
      <path
        fillRule="evenodd"
        d={`M0 6 H${w} V85 H0 Z ${grooves.map((y) => `M4 ${y} H${w - 4} V${y + 2.5} H4 Z`).join(' ')}`}
      />
      <rect y={87} width={w} height={3} />
    </>
  )
}

function FaderTrack({ fader: f, index }: { fader: Fader; index: number }) {
  const reduced = useReducedMotion()
  const y = useMotionValue(f.top)

  useEffect(() => {
    if (reduced) return
    const controls = animate(y, f.stops, {
      duration: f.duration,
      ease: 'easeInOut',
      repeat: Infinity,
      delay: index * 0.18,
    })
    return () => controls.stop()
  }, [reduced, y, f, index])

  return (
    <g>
      <rect x={f.trackX} y={0.5} width={f.trackW} height={VB_H - 1} rx={f.trackW / 2} fill="var(--ink)" />
      <motion.g fill="var(--accent)" style={{ y }}>
        <g transform={`translate(${f.capX} 0)`}>
          <Cap w={f.capW} />
        </g>
      </motion.g>
    </g>
  )
}

/** The pickup faders graphic, with red caps gliding up and down their tracks. */
export function PickupCursors({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label="Mixer faders">
      {FADERS.map((f, i) => (
        <FaderTrack key={i} fader={f} index={i} />
      ))}
    </svg>
  )
}
