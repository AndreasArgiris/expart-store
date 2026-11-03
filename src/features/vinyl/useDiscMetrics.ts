import { useViewport } from '../../shared/hooks/useViewport'
import { BREAKPOINT_MD } from '../../shared/theme'

// Mobile: one big disc, neighbours mostly off-screen.
const MOBILE_DISC_SHARE = 0.66 // of the viewport width
const MOBILE_MAX_DISC = 340
const MOBILE_SPACING_SHARE = 0.78 // of the viewport width
// Desktop: sized to fit both the width and the height of the screen.
const MIN_DISC = 220
const MAX_DISC = 385
const DESKTOP_WIDTH_SHARE = 0.21
const DESKTOP_HEIGHT_SHARE = 0.42
const MIN_SPACING = 1.2 // × disc size
const DESKTOP_SPACING_SHARE = 0.24 // of the viewport width
const FRAME = 1.13 // frame size × disc size

/** Disc size, the distance between neighbouring discs, and the frame around the active one. */
export function useDiscMetrics() {
  const { width, height } = useViewport()
  const isMobile = width < BREAKPOINT_MD
  const disc = isMobile
    ? Math.min(width * MOBILE_DISC_SHARE, MOBILE_MAX_DISC)
    : Math.max(MIN_DISC, Math.min(MAX_DISC, width * DESKTOP_WIDTH_SHARE, height * DESKTOP_HEIGHT_SHARE))
  const spacing = isMobile ? width * MOBILE_SPACING_SHARE : Math.max(disc * MIN_SPACING, width * DESKTOP_SPACING_SHARE)
  return { disc, spacing, frame: Math.round(disc * FRAME) }
}
