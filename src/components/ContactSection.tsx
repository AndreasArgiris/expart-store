import { motion } from 'framer-motion'
import { useViewport } from '../hooks/useViewport'
import { CopyEmail } from './CopyEmail'
import { Parallax } from './Parallax'
import { PickupCursors } from './PickupCursors'
import { ScrollSpreadQuote } from './ScrollSpreadQuote'
import { Waveform } from './Waveform'

const ease = [0.22, 1, 0.36, 1] as const
const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, delay, ease },
})

const EMAIL = 'expart.corp@gmail.com'

export function ContactSection() {
  // The section closes the page, so its title can't scroll far up: finish opening the spread when
  // the title is ~300px above the bottom of the screen, which is reachable at the end of the page.
  const { height } = useViewport()
  const spreadEnd = Math.round(Math.max(height * 0.35, height - 300))

  return (
    <section id="contact" className="row g-0 align-items-center contact-section" aria-labelledby="contact-title">
      <motion.div className="col-12 contact-wave" {...reveal(0)}>
        <Waveform className="waveform" />
      </motion.div>

      <motion.div className="col-12 col-lg-6 contact-art" {...reveal(0)}>
        <Parallax distance={50}>
          <PickupCursors className="pickup-cursors" />
        </Parallax>
      </motion.div>

      <div className="col-12 col-lg-6 contact-main">
        <motion.div {...reveal(0.1)}>
          <Parallax distance={30}>
            <div className="sq-label mb-4">Contact</div>
          </Parallax>
        </motion.div>
        <motion.div {...reveal(0.2)}>
          <Parallax distance={45}>
            <div id="contact-title">
              <ScrollSpreadQuote
                as="h2"
                className="contact-title"
                text="Let's dig deeper together"
                offset={['start end', `start ${spreadEnd}px`]}
              />
            </div>
          </Parallax>
        </motion.div>
        <motion.div {...reveal(0.3)}>
          <Parallax distance={60}>
            <p className="contact-copy">
              Bookings, collaborations, a venue you think we should play, or a record you can't find. Write to
              us and we'll get back to you.
            </p>
            <dl className="contact-list">
              <div>
                <dt>Email</dt>
                <dd>
                  <CopyEmail email={EMAIL} />
                </dd>
              </div>
            </dl>
          </Parallax>
        </motion.div>
      </div>
    </section>
  )
}
