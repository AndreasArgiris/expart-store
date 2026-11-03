import { useLayoutEffect, type RefObject } from 'react'

/**
 * Calls `onMeasure` with the element once laid out, again once web fonts finish loading (text widths change),
 * and whenever the element resizes. Calls are batched to one per animation frame. `onMeasure` should be stable.
 */
export function useRemeasure<T extends HTMLElement>(ref: RefObject<T | null>, onMeasure: (el: T) => void) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => onMeasure(el))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    document.fonts.ready.then(measure)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [ref, onMeasure])
}
