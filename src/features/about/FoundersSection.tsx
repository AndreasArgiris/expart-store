import { useRef, useState } from 'react'
import { motion, useInView, useScroll, useSpring, useTransform } from 'motion/react'
import { Flag, type FlagCode } from '../../shared/components/Flag'
import { Parallax } from '../../shared/components/Parallax'
import { QuoteWord } from '../../shared/components/SpacedQuote'

const ease = [0.22, 1, 0.36, 1] as const
const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, delay, ease },
})

interface Founder {
  name: string
  /** Where they stand in founders.webp. */
  position: string
  role: string
  age: number
  /** Hometown, if any; the country is shown as a flag. */
  city?: string
  country: string
  flag: FlagCode
  bio: string
}

const FOUNDERS: Founder[] = [
  {
    name: 'Andreas Duster',
    position: 'Left',
    role: 'Producer & composer',
    age: 34,
    city: 'Piraeus',
    country: 'Greece',
    flag: 'GR',
    bio: 'A producer and composer, always seeking new, talented artists to join the team.',
  },
  {
    name: 'John Chele',
    position: 'Right',
    role: 'Event organizer & merch promoter',
    age: 33,
    city: 'Newry',
    country: 'Northern Ireland',
    flag: 'IE',
    bio: "Organizes Expart's events and promotes its merch.",
  },
]

const TEAM_SIZE = 34

/** Founder name that runs the red digit scramble every time it scrolls into view. */
function ScrambleName({ name }: { name: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const inView = useInView(ref, { amount: 0.8 })
  // Bump the pulse on each entry into view (state-during-render pattern, no effect needed).
  const [seen, setSeen] = useState({ inView, pulse: 0 })
  if (seen.inView !== inView) setSeen({ inView, pulse: inView ? seen.pulse + 1 : seen.pulse })
  const { pulse } = seen

  return (
    <h3 ref={ref} className="founder-name" aria-label={name}>
      {name.split(' ').map((word, i) => (
        <span key={i}>
          {i > 0 && ' '}
          <QuoteWord word={word} pulse={pulse} />
        </span>
      ))}
    </h3>
  )
}

/** Team size that counts up from 0 as the block scrolls into view (and back down on the way out). */
function TeamCount() {
  const ref = useRef<HTMLSpanElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center 55%'] })
  const raw = useTransform(scrollYProgress, [0, 1], [0, TEAM_SIZE])
  const smooth = useSpring(raw, { stiffness: 90, damping: 24 })
  const count = useTransform(smooth, (v) => Math.round(v))

  return (
    <motion.span ref={ref} className="founders-count" aria-label={String(TEAM_SIZE)}>
      {count}
    </motion.span>
  )
}

function FounderCard({ founder, index }: { founder: Founder; index: number }) {
  return (
    <motion.div className="founder" {...reveal(0.25 + index * 0.1)}>
      <Parallax distance={40}>
        <div className="founder-index">
          [{String(index + 1).padStart(2, '0')}] {founder.position}
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

export function FoundersSection() {
  return (
    <section className="founders" aria-labelledby="founders-title">
      <motion.div {...reveal(0)}>
        <Parallax distance={30}>
          <div id="founders-title" className="sq-label">
            Founders
          </div>
        </Parallax>
      </motion.div>

      <div className="row g-0 align-items-center founders-grid">
        <motion.div className="col-12 col-lg-5 founders-photo" {...reveal(0.1)}>
          <Parallax distance={20}>
            <div className="founders-frame">
              <span className="fc fc-tl" />
              <span className="fc fc-br" />
              <img
                src="/media/founders.webp"
                alt={`${FOUNDERS[0].name} (left) and ${FOUNDERS[1].name} (right)`}
                width={1254}
                height={1254}
                draggable={false}
              />
            </div>
          </Parallax>
        </motion.div>

        <div className="col-12 col-lg-7 founders-info">
          <motion.div className="founders-team" {...reveal(0.15)}>
            <Parallax distance={30}>
              <p className="mb-0">
                <TeamCount />
                <span>
                  Team members:
                  <br />
                  artists, manufacturers and more.
                </span>
              </p>
            </Parallax>
          </motion.div>

          <div className="row g-0 founders-people">
            {FOUNDERS.map((f, i) => (
              <div key={f.name} className="col-12 col-md-6">
                <FounderCard founder={f} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
