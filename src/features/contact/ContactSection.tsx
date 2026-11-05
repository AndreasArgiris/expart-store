import { motion } from 'motion/react'
import { useViewport } from '../../shared/hooks/useViewport'
import { CopyEmail } from './CopyEmail'
import { Parallax } from '../../shared/components/Parallax'
import { PickupCursors } from './PickupCursors'
import { ScrollSpreadQuote } from '../../shared/quote/ScrollSpreadQuote'
import { Waveform } from './Waveform'
import { revealOnScroll } from '../../shared/motion'

const EMAIL = 'expart.corp@gmail.com'
// The title's spread finishes opening this far (px) above the bottom of the screen, or at least this share down.
const SPREAD_END_FROM_BOTTOM = 300
const SPREAD_END_MIN_SHARE = 0.35
// Reveal delays (s): the contact text comes in block by block.
const LABEL_DELAY = 0.1
const TITLE_DELAY = 0.2
const COPY_DELAY = 0.3

/** Closing contact block: waveform, tonearm art, the spread title and a copy-to-clipboard email. */
export function ContactSection() {
  // The section closes the page, so its title can't scroll far up: finish opening the spread when
  // the title is ~300px above the bottom of the screen, which is reachable at the end of the page.
  const { height } = useViewport()
  const spreadEnd = Math.round(Math.max(height * SPREAD_END_MIN_SHARE, height - SPREAD_END_FROM_BOTTOM))

  return (
    <section id="contact" className="row g-0 align-items-center contact-section" aria-labelledby="contact-title">
      <motion.div className="col-12 contact-wave" {...revealOnScroll(0)}>
        <Waveform className="waveform" />
      </motion.div>

      <motion.div className="col-12 col-lg-6 order-last order-lg-0 contact-art" {...revealOnScroll(0)}>
        <Parallax distance={50}>
          <PickupCursors className="pickup-cursors" />
        </Parallax>
      </motion.div>

      <div className="col-12 col-lg-6 contact-main">
        <motion.div {...revealOnScroll(LABEL_DELAY)}>
          <Parallax>
            <div className="sq-label mb-4">Contact</div>
          </Parallax>
        </motion.div>
        <motion.div {...revealOnScroll(TITLE_DELAY)}>
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
        <motion.div {...revealOnScroll(COPY_DELAY)}>
          <Parallax distance={60}>
            <p className="contact-copy">
              Bookings, collaborations, a venue you think we should play, or a record you can't find. Write to us and
              we'll get back to you.
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
