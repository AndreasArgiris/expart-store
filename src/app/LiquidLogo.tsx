import { Blob, type TrailDrop } from '../shared/liquid/Blob'
import { ACCENT } from '../shared/theme'
import { useSvgId } from '../shared/hooks/useSvgId'
import { useLogoLiquid } from './useLogoLiquid'

const LOGO_SRC = '/media/logo.svg'
// Native size of logo.svg's viewBox; everything below is in these units.
const VB_W = 438.038
const VB_H = 274.481
// Lead blob radius (viewBox units) and its trailing droplets.
const SPOT = 78
const TRAIL: TrailDrop[] = [
  { scale: 1, stiffness: 200, damping: 18, stretch: 0.8 },
  { scale: 0.72, stiffness: 120, damping: 15, stretch: 0.6 },
  { scale: 0.52, stiffness: 78, damping: 13, stretch: 0.45 },
  { scale: 0.38, stiffness: 50, damping: 11, stretch: 0.3 },
]

/**
 * The black logo with an identical red copy stacked on top, hidden behind a liquid (goo-filtered)
 * mask. Hovering pours red through the logo where the cursor is; leaving drains it away.
 */
export function LiquidLogo({ width = 125 }: { width?: number }) {
  const id = useSvgId()
  const gooId = `logo-goo-${id}`
  const liquidId = `logo-liquid-${id}`
  const shapeId = `logo-shape-${id}`

  const { trail, handlers } = useLogoLiquid(VB_W, VB_H, SPOT)

  return (
    <svg
      className="liquid-logo"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={width}
      height={(width * VB_H) / VB_W}
      role="img"
      aria-label="Expart"
      {...handlers}
    >
      <defs>
        <filter
          id={gooId}
          filterUnits="userSpaceOnUse"
          x={-VB_W * 0.25}
          y={-VB_H * 0.25}
          width={VB_W * 1.5}
          height={VB_H * 1.5}
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={1} seed={4} result="noise" />
          <feGaussianBlur in="SourceGraphic" stdDeviation={10} result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
          <feDisplacementMap in="goo" in2="noise" scale={14} xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Where the liquid is. */}
        <mask id={liquidId} maskUnits="userSpaceOnUse" x={0} y={0} width={VB_W} height={VB_H}>
          <g filter={`url(#${gooId})`}>
            {TRAIL.map((t) => (
              <Blob key={t.scale} {...trail} {...t} />
            ))}
          </g>
        </mask>

        {/* The logo's own shape, so the red only ever fills the letters. */}
        <mask id={shapeId} maskUnits="userSpaceOnUse" x={0} y={0} width={VB_W} height={VB_H} style={{ maskType: 'alpha' }}>
          <image href={LOGO_SRC} width={VB_W} height={VB_H} />
        </mask>
      </defs>

      <image href={LOGO_SRC} width={VB_W} height={VB_H} />
      <g mask={`url(#${liquidId})`}>
        <rect width={VB_W} height={VB_H} fill={ACCENT} mask={`url(#${shapeId})`} />
      </g>
    </svg>
  )
}
