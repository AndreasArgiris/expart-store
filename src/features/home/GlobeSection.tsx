import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { events } from '../events/events'
import { pageHref } from '../../shared/hooks/usePage'
import { useViewport } from '../../shared/hooks/useViewport'
import { Globe } from './globe/Globe'
import { Parallax } from '../../shared/components/Parallax'
import { ScrollSpreadQuote } from '../../shared/components/ScrollSpreadQuote'
import { revealOnScroll } from '../../shared/motion'
import { BREAKPOINT_LG } from '../../shared/theme'

const formatTime = (d: Date) =>
  d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

function formatZone(d: Date) {
  const minutes = -d.getTimezoneOffset()
  const sign = minutes >= 0 ? '+' : '-'
  const h = Math.floor(Math.abs(minutes) / 60)
  const m = Math.abs(minutes) % 60
  const offset = `${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`
  return `GMT${offset} (UTC${offset})`
}

const formatCoord = (value: number, pos: string, neg: string) =>
  `${Math.abs(value).toFixed(4)}° ${value >= 0 ? pos : neg}`

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function GlobeSection() {
  const { width, height } = useViewport()
  const now = useClock()
  const latRef = useRef<HTMLElement>(null)
  const lonRef = useRef<HTMLElement>(null)

  const desktop = width >= BREAKPOINT_LG
  const size = Math.round(desktop ? Math.min(720, height * 0.8, width * 0.42) : Math.min(width - 48, 520))

  // Written straight to the DOM: this fires every animation frame.
  const onCenterChange = useCallback((lon: number, lat: number) => {
    if (latRef.current) latRef.current.textContent = formatCoord(lat, 'N', 'S')
    if (lonRef.current) lonRef.current.textContent = formatCoord(lon, 'E', 'W')
  }, [])

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
          onCenterChange={onCenterChange}
          onPinClick={() => (window.location.hash = pageHref.events)}
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
