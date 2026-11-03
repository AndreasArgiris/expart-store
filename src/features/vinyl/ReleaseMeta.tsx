import { AnimatePresence, motion } from 'motion/react'
import { formatIndex } from '../../shared/carousel'
import { swapFade } from '../../shared/motion'
import { formatDate } from './releases'
import type { VinylPlayer } from './useVinylPlayer'

const INFO_FADE = { duration: 0.3 }

/** Under the frame: number, artist, release date, the format/genre line (shown with the cover), and actions. */
export function ReleaseMeta({ player }: { player: VinylPlayer }) {
  const { index, current, isPlaying, isCoverShown } = player

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={current.id} className="meta" {...swapFade}>
        <span>[{formatIndex(index)}]</span>
        <div>
          <div className="fw-bold">{current.artist}</div>
          <div>{formatDate(current.released)}</div>
          {/* Always rendered so toggling info doesn't change the stage height. */}
          <motion.div
            className="text-secondary text-truncate"
            initial={false}
            animate={{ opacity: isCoverShown ? 1 : 0 }}
            transition={INFO_FADE}
            aria-hidden={!isCoverShown}
          >
            {current.format} / {current.genre}
          </motion.div>
        </div>
        <div className="d-flex flex-column align-items-end">
          <button type="button" className="text-link" onClick={player.toggleCover} aria-expanded={isCoverShown}>
            {isCoverShown ? 'Hide cover' : 'Reveal cover'} ↳
          </button>
          <button type="button" className="text-link" onClick={player.togglePlay}>
            {isPlaying ? 'Pause' : 'Listen'} ↳
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
