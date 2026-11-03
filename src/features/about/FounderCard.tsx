import { useRef } from 'react'
import { motion } from 'motion/react'
import { formatIndex } from '../../shared/carousel'
import { Flag } from '../../shared/components/Flag'
import { Parallax } from '../../shared/components/Parallax'
import { revealOnScroll } from '../../shared/motion'
import { QuoteWord } from '../../shared/quote/QuoteWord'
import type { Founder } from './founders'
import { useInViewPulse } from './useInViewPulse'

const CARD_DELAY = 0.25 // s, after the section title and photo
const CARD_STAGGER = 0.1 // s between founders
const CARD_DRIFT = 40 // px parallax

/** Founder name that runs the red digit scramble every time it scrolls into view. */
function ScrambleName({ name }: { name: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const pulse = useInViewPulse(ref)

  return (
    <h3 ref={ref} className="founder-name" aria-label={name}>
      {name.split(' ').map((word, i) => (
        <span key={word}>
          {i > 0 && ' '}
          <QuoteWord word={word} pulse={pulse} />
        </span>
      ))}
    </h3>
  )
}

/** One founder: position in the photo, scrambling name, role/age/hometown, and a short bio. */
export function FounderCard({ founder, index }: { founder: Founder; index: number }) {
  return (
    <motion.div className="founder" {...revealOnScroll(CARD_DELAY + index * CARD_STAGGER)}>
      <Parallax distance={CARD_DRIFT}>
        <div className="founder-index">
          [{formatIndex(index)}] {founder.position}
        </div>
        <ScrambleName name={founder.name} />
        <dl className="founder-facts">
          <div>
            <dt>Role</dt>
            <dd>{founder.role}</dd>
          </div>
          <div>
            <dt>Age</dt>
            <dd>{founder.age}</dd>
          </div>
          <div>
            <dt>From</dt>
            <dd className="founder-from">
              <Flag code={founder.flag} className="founder-flag" />
              <span className="visually-hidden">{founder.country}</span>
              {founder.city}
            </dd>
          </div>
        </dl>
        <p className="founder-bio mb-0">{founder.bio}</p>
      </Parallax>
    </motion.div>
  )
}
