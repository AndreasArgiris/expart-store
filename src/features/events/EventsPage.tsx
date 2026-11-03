import { useCallback, useEffect, useRef, useState, type WheelEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { events, formatEventDate, mapsUrl } from './events'
import { Flag } from '../../shared/components/Flag'
import { useViewport } from '../../shared/hooks/useViewport'

const count = events.length
const wrap = (i: number) => ((i % count) + count) % count
// Poster aspect ratio (event images are 1492×1054).
const RATIO = 1492 / 1054
const PAD = 10
const GAP = 24
// Extra room below the frame for the details block, so the next poster doesn't sit on it.
const META_SPACE = 96
const WHEEL_LOCK_MS = 900
const ease = [0.65, 0, 0.35, 1] as const
const fade = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.3 },
}

/** Shortest signed distance from `active` to `i` on a ring of `n` items. */
function ringOffset(i: number, active: number, n: number) {
  let d = i - active
  if (d > n / 2) d -= n
  if (d < -n / 2) d += n
  return d
}

function useStageMetrics() {
  const { width, height } = useViewport()
  const mobile = width < 992
  const imgW = mobile ? Math.min(width - 70, 560) : Math.max(320, Math.min(560, width * 0.3, height * 0.46 * RATIO))
  const imgH = imgW / RATIO
  return { mobile, imgW, imgH, frameW: imgW + PAD * 2, frameH: imgH + PAD * 2 }
}

export function EventsPage() {
  const [index, setIndex] = useState(0)
  const { mobile, imgW, imgH, frameW, frameH } = useStageMetrics()
  const wheelLock = useRef(0)
  const current = events[index]

  const step = useCallback((delta: number) => setIndex((i) => wrap(i + delta)), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) < 30 || e.timeStamp - wheelLock.current < WHEEL_LOCK_MS) return
    wheelLock.current = e.timeStamp
    step(e.deltaY > 0 ? 1 : -1)
  }

  return (
    <main className="flex-grow-1 d-flex align-items-center" onWheel={onWheel}>
      <div className="row g-0 align-items-center w-100 gy-5">
        {/* Event list */}
        <div className="col-12 col-lg-3 order-2 order-lg-1 events-side">
          <div className="sq-label mb-4">Upcoming events</div>
          <ol className="list-unstyled mb-0">
            {events.map((e, i) => (
              <li key={e.id}>
                <button
                  type="button"
                  className={`event-row${i === index ? ' active' : ''}`}
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? 'true' : undefined}
                >
                  <span>[{i + 1}]</span>
                  <Flag code={e.countryCode} />
                  <span className="text-truncate">Expart {e.city}</span>
                  <span className="ms-auto ps-3 d-lg-none">{formatEventDate(e.date)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* Poster stage */}
        <div className="col-12 col-lg-6 order-1 order-lg-2 d-flex justify-content-center">
          <div style={{ width: frameW }}>
            <div className="event-frame" style={{ height: frameH }}>
              <span className="fc fc-tl" />
              <span className="fc fc-tr" />
              <span className="fc fc-bl" />
              <span className="fc fc-br" />

              <div className="event-track">
                {events.map((e, i) => {
                  const d = ringOffset(i, index, count)
                  const dist = Math.abs(d)
                  const active = d === 0
                  return (
                    <motion.button
                      key={e.id}
                      type="button"
                      className="event-poster"
                      style={{ width: imgW, height: imgH, marginLeft: -imgW / 2, marginTop: -imgH / 2, zIndex: 5 - dist, cursor: active ? 'default' : 'pointer' }}
                      initial={false}
                      animate={{
                        y: d * (imgH + PAD + GAP) + (d > 0 ? META_SPACE : 0),
                        // Neighbours peek in above/below on desktop; on mobile they'd cover the list.
                        opacity: active ? 1 : dist === 1 && !mobile ? 0.28 : 0,
                        scale: active ? 1 : 0.97,
                      }}
                      whileHover={active ? undefined : { opacity: 0.5 }}
                      transition={{ duration: 0.8, ease }}
                      onClick={() => !active && setIndex(i)}
                      tabIndex={active || dist > 1 ? -1 : 0}
                      aria-hidden={active || dist > 1}
                      aria-label={`Show Expart ${e.city}`}
                    >
                      <img src={e.image} alt="" draggable={false} />
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={current.id} className="meta" {...fade}>
                <span>[{String(index + 1).padStart(2, '0')}]</span>
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
        </div>

        {/* Dates */}
        <div className="col-lg-3 order-3 d-none d-lg-block events-side text-end">
          <div className="sq-label mb-4">Date</div>
          <ol className="list-unstyled mb-0">
            {events.map((e, i) => (
              <li key={e.id}>
                <button
                  type="button"
                  className={`event-row justify-content-end${i === index ? ' active' : ''}`}
                  onClick={() => setIndex(i)}
                  tabIndex={-1}
                >
                  {formatEventDate(e.date)}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  )
}
