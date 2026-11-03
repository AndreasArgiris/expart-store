import { useCallback, useRef, useState, type WheelEvent } from 'react'
import { wrapIndex } from '../../shared/carousel'
import { useArrowKeys } from '../../shared/hooks/useArrowKeys'
import { events } from './events'

const WHEEL_MIN_DELTA = 30 // px; smaller scrolls (trackpad drift) are ignored
const WHEEL_LOCK_MS = 900 // one step per scroll gesture, however long the gesture runs

/** Which event poster is showing, stepped by click, the arrow keys (all four) or the mouse wheel. */
export function useEventCarousel() {
  const [index, setIndex] = useState(0)
  const wheelLock = useRef(0)

  const step = useCallback((delta: number) => setIndex((i) => wrapIndex(i + delta, events.length)), [])
  useArrowKeys(step, { vertical: true })

  const handleWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) < WHEEL_MIN_DELTA || e.timeStamp - wheelLock.current < WHEEL_LOCK_MS) return
    wheelLock.current = e.timeStamp
    step(e.deltaY > 0 ? 1 : -1)
  }

  return { index, setIndex, handleWheel }
}
