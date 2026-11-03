import { motion } from 'motion/react'
import { ConceptStrip } from './ConceptStrip'
import { ContactSection } from '../contact/ContactSection'
import { FoundersSection } from './FoundersSection'
import { Parallax } from '../../shared/components/Parallax'
import { SpacedQuote } from '../../shared/components/SpacedQuote'
import { rise } from '../../shared/motion'

const QUOTE = 'Digging deeper through vinyl, sound & human connection'

export function AboutPage() {
  return (
    <main className="about">
      <section className="row g-0 about-intro">
        <motion.div className="col-12 col-lg-6 about-side" {...rise(0.1)}>
          <Parallax>
            <div className="sq-label">About Expart</div>
          </Parallax>
          <motion.div {...rise(0.25)}>
            <Parallax distance={55}>
              <img src="/media/pickup-tonearm.svg" alt="" className="about-tonearm" draggable={false} />
            </Parallax>
          </motion.div>
        </motion.div>

        <div className="col-12 col-lg-6 about-main">
          <motion.div {...rise(0.2)}>
            <Parallax distance={45}>
              <SpacedQuote text={QUOTE} />
            </Parallax>
          </motion.div>
          <motion.div className="about-copy" {...rise(0.35)}>
            <Parallax distance={70}>
              <p className="mb-0">
                Expart is an independent art lovers team and event curator that brings unconventional sounds and
                pioneering artists to unexpected places. We don't sell background music. Every record on our
                shelves and every night we host is chosen to start a conversation, with your friends or with a
                stranger. Each event is backed by a carefully picked line-up, and that line-up stays a surprise
                until the doors open.
              </p>
            </Parallax>
          </motion.div>
        </div>
      </section>

      <motion.div {...rise(0.5)}>
        <ConceptStrip />
      </motion.div>

      <FoundersSection />
      <ContactSection />
    </main>
  )
}
