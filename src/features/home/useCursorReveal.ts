import { useEffect, useRef, useState, type RefObject } from 'react'
import { animate, useMotionValue } from 'motion/react'
import { EASE_OUT } from '../../shared/motion'

const GROW_IN = { type: 'spring', stiffness: 120, damping: 14 } as const // blob lands with a little overshoot
const FADE_OUT = 2 // s, liquid lingers and drains away after the cursor leaves

/**
 * Tracks the cursor over `area` and drives a liquid trail (see `Blob`): pointer position, a blob radius that
 * grows to `radius` on enter and drains to 0 on leave, and `jumpers` that snap the trail to the cursor.
 * `isVisible` stays true until the liquid has fully drained.
 */
export function useCursorReveal(area: RefObject<HTMLElement | null>, radius: number) {
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const blobRadius = useMotionValue(0)
  const jumpers = useRef(new Set<() => void>())
  const [isVisible, setIsVisible] = useState(false)

  // Window-level listener: the reveal layer sits under the page content, so it never receives pointer events itself.
  useEffect(() => {
    const el = area.current
    if (!el) return

    let isInside = false
    const handlePointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      const isNowInside = px >= 0 && py >= 0 && px <= rect.width && py <= rect.height

      if (isNowInside) {
        pointerX.set(px)
        pointerY.set(py)
        // Entering after the liquid has fully drained: start the trail at the cursor, not at the last exit.
        if (!isInside && blobRadius.get() === 0) jumpers.current.forEach((jump) => jump())
      }
      if (isNowInside === isInside) return
      isInside = isNowInside
      if (isNowInside) {
        setIsVisible(true)
        animate(blobRadius, radius, GROW_IN)
      } else {
        animate(blobRadius, 0, { duration: FADE_OUT, ease: EASE_OUT, onComplete: () => setIsVisible(false) })
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [area, radius, pointerX, pointerY, blobRadius])

  return { pointerX, pointerY, blobRadius, jumpers, isVisible }
}
