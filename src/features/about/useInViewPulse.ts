import { useState, type RefObject } from 'react'
import { useInView } from 'motion/react'

const MOSTLY_VISIBLE = 0.8

/** A counter that goes up each time the element (mostly) scrolls into view: feed it to `QuoteWord` to replay. */
export function useInViewPulse(ref: RefObject<HTMLElement | null>) {
  const isInView = useInView(ref, { amount: MOSTLY_VISIBLE })
  // State-during-render: bump on each entry into view, no effect needed.
  const [seen, setSeen] = useState({ isInView, pulse: 0 })
  if (seen.isInView !== isInView) setSeen({ isInView, pulse: isInView ? seen.pulse + 1 : seen.pulse })
  return seen.pulse
}
