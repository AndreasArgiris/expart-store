import { Fragment, useEffect, useRef, useState } from 'react'
import {
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { GAP_EM, PULSE_MS, QuoteWord } from './SpacedQuote'

// Spread is fully open once it reaches this progress; only then do the red scrambles run.
const OPEN_AT = 0.92

interface Layout {
  /** Extra px each word moves right when fully spread (justified position − natural position). */
  offsets: number[]
  /** Words on lines whose gaps open wide enough to count as "spaced". */
  spaced: number[]
}

/**
 * Measures the natural (left-aligned) layout and works out, per word, how far it must move to
 * reach its justified position. Uses offsetLeft/offsetWidth, which ignore the transforms we apply.
 */
function measure(root: HTMLElement): Layout {
  const spans = Array.from(root.querySelectorAll<HTMLElement>('.quote-word'))
  const width = root.clientWidth
  const threshold = parseFloat(getComputedStyle(root).fontSize) * GAP_EM
  const offsets = spans.map(() => 0)
  const spaced: number[] = []

  const lines: number[][] = []
  spans.forEach((s, i) => {
    const line = lines[lines.length - 1]
    if (line && Math.abs(spans[line[0]].offsetTop - s.offsetTop) < 2) line.push(i)
    else lines.push([i])
  })

  // Every line but the last gets justified, like text-align: justify would.
  lines.slice(0, -1).forEach((line) => {
    if (line.length < 2) return
    const last = spans[line[line.length - 1]]
    const extra = width - (last.offsetLeft + last.offsetWidth)
    const perGap = extra / (line.length - 1)
    line.forEach((idx, k) => (offsets[idx] = k * perGap))
    if (perGap > threshold) spaced.push(...line)
  })

  return { offsets, spaced }
}

function SpreadWord({ word, pulse, offset, progress }: { word: string; pulse: number; offset: number; progress: MotionValue<number> }) {
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
export function ScrollSpreadQuote({
  text,
  as: Tag = 'h2',
  className,
  offset = ['start 90%', 'start 35%'],
}: ScrollSpreadQuoteProps) {
  const words = text.split(' ')
  const ref = useRef<HTMLHeadingElement>(null)
  const [layout, setLayout] = useState<Layout>(() => ({ offsets: words.map(() => 0), spaced: [] }))
  const [open, setOpen] = useState(false)
  const [pulses, setPulses] = useState<number[]>(() => words.map(() => 0))

  const { scrollYProgress } = useScroll({ target: ref, offset })
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 24, mass: 0.6 })
  useMotionValueEvent(progress, 'change', (v) => setOpen(v >= OPEN_AT))

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setLayout(measure(el)))
    }
    const observer = new ResizeObserver(update)
    observer.observe(el)
    document.fonts.ready.then(update)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [text])

  useEffect(() => {
    const { spaced } = layout
    if (!open || !spaced.length) return
    let last = -1
    const id = setInterval(() => {
      let pick = spaced[Math.floor(Math.random() * spaced.length)]
      if (spaced.length > 1 && pick === last) pick = spaced[(spaced.indexOf(pick) + 1) % spaced.length]
      last = pick
      setPulses((p) => p.map((n, i) => (i === pick ? n + 1 : n)))
    }, PULSE_MS)
    return () => clearInterval(id)
  }, [open, layout])

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <SpreadWord word={word} pulse={pulses[i]} offset={layout.offsets[i] ?? 0} progress={progress} />
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  )
}
