import { useRef } from 'react'
import { motion } from 'motion/react'
import { useDriftingStrip } from './useDriftingStrip'

const CONCEPT_COUNT = 6
const CONCEPTS = Array.from({ length: CONCEPT_COUNT }, (_, i) => `/media/products/concepts/concept${i + 1}.webp`)
// Rendered twice so the strip can loop without a gap; the second copy is hidden from screen readers.
const SLIDES = [...CONCEPTS.map((src) => ({ src, isCopy: false })), ...CONCEPTS.map((src) => ({ src, isCopy: true }))]

/** Endless, slowly drifting strip of concept photos. Eases to a stop while hovered. */
export function ConceptStrip() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { x, pause, resume } = useDriftingStrip(trackRef)

  return (
    <div className="concepts" onPointerEnter={pause} onPointerLeave={resume}>
      <motion.div ref={trackRef} className="concepts-track" style={{ x }}>
        {SLIDES.map(({ src, isCopy }, i) => (
          <figure key={`${src}${isCopy ? '-copy' : ''}`} className="concept" aria-hidden={isCopy || undefined}>
            <img src={src} alt={isCopy ? '' : `Expart event, concept ${i + 1}`} draggable={false} />
          </figure>
        ))}
      </motion.div>
    </div>
  )
}
