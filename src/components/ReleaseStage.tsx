import { AnimatePresence, motion } from 'framer-motion'
import { formatDate, type Release } from '../data/releases'
import { useViewport } from '../hooks/useViewport'
import { CoverLiquid } from './CoverLiquid'
import { PlayerControls } from './PlayerControls'
import { Vinyl } from './Vinyl'

interface ReleaseStageProps {
  releases: Release[]
  index: number
  playing: boolean
  showInfo: boolean
  onSelect: (index: number) => void
  onStep: (delta: number) => void
  onSkip: () => void
  onTogglePlay: () => void
  onToggleInfo: () => void
}

const ease = [0.65, 0, 0.35, 1] as const
const slide = { duration: 0.7, ease }
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
  const mobile = width < 768
  const disc = mobile ? Math.min(width * 0.66, 340) : Math.max(220, Math.min(385, width * 0.21, height * 0.42))
  const spacing = mobile ? width * 0.78 : Math.max(disc * 1.2, width * 0.24)
  return { disc, spacing, frame: Math.round(disc * 1.13) }
}

export function ReleaseStage(props: ReleaseStageProps) {
  const { releases, index, playing, showInfo } = props
  const { disc, spacing, frame } = useStageMetrics()
  const current = releases[index]
  const number = String(index + 1).padStart(2, '0')

  return (
    <motion.section
      className="stage"
      aria-roledescription="carousel"
      aria-label="Releases"
      onPanEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 60) props.onStep(info.offset.x < 0 ? 1 : -1)
      }}
    >
      <div style={{ width: frame }}>
        <div className="d-flex justify-content-between align-items-end">
          <div className="frame-tab">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={current.id} className="sq-label" {...fade}>
                {current.title} {current.format}
              </motion.span>
            </AnimatePresence>
          </div>
          <PlayerControls
            playing={playing}
            onPrev={() => props.onStep(-1)}
            onTogglePlay={props.onTogglePlay}
            onNext={props.onSkip}
          />
        </div>

        <div className="frame-box" style={{ height: frame }}>
          <span className="fc fc-tl" />
          <span className="fc fc-tr" />
          <span className="fc fc-bl" />
          <span className="fc fc-br" />

          <div className="track">
            {releases.map((r, i) => {
              const d = ringOffset(i, index, releases.length)
              const dist = Math.abs(d)
              const active = d === 0
              return (
                <motion.button
                  key={r.id}
                  type="button"
                  className="disc"
                  style={{ width: disc, height: disc, marginLeft: -disc / 2, marginTop: -disc / 2, zIndex: 10 - dist }}
                  initial={false}
                  animate={{
                    x: d * spacing,
                    scale: active ? 1 : dist === 1 ? 0.96 : 0.86,
                    opacity: active ? 1 : dist <= 2 ? 0.22 : 0,
                    filter: active ? 'grayscale(0)' : 'grayscale(0.7)',
                  }}
                  whileHover={active ? undefined : { opacity: 0.45 }}
                  transition={slide}
                  onClick={() => !active && props.onSelect(i)}
                  tabIndex={active || dist > 1 ? -1 : 0}
                  aria-hidden={dist > 1}
                  aria-label={active ? `${r.artist} – ${r.title}` : `Show ${r.artist} – ${r.title}`}
                >
                  <Vinyl src={r.vinyl} alt="" size={disc} spinning={active && playing} />
                </motion.button>
              )
            })}
          </div>

          <CoverLiquid
            src={current.cover}
            alt={`${current.title} cover art`}
            size={frame - 2}
            showInfo={showInfo}
          />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={current.id} className="meta" {...fade}>
            <span>[{number}]</span>
            <div>
              <div className="fw-bold">{current.artist}</div>
              <div>{formatDate(current.released)}</div>
              {/* Always rendered so toggling info doesn't change the stage height. */}
              <motion.div
                className="text-secondary text-truncate"
                initial={false}
                animate={{ opacity: showInfo ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                aria-hidden={!showInfo}
              >
                {current.format} / {current.genre}
              </motion.div>
            </div>
            <div className="d-flex flex-column align-items-end">
              <button type="button" className="text-link" onClick={props.onToggleInfo} aria-expanded={showInfo}>
                {showInfo ? 'Hide cover' : 'Reveal cover'} ↳
              </button>
              <button type="button" className="text-link" onClick={props.onTogglePlay}>
                {playing ? 'Pause' : 'Listen'} ↳
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
