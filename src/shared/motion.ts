/** Shared animation curves and entrances, so every transition on the site moves with the same feel. */

/** Fast start, long soft landing: entrances, reveals and anything settling into place. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Symmetric: things travelling from one resting place to another (carousels, liquid drains). */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

const ENTRANCE_DURATION = 0.9 // s
const RISE_DISTANCE = 20 // px a block travels up as it fades in
const REVEAL_DISTANCE = 24 // px, a touch more for blocks revealed mid-scroll
const REVEAL_VISIBLE = 0.3 // share of a block that must be on screen before it reveals

const SWAP_DISTANCE = 6 // px
const SWAP_DURATION = 0.3 // s

/**
 * Spread onto a keyed `motion.*` element inside `<AnimatePresence mode="wait">`: the old content lifts out
 * and the new content rises in, for small text that swaps as a carousel moves.
 */
export const swapFade = {
  initial: { opacity: 0, y: SWAP_DISTANCE },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -SWAP_DISTANCE },
  transition: { duration: SWAP_DURATION },
}

/** Spread onto a `motion.*` element: fades and rises into place when the page loads. */
export const rise = (delay: number) => ({
  initial: { opacity: 0, y: RISE_DISTANCE },
  animate: { opacity: 1, y: 0 },
  transition: { duration: ENTRANCE_DURATION, delay, ease: EASE_OUT },
})

/** Spread onto a `motion.*` element: fades and rises into place the first time it scrolls into view. */
export const revealOnScroll = (delay: number) => ({
  initial: { opacity: 0, y: REVEAL_DISTANCE },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: REVEAL_VISIBLE },
  transition: { duration: ENTRANCE_DURATION, delay, ease: EASE_OUT },
})
