import { AnimatePresence, motion } from 'motion/react'
import { CornerMarks } from '../../shared/components/CornerMarks'
import { formatIndex, ringOffset } from '../../shared/carousel'
import { EASE_IN_OUT, swapFade } from '../../shared/motion'
import { events, mapsUrl } from './events'
import type { PosterMetrics } from './usePosterMetrics'

const GAP = 24 // px between stacked posters
// Extra room below the frame for the details block, so the next poster doesn't sit on it.
const META_SPACE = 96
const NEIGHBOUR_OPACITY = 0.28
const NEIGHBOUR_HOVER_OPACITY = 0.5
const NEIGHBOUR_SCALE = 0.97
const TOP_Z = 5
const SLIDE = { duration: 0.8, ease: EASE_IN_OUT }

interface EventStageProps {
  index: number
  metrics: PosterMetrics
  onSelect: (index: number) => void
}

/** The framed poster carousel (neighbours peek in above and below) with the current event's venue details. */
export function EventStage({ index, metrics, onSelect }: EventStageProps) {
  const { isMobile, imgW, imgH, pad, frameW, frameH } = metrics
  const current = events[index]

  return (
    <div style={{ width: frameW }}>
      <div className="event-frame" style={{ height: frameH }}>
        <CornerMarks />
        <div className="event-track">
          {events.map((e, i) => {
            const d = ringOffset(i, index, events.length)
            const dist = Math.abs(d)
            const isActive = d === 0
            return (
              <motion.button
                key={e.id}
                type="button"
                className="event-poster"
                style={{
                  width: imgW,
                  height: imgH,
                  marginLeft: -imgW / 2,
                  marginTop: -imgH / 2,
                  zIndex: TOP_Z - dist,
                  cursor: isActive ? 'default' : 'pointer',
                }}
                initial={false}
                animate={{
                  y: d * (imgH + pad + GAP) + (d > 0 ? META_SPACE : 0),
                  // Neighbours peek in above/below on desktop; on mobile they'd cover the list.
                  opacity: isActive ? 1 : dist === 1 && !isMobile ? NEIGHBOUR_OPACITY : 0,
                  scale: isActive ? 1 : NEIGHBOUR_SCALE,
                }}
                whileHover={isActive ? undefined : { opacity: NEIGHBOUR_HOVER_OPACITY }}
                transition={SLIDE}
                onClick={() => !isActive && onSelect(i)}
                tabIndex={isActive || dist > 1 ? -1 : 0}
                aria-hidden={isActive || dist > 1}
                aria-label={`Show Expart ${e.city}`}
              >
                <img src={e.image} alt="" draggable={false} />
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={current.id} className="meta" {...swapFade}>
          <span>[{formatIndex(index)}]</span>
          <div className="min-w-0">
            <div className="fw-bold text-truncate">{current.venue}</div>
            <div>{current.time}</div>
            <div className="text-secondary text-truncate">{current.address}</div>
          </div>
          <div className="d-flex flex-column align-items-end">
            <a className="text-link" href={mapsUrl(current)} target="_blank" rel="noreferrer">
              Directions ↳
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
