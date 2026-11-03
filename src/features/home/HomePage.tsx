import { motion } from 'motion/react'
import { ContactSection } from '../contact/ContactSection'
import { GlobeSection } from './GlobeSection'
import { HeroVideoReveal } from './HeroVideoReveal'
import { Parallax } from '../../shared/components/Parallax'
import { formatEventDate, nextEvent } from '../events/events'
import { pageHref } from '../../shared/hooks/usePage'
import { EASE_OUT, rise } from '../../shared/motion'


// Each frame corner slides in from its own diagonal.
const corners = [
  { className: 'fc fc-tl', from: { x: -14, y: -14 } },
  { className: 'fc fc-tr', from: { x: 14, y: -14 } },
  { className: 'fc fc-bl', from: { x: -14, y: 14 } },
  { className: 'fc fc-br', from: { x: 14, y: 14 } },
]

export function HomePage() {
  const next = nextEvent()

  return (
    <>
      {/* First screen: logo hero + intro + next-up card, exactly one viewport tall. */}
      <section className="home-hero">
        <main className="flex-grow-1 d-flex align-items-center justify-content-center">
          {/* Fills only the logo area, so the bottom row is never covered. */}
          <HeroVideoReveal />
          <div className="hero-frame">
            {corners.map((c) => (
              <motion.span
                key={c.className}
                className={c.className}
                initial={{ opacity: 0, ...c.from }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT }}
              />
            ))}
            <motion.img
              src="/media/logo.svg"
              alt="Expart"
              className="hero-logo"
              draggable={false}
              initial={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.1, delay: 0.3, ease: EASE_OUT }}
            />
          </div>
        </main>

        <footer className="row g-0 align-items-end gy-4">
          <motion.div className="col-12 col-md-6" {...rise(0.6)}>
            <Parallax>
              <div className="sq-label mb-4">Dig deeper</div>
              <p className="intro mb-0">
                Expart is an independent art lovers team and event curator, bringing unconventional sounds to unique
                places around the world.
              </p>
            </Parallax>
          </motion.div>

          {/* Next-up card stays static: no entrance or scroll animation. */}
          <div className="col-12 col-md-6 d-flex justify-content-md-end">
            <a href={pageHref.events} className="next-up">
              <img src={next.image} alt="" className="next-up-thumb" width={180} height={128} />
              <div className="next-up-info">
                <div className="sq-label next-up-label">Next up</div>
                <div className="next-up-name">Expart {next.city}</div>
                <div className="next-up-date">{formatEventDate(next.date)}</div>
              </div>
            </a>
          </div>
        </footer>
      </section>

      <GlobeSection />
      <ContactSection />
    </>
  )
}
