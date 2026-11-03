import { Fragment, useEffect, useRef, useState } from 'react'
import { motion, type MotionValue } from 'framer-motion'
import { useScramble } from '../hooks/useScramble'

// A justified gap wider than this many ems counts as "spaced" (a normal space is ~0.28em).
export const GAP_EM = 0.5
// Calm pacing: a new word every ~1.8s, each scramble lasting ~1.4s with slow digit rolls.
export const PULSE_MS = 1800
const SCRAMBLE_MS = 1400
const ROLL_MS = 110

interface QuoteWordProps {
  word: string
  pulse: number
  /** Optional horizontal offset (used by the scroll-spread title). */
  x?: MotionValue<number>
}

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

/** Indices of words that border an unusually wide justified gap on their line. */
function findSpacedWords(root: HTMLElement): number[] {
  const spans = Array.from(root.querySelectorAll<HTMLElement>('.quote-word'))
  const threshold = parseFloat(getComputedStyle(root).fontSize) * GAP_EM
  const rects = spans.map((s) => s.getBoundingClientRect())
  const spaced = new Set<number>()

  for (let i = 0; i < rects.length - 1; i++) {
    const sameLine = Math.abs(rects[i].top - rects[i + 1].top) < 2
    if (sameLine && rects[i + 1].left - rects[i].right > threshold) {
      spaced.add(i)
      spaced.add(i + 1)
    }
  }
  return [...spaced]
}

/**
 * Big justified quote. Words sitting next to the wide gaps that justification opens up take
 * turns auto-scrambling through digits in red — no hover needed.
 */
interface SpacedQuoteProps {
  text: string
  as?: 'h1' | 'h2'
  className?: string
}

export function SpacedQuote({ text, as: Tag = 'h1', className = 'about-quote' }: SpacedQuoteProps) {
  const words = text.split(' ')
  const ref = useRef<HTMLHeadingElement>(null)
  const [spaced, setSpaced] = useState<number[]>([])
  const [pulses, setPulses] = useState<number[]>(() => words.map(() => 0))

  // Re-measure after fonts load and whenever the layout width changes.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const found = findSpacedWords(el)
        // If no line happens to justify wide at this width, let every word take part.
        setSpaced(found.length ? found : text.split(' ').map((_, i) => i))
      })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    document.fonts.ready.then(measure)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [text])

  useEffect(() => {
    if (!spaced.length) return
    let last = -1
    const id = setInterval(() => {
      // Pick a different word each time so the red hops around the quote.
      let pick = spaced[Math.floor(Math.random() * spaced.length)]
      if (spaced.length > 1 && pick === last) pick = spaced[(spaced.indexOf(pick) + 1) % spaced.length]
      last = pick
      setPulses((p) => p.map((n, i) => (i === pick ? n + 1 : n)))
    }, PULSE_MS)
    return () => clearInterval(id)
  }, [spaced])

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <QuoteWord word={word} pulse={pulses[i]} />
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  )
}
