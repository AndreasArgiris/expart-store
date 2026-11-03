import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { Parallax } from '../../shared/components/Parallax'
import { revealOnScroll } from '../../shared/motion'
import { FounderCard } from './FounderCard'
import { FOUNDERS, FOUNDERS_PHOTO, TEAM_SIZE } from './founders'

const PHOTO_DRIFT = 20 // px parallax, less than the text so the photo feels further back
const COUNT_SPRING = { stiffness: 90, damping: 24 }

/** Team size that counts up from 0 as the block scrolls into view (and back down on the way out). */
function TeamCount() {
  const ref = useRef<HTMLSpanElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center 55%'] })
  const raw = useTransform(scrollYProgress, [0, 1], [0, TEAM_SIZE])
  const smooth = useSpring(raw, COUNT_SPRING)
  const count = useTransform(smooth, (v) => Math.round(v))

  return (
    <motion.span ref={ref} className="founders-count" aria-label={String(TEAM_SIZE)}>
      {count}
    </motion.span>
  )
}

/** About page: the founders' photo, the team count, and a card per founder. */
export function FoundersSection() {
  return (
    <section className="founders" aria-labelledby="founders-title">
      <motion.div {...revealOnScroll(0)}>
        <Parallax>
          <div id="founders-title" className="sq-label">
            Founders
          </div>
        </Parallax>
      </motion.div>

      <div className="row g-0 align-items-center founders-grid">
        <motion.div className="col-12 col-lg-5 founders-photo" {...revealOnScroll(0.1)}>
          <Parallax distance={PHOTO_DRIFT}>
            <div className="founders-frame">
              <span className="fc fc-tl" />
              <span className="fc fc-br" />
              <img
                {...FOUNDERS_PHOTO}
                alt={`${FOUNDERS[0].name} (left) and ${FOUNDERS[1].name} (right)`}
                draggable={false}
              />
            </div>
          </Parallax>
        </motion.div>

        <div className="col-12 col-lg-7 founders-info">
          <motion.div className="founders-team" {...revealOnScroll(0.15)}>
            <Parallax>
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
