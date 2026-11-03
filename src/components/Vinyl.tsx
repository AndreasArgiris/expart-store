import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'

// 33⅓ rpm expressed in degrees per millisecond.
const DEG_PER_MS = (360 * (100 / 3)) / 60_000

interface VinylProps {
  src: string
  alt: string
  size: number
  spinning: boolean
}

/** Record image that spins while playing and keeps its angle when paused. */
export function Vinyl({ src, alt, size, spinning }: VinylProps) {
  const rotate = useMotionValue(0)

  useAnimationFrame((_, delta) => {
    if (spinning) rotate.set((rotate.get() + delta * DEG_PER_MS) % 360)
  })

  return (
    <motion.img
      src={src}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className="vinyl"
      style={{ rotate }}
    />
  )
}
