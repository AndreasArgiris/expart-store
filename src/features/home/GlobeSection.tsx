import { useCallback, useRef } from 'react'
import { motion } from 'motion/react'
import { events } from '../events/events'
import { pageHref } from '../../shared/hooks/useRoute'
import { useViewport } from '../../shared/hooks/useViewport'
import { Globe } from './globe/Globe'
import { formatCoord, formatTime, formatZone } from './globe/readout'
import { useClock } from './globe/useClock'
import { Parallax } from '../../shared/components/Parallax'
import { ScrollSpreadQuote } from '../../shared/quote/ScrollSpreadQuote'
import { revealOnScroll } from '../../shared/motion'
import { BREAKPOINT_LG } from '../../shared/theme'

// Globe size: big beside the copy on desktop, nearly full-width on mobile.
const DESKTOP_MAX = 720
const DESKTOP_HEIGHT_SHARE = 0.8
const DESKTOP_WIDTH_SHARE = 0.42
const MOBILE_GUTTER = 48
const MOBILE_MAX = 520

function useGlobeSize() {
  const { width, height } = useViewport()
  const isDesktop = width >= BREAKPOINT_LG
  return Math.round(
    isDesktop ? Math.min(DESKTOP_MAX, height * DESKTOP_HEIGHT_SHARE, width * DESKTOP_WIDTH_SHARE) : Math.min(width - MOBILE_GUTTER, MOBILE_MAX),
  )
}

/** Home's second screen: the events globe with a scroll-spread title, local clock and live coordinates. */
export function GlobeSection() {
  const size = useGlobeSize()
  const now = useClock()
  const latRef = useRef<HTMLElement>(null)
  const lonRef = useRef<HTMLElement>(null)

  // Written straight to the DOM: this fires every animation frame.
  const handleCenterChange = useCallback((lon: number, lat: number) => {
    if (latRef.current) latRef.current.textContent = formatCoord(lat, 'N', 'S')
    if (lonRef.current) lonRef.current.textContent = formatCoord(lon, 'E', 'W')
  }, [])

  const handlePinClick = () => {
    window.location.hash = pageHref.events
  }

  return (
    <section className="globe-section" aria-labelledby="globe-title">
      <motion.div className="globe-intro" {...revealOnScroll(0)}>
        <Parallax distance={50}>
          <div id="globe-title">
            <ScrollSpreadQuote as="h2" className="globe-title" text="Discover Expart pop up events around the globe" />
          </div>
        </Parallax>
      </motion.div>

      <motion.div className="globe-stage" {...revealOnScroll(0.15)}>
        <Globe
          size={size}
          pins={events}
          onCenterChange={handleCenterChange}
          onPinClick={handlePinClick}
        />
      </motion.div>

      <motion.div className="globe-clock" {...revealOnScroll(0.25)}>
        <Parallax>
          <dl className="globe-readout">
            <div>
              <dt>Local time:</dt>
              <dd>{formatTime(now)}</dd>
            </div>
            <div>
              <dt>Time zone:</dt>
              <dd>{formatZone(now)}</dd>
            </div>
          </dl>
        </Parallax>
      </motion.div>

      <motion.div className="globe-coords" {...revealOnScroll(0.3)}>
        <Parallax>
          <dl className="globe-readout">
            <div>
              <dt>Lat:</dt>
              <dd ref={latRef}>–</dd>
            </div>
            <div>
              <dt>Lon:</dt>
              <dd ref={lonRef}>–</dd>
            </div>
          </dl>
        </Parallax>
      </motion.div>

      <motion.div className="globe-copy" {...revealOnScroll(0.35)}>
        <Parallax distance={60}>
          <p className="mb-0">
            Expart travels from city to city, taking its events to places that care about sound as much as we
            do. Every stop brings its own energy, shaped by local diggers, new crowds and unexpected rooms.
            Different cities, same crates.
          </p>
        </Parallax>
      </motion.div>
    </section>
  )
}
