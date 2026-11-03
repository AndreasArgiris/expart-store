import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import { CornerMarks } from '../../shared/components/CornerMarks'
import { swapFade } from '../../shared/motion'
import { CoverLiquid } from './coverLiquid/CoverLiquid'
import { DiscTrack } from './DiscTrack'
import { PlayerControls } from './PlayerControls'
import { ReleaseMeta } from './ReleaseMeta'
import { useDiscMetrics } from './useDiscMetrics'
import type { VinylPlayer } from './useVinylPlayer'

const SWIPE_MIN = 60 // px of horizontal drag that counts as a swipe
const FRAME_BORDER = 2 // px; the cover sits just inside the frame's border

/** The turntable: title tab and controls, the framed disc carousel with its liquid cover, and the details. */
export function ReleaseStage({ player }: { player: VinylPlayer }) {
  const { disc, spacing, frame } = useDiscMetrics()
  const { index, current, isPlaying, isCoverShown, step } = player

  const handlePanEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_MIN) step(info.offset.x < 0 ? 1 : -1)
  }

  return (
    <motion.section className="stage" aria-roledescription="carousel" aria-label="Releases" onPanEnd={handlePanEnd}>
      <div style={{ width: frame }}>
        <div className="d-flex justify-content-between align-items-end">
          <div className="frame-tab">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={current.id} className="sq-label" {...swapFade}>
                {current.title} {current.format}
              </motion.span>
            </AnimatePresence>
          </div>
          <PlayerControls
            isPlaying={isPlaying}
            onPrev={() => step(-1)}
            onTogglePlay={player.togglePlay}
            onNext={() => step(1)}
          />
        </div>

        <div className="frame-box" style={{ height: frame }}>
          <CornerMarks />
          <DiscTrack index={index} isPlaying={isPlaying} disc={disc} spacing={spacing} onSelect={player.select} />
          <CoverLiquid
            src={current.cover}
            alt={`${current.title} cover art`}
            size={frame - FRAME_BORDER}
            isRevealed={isCoverShown}
          />
        </div>

        <ReleaseMeta player={player} />
      </div>
    </motion.section>
  )
}
