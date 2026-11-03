import { useEffect, useRef } from 'react'
import { motion, type MotionValue } from 'motion/react'
import { useScramble } from '../hooks/useScramble'

// A justified gap wider than this many ems counts as "spaced" (a normal space is ~0.28em).
export const GAP_EM = 0.5
// Each scramble lasts ~1.4s with slow digit rolls.
const SCRAMBLE_MS = 1400
const ROLL_MS = 110

interface QuoteWordProps {
  word: string
  /** Scrambles the word each time this changes (0 = never yet). */
  pulse: number
  /** Optional horizontal offset (used by the scroll-spread title). */
  x?: MotionValue<number>
}

/** One word of a quote that scrambles through red digits on each pulse, without reflowing its line. */
export function QuoteWord({ word, pulse, x }: QuoteWordProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const { text, running, scramble } = useScramble(word, SCRAMBLE_MS, ROLL_MS)

  // Lock the word's width while it scrambles, so the justified lines never reflow.
  useEffect(() => {
    const el = ref.current
    if (!pulse || !el) return
    el.style.width = `${el.getBoundingClientRect().width}px`
    scramble()
  }, [pulse, scramble])

  useEffect(() => {
    if (!running && ref.current) ref.current.style.width = ''
  }, [running])

  return (
    <motion.span
      ref={ref}
      className={`quote-word${running ? ' is-scrambling' : ''}`}
      style={x ? { x } : undefined}
      aria-hidden="true"
    >
      {text}
    </motion.span>
  )
}
