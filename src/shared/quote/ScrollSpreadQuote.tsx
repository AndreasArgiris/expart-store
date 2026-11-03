import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useRemeasure } from '../hooks/useRemeasure'
import { measureSpread, type SpreadLayout } from './quoteLayout'
import { QuoteWord } from './QuoteWord'
import { useWordPulses } from './useWordPulses'

// Spread is fully open once it reaches this progress; only then do the red scrambles run.
const OPEN_AT = 0.92
const SPREAD_SPRING = { stiffness: 110, damping: 24, mass: 0.6 }

interface SpreadWordProps {
  word: string
  pulse: number
  offset: number
  progress: MotionValue<number>
}

/** A quote word that slides right by `offset` × `progress` as the quote spreads open. */
function SpreadWord({ word, pulse, offset, progress }: SpreadWordProps) {
  const offsetValue = useMotionValue(offset)
  useEffect(() => {
    offsetValue.set(offset)
  }, [offset, offsetValue])
  const x = useTransform(() => progress.get() * offsetValue.get())
  return <QuoteWord word={word} pulse={pulse} x={x} />
}

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>['offset']

interface ScrollSpreadQuoteProps {
  text: string
  as?: 'h1' | 'h2'
  className?: string
  /** Where the spread starts and finishes opening, as useScroll offsets. */
  offset?: ScrollOffset
}

/**
 * Reads as normal left-aligned text. Scrolling it up the screen glides the words apart into a fully
 * justified block; once open, the spaced words take turns scrambling in red. Scrolling back closes it.
 */
export function ScrollSpreadQuote({ text, as: Tag = 'h2', className, offset = ['start 90%', 'start 35%'] }: ScrollSpreadQuoteProps) {
  const words = text.split(' ')
  const ref = useRef<HTMLHeadingElement>(null)
  const [layout, setLayout] = useState<SpreadLayout>(() => ({ offsets: words.map(() => 0), spaced: [] }))
  const [isOpen, setIsOpen] = useState(false)

  const { scrollYProgress } = useScroll({ target: ref, offset })
  const progress = useSpring(scrollYProgress, SPREAD_SPRING)
  useMotionValueEvent(progress, 'change', (v) => setIsOpen(v >= OPEN_AT))

  const handleMeasure = useCallback((el: HTMLElement) => setLayout(measureSpread(el)), [])
  useRemeasure(ref, handleMeasure)
  const pulses = useWordPulses(words.length, layout.spaced, isOpen)

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        // Words can repeat and the text never reorders, so position is the identity.
        <Fragment key={i}>
          <SpreadWord word={word} pulse={pulses[i]} offset={layout.offsets[i] ?? 0} progress={progress} />
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  )
}
