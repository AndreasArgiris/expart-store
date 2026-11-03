import { useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'motion/react'

const CONCEPTS = [1, 2, 3, 4, 5, 6].map((n) => `/media/products/concepts/concept${n}.webp`)
// Drift speed in px per ms.
const SPEED = 0.04

/** Endless, slowly drifting strip of concept photos. Eases to a stop while hovered. */
export function ConceptStrip() {
  const trackRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const speed = useRef(1)
  const targetSpeed = useRef(1)
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useAnimationFrame((_, delta) => {
    const track = trackRef.current
    if (!track || reducedMotion.current) return
    speed.current += (targetSpeed.current - speed.current) * 0.06
    // The list is rendered twice; once we've moved one full copy, jump back seamlessly.
    const loop = track.scrollWidth / 2
    let next = x.get() - delta * SPEED * speed.current
    if (next <= -loop) next += loop
    x.set(next)
  })

  return (
    <div
      className="concepts"
      onPointerEnter={() => (targetSpeed.current = 0)}
      onPointerLeave={() => (targetSpeed.current = 1)}
    >
      <motion.div ref={trackRef} className="concepts-track" style={{ x }}>
        {[...CONCEPTS, ...CONCEPTS].map((src, i) => {
          const duplicate = i >= CONCEPTS.length
          return (
            <figure key={i} className="concept" aria-hidden={duplicate || undefined}>
              <img src={src} alt={duplicate ? '' : `Expart event, concept ${i + 1}`} draggable={false} />
            </figure>
          )
        })}
      </motion.div>
    </div>
  )
}
