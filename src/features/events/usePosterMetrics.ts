import { useViewport } from '../../shared/hooks/useViewport'
import { BREAKPOINT_LG } from '../../shared/theme'

// Poster aspect ratio (event images are 1492×1054).
const RATIO = 1492 / 1054
const PAD = 10 // px of frame around the poster
const MOBILE_GUTTER = 70 // px of screen width left around the poster on mobile
const MAX_WIDTH = 560
const MIN_DESKTOP_WIDTH = 320
const DESKTOP_WIDTH_SHARE = 0.3 // of the viewport width
const DESKTOP_HEIGHT_SHARE = 0.46 // of the viewport height

/** Poster and frame sizes for the current viewport. */
export function usePosterMetrics() {
  const { width, height } = useViewport()
  const isMobile = width < BREAKPOINT_LG
  const imgW = isMobile
    ? Math.min(width - MOBILE_GUTTER, MAX_WIDTH)
    : Math.max(
        MIN_DESKTOP_WIDTH,
        Math.min(MAX_WIDTH, width * DESKTOP_WIDTH_SHARE, height * DESKTOP_HEIGHT_SHARE * RATIO),
      )
  const imgH = imgW / RATIO
  return { isMobile, imgW, imgH, pad: PAD, frameW: imgW + PAD * 2, frameH: imgH + PAD * 2 }
}

export type PosterMetrics = ReturnType<typeof usePosterMetrics>
