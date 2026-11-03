import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'

const DEFAULT_DISTANCE = 30 // px, the usual drift for a text block
const SMOOTHING = { stiffness: 110, damping: 26, mass: 0.5 }

interface ParallaxProps {
  children: ReactNode
  /** Max drift in px: the block sits `distance` lower entering the viewport, `distance` higher leaving it. */
  distance?: number
  className?: string
}

/** Gentle scroll-linked vertical drift, in both scroll directions, spring-smoothed. */
export function Parallax({ children, distance = DEFAULT_DISTANCE, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isReduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const raw = useTransform(scrollYProgress, [0, 1], isReduced ? [0, 0] : [distance, -distance])
  const y = useSpring(raw, SMOOTHING)

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}
