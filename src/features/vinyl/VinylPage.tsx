import { AnimatePresence, motion } from 'motion/react'
import { releases } from './releases'
import { ReleaseStage } from './ReleaseStage'
import { useVinylPlayer } from './useVinylPlayer'

const PAGER_SLIDE = 12 // px the page number slides as it changes
const PAGER_DURATION = 0.3 // s

/** Vinyl: a turntable carousel of releases with previews, an intro, and a pager. */
export function VinylPage() {
  const player = useVinylPlayer()
  const { audioRef } = player

  return (
    <>
      <main className="flex-grow-1 d-flex align-items-center justify-content-center">
        <ReleaseStage player={player} />
      </main>

      <footer className="row g-0 align-items-end gy-4">
        <div className="col-12 col-md-4">
          <div className="sq-label mb-4">Vinyl</div>
          <p className="intro mb-0">
            Independent vinyl, hand-picked. Every record on our shelves is chosen for the way it sounds, not the way it
            sells.
          </p>
        </div>

        <div className="col-12 col-md-4 d-flex justify-content-center align-items-center gap-4 pager">
          <button type="button" className="text-link" onClick={() => player.step(-1)}>
            ‹ Prev
          </button>
          <span className="d-inline-flex gap-2" aria-live="polite">
            <span className="pager-num">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={player.index}
                  className="d-inline-block"
                  initial={{ y: PAGER_SLIDE, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -PAGER_SLIDE, opacity: 0 }}
                  transition={{ duration: PAGER_DURATION }}
                >
                  {player.index + 1}
                </motion.span>
              </AnimatePresence>
            </span>
            / {releases.length}
          </span>
          <button type="button" className="text-link" onClick={() => player.step(1)}>
            Next ›
          </button>
        </div>
      </footer>

      <audio ref={audioRef} src={player.current.preview} preload="none" onEnded={player.handleEnded} />
    </>
  )
}
