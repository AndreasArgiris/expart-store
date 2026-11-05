import { useEffect } from 'react'
import Lenis from 'lenis'

// One instance for the whole site. Lenis smooths the mouse wheel only: touch keeps native scrolling, and
// visitors who prefer reduced motion are respected. Overlays that scroll on their own need `data-lenis-prevent`.
let lenis: Lenis | null = null

/** Starts smooth scrolling for as long as the app is mounted. */
export function useSmoothScroll() {
  useEffect(() => {
    const instance = new Lenis({ autoRaf: true })
    lenis = instance
    return () => {
      instance.destroy()
      lenis = null
    }
  }, [])
}

/** Stops the page scrolling behind an overlay. */
export const pauseScroll = () => lenis?.stop()

export const resumeScroll = () => lenis?.start()

/** Jumps to the top instantly, cancelling any glide still in progress. */
export function jumpToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}
