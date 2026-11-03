import type { ReactNode } from 'react'
import type { CoverElements } from './useCoverLiquid'
import { POUR_DROPS } from './pour'
import { SPLASH_MAX } from './splashes'

const SPLASH_SLOTS = Array.from({ length: SPLASH_MAX }, (_, i) => i)
const POUR_SLOTS = POUR_DROPS.map((_, i) => i)
// Filters reach past the frame so warped edges aren't clipped.
const REGION_OVERHANG = 0.25
// Goo: blur merges shapes, the alpha threshold firms their edges, drifting noise warps them.
const GOO_BLUR = 0.022 // × frame size
const GOO_WARP = 0.035 // × frame size
const GOO_SOFTEN = 1.2 // px, a last touch of blur so the threshold edge isn't aliased
const GOO_THRESHOLD = '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9'

interface CoverLiquidDefsProps {
  ids: { goo: string; refract: string; mask: string }
  size: number
  els: CoverElements
  /** The hover droplet trail, drawn into the mask. */
  children: ReactNode
}

/** The cover liquid's SVG filters (goo + refraction) and its mask: the pour, the hover trail and the splashes. */
export function CoverLiquidDefs({ ids, size, els, children }: CoverLiquidDefsProps) {
  const region = {
    x: -size * REGION_OVERHANG,
    y: -size * REGION_OVERHANG,
    width: size * (1 + 2 * REGION_OVERHANG),
    height: size * (1 + 2 * REGION_OVERHANG),
  }

  return (
    <defs>
      <filter id={ids.goo} filterUnits="userSpaceOnUse" {...region} colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves={1} seed={7} result="noiseRaw" />
        <feOffset ref={els.gooOffset} in="noiseRaw" result="noise" />
        <feGaussianBlur in="SourceGraphic" stdDeviation={size * GOO_BLUR} result="blur" />
        <feColorMatrix in="blur" type="matrix" values={GOO_THRESHOLD} result="goo" />
        <feDisplacementMap
          in="goo"
          in2="noise"
          scale={size * GOO_WARP}
          xChannelSelector="R"
          yChannelSelector="G"
          result="warped"
        />
        <feGaussianBlur in="warped" stdDeviation={GOO_SOFTEN} />
      </filter>

      <filter id={ids.refract} filterUnits="userSpaceOnUse" {...region} colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={1} seed={3} result="noiseRaw" />
        <feOffset ref={els.refractOffset} in="noiseRaw" result="noise" />
        <feDisplacementMap
          ref={els.refractMap}
          in="SourceGraphic"
          in2="noise"
          scale={0}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      <mask id={ids.mask} maskUnits="userSpaceOnUse" x={0} y={0} width={size} height={size}>
        <g filter={`url(#${ids.goo})`}>
          <circle ref={els.pool} cx={size / 2} cy={size / 2} r={0} fill="#fff" />
          {POUR_SLOTS.map((i) => (
            <circle key={`pour-${i}`} ref={(el) => void (els.pourDrops.current[i] = el)} r={0} fill="#fff" />
          ))}
          {children}
          {SPLASH_SLOTS.map((i) => (
            <circle key={`splash-${i}`} ref={(el) => void (els.splashDrops.current[i] = el)} r={0} />
          ))}
        </g>
      </mask>
    </defs>
  )
}
