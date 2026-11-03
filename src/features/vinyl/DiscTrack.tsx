import { motion } from 'motion/react'
import { ringOffset } from '../../shared/carousel'
import { EASE_IN_OUT } from '../../shared/motion'
import { releases } from './releases'
import { Vinyl } from './Vinyl'

const SLIDE = { duration: 0.7, ease: EASE_IN_OUT }
const NEAR_SCALE = 0.96 // direct neighbours
const FAR_SCALE = 0.86
const NEIGHBOUR_OPACITY = 0.22
const NEIGHBOUR_HOVER_OPACITY = 0.45
const NEIGHBOUR_GRAYSCALE = 'grayscale(0.7)'
const VISIBLE_RANGE = 2 // discs either side that stay faintly visible
const TOP_Z = 10

interface DiscTrackProps {
  index: number
  isPlaying: boolean
  disc: number
  spacing: number
  onSelect: (index: number) => void
}

/** The row of records: the active one in full colour (spinning while it plays), neighbours faded either side. */
export function DiscTrack({ index, isPlaying, disc, spacing, onSelect }: DiscTrackProps) {
  return (
    <div className="track">
      {releases.map((r, i) => {
        const d = ringOffset(i, index, releases.length)
        const dist = Math.abs(d)
        const isActive = d === 0
        return (
          <motion.button
            key={r.id}
            type="button"
            className="disc"
            style={{ width: disc, height: disc, marginLeft: -disc / 2, marginTop: -disc / 2, zIndex: TOP_Z - dist }}
            initial={false}
            animate={{
              x: d * spacing,
              scale: isActive ? 1 : dist === 1 ? NEAR_SCALE : FAR_SCALE,
              opacity: isActive ? 1 : dist <= VISIBLE_RANGE ? NEIGHBOUR_OPACITY : 0,
              filter: isActive ? 'grayscale(0)' : NEIGHBOUR_GRAYSCALE,
            }}
            whileHover={isActive ? undefined : { opacity: NEIGHBOUR_HOVER_OPACITY }}
            transition={SLIDE}
            onClick={() => !isActive && onSelect(i)}
            tabIndex={isActive || dist > 1 ? -1 : 0}
            aria-hidden={dist > 1}
            aria-label={isActive ? `${r.artist} – ${r.title}` : `Show ${r.artist} – ${r.title}`}
          >
            <Vinyl src={r.vinyl} alt="" size={disc} isSpinning={isActive && isPlaying} />
          </motion.button>
        )
      })}
    </div>
  )
}
