import { Fragment, useCallback, useRef, useState } from 'react'
import { useRemeasure } from '../hooks/useRemeasure'
import { findSpacedWords } from './quoteLayout'
import { QuoteWord } from './QuoteWord'
import { useWordPulses } from './useWordPulses'

interface SpacedQuoteProps {
  text: string
  as?: 'h1' | 'h2'
  className?: string
}

/**
 * Big justified quote. Words sitting next to the wide gaps that justification opens up take
 * turns auto-scrambling through digits in red — no hover needed.
 */
export function SpacedQuote({ text, as: Tag = 'h1', className = 'about-quote' }: SpacedQuoteProps) {
  const words = text.split(' ')
  const ref = useRef<HTMLHeadingElement>(null)
  const [spaced, setSpaced] = useState<number[]>([])

  const handleMeasure = useCallback(
    (el: HTMLElement) => {
      const found = findSpacedWords(el)
      // If no line happens to justify wide at this width, let every word take part.
      setSpaced(found.length ? found : text.split(' ').map((_, i) => i))
    },
    [text],
  )
  useRemeasure(ref, handleMeasure)
  const pulses = useWordPulses(words.length, spaced)

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        // Words can repeat and the text never reorders, so position is the identity.
        <Fragment key={i}>
          <QuoteWord word={word} pulse={pulses[i]} />
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  )
}
