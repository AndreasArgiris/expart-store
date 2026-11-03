import { motion } from 'motion/react'
import { useSvgId } from '../../../shared/hooks/useSvgId'
import { Blob, type TrailDrop } from '../../../shared/liquid/Blob'
import { CoverLiquidDefs } from './CoverLiquidDefs'
import { useCoverLiquid } from './useCoverLiquid'

// Trailing droplets behind the hover blob: each smaller and lazier.
const TRAIL: TrailDrop[] = [
  { scale: 1, stiffness: 130, damping: 14, stretch: 1 },
  { scale: 0.72, stiffness: 85, damping: 12, stretch: 0.8 },
  { scale: 0.52, stiffness: 55, damping: 10, stretch: 0.6 },
  { scale: 0.38, stiffness: 34, damping: 9, stretch: 0.4 },
]
const PADDING = 0.07 // white margin around the art, × frame size

interface CoverLiquidProps {
  src: string
  alt: string
  size: number
  isRevealed: boolean
}

/**
 * Cover art revealed through a liquid SVG mask: blurred + thresholded ("goo") shapes whose edges are
 * warped by slowly drifting noise. Revealing pours the cover out from the centre in a splash and
 * hiding drains it back; hovering drags a small wobbling droplet trail that flings off splashes,
 * revealing the cover or, when it's shown, cutting through it to the vinyl.
 */
export function CoverLiquid({ src, alt, size, isRevealed }: CoverLiquidProps) {
  const id = useSvgId()
  const ids = { goo: `liquid-${id}`, refract: `refract-${id}`, mask: `liquid-mask-${id}` }
  const { els, shownSrc, switchFade, trail, setLead, hoverHandlers } = useCoverLiquid(src, size, isRevealed)
  const pad = size * PADDING
  const art = { href: shownSrc, x: pad, y: pad, width: size - pad * 2, height: size - pad * 2, preserveAspectRatio: 'xMidYMid slice' }

  return (
    <>
      <motion.svg
        className="cover-liquid"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={alt}
        aria-hidden={!isRevealed}
        style={{ opacity: switchFade }}
      >
        <CoverLiquidDefs ids={ids} size={size} els={els}>
          {TRAIL.map((t, i) => (
            <Blob key={t.scale} {...trail} {...t} onLead={i === 0 ? setLead : undefined} />
          ))}
        </CoverLiquidDefs>

        <g mask={`url(#${ids.mask})`}>
          <rect width={size} height={size} fill="#fff" />
          <image {...art} filter={`url(#${ids.refract})`} />
        </g>

        <g ref={els.clean} opacity={0}>
          <rect width={size} height={size} fill="#fff" />
          <image {...art} />
        </g>
      </motion.svg>

      {/* Separate hit area: neighbour discs are DOM children of the frame but sit outside it. */}
      <div className="hover-zone" {...hoverHandlers} />
    </>
  )
}
