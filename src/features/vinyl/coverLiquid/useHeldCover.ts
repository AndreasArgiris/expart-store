import { useEffect, useState } from 'react'
import { animate, useMotionValue, type MotionValue } from 'motion/react'
import { EASE_IN_OUT } from '../../../shared/motion'

// Seconds a revealed cover takes to clear when switching release (the discs slide for 0.7s).
const SWITCH_FADE = 0.25

/**
 * Changing release while a cover is out: keeps drawing the outgoing art while it fades away (`switchFade`),
 * so the next release's art never flashes in and the old cover never lingers over the next vinyl. Once
 * faded, it resets the liquid to fully hidden via `pour`, `coverAlpha` and `clearMask` (which must be stable).
 */
export function useHeldCover(
  src: string,
  isRevealed: boolean,
  pour: MotionValue<number>,
  coverAlpha: MotionValue<number>,
  clearMask: () => void,
) {
  const switchFade = useMotionValue(1)

  // State-during-render: notice the release change in the same render, no effect needed.
  const [prevSrc, setPrevSrc] = useState(src)
  const [heldSrc, setHeldSrc] = useState<string | null>(null)
  if (src !== prevSrc) {
    setPrevSrc(src)
    if (!isRevealed && pour.get() > 0) setHeldSrc(heldSrc ?? prevSrc)
  }
  if (isRevealed && heldSrc) setHeldSrc(null)

  // jump() also stops the slow drain, so nothing is left to finish on the next release.
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
        clearMask()
        setHeldSrc(null)
      },
    })
    return () => {
      fade.stop()
      switchFade.jump(1)
    }
  }, [heldSrc, switchFade, pour, coverAlpha, clearMask])

  return { shownSrc: heldSrc ?? src, switchFade }
}
