import { useEffect, useId, useRef } from 'react'
import { useMotionValue } from 'motion/react'
import { useCursorReveal } from '../hooks/useCursorReveal'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { Blob } from './CoverLiquid'

// Compressed with `npm run compress:video` (original: hero_storyboard_ink_animatic.mp4).
const VIDEO_SRC = '/media/hero-reveal.mp4'

// Desktop with a real mouse, and the visitor hasn't asked for less motion.
const REVEAL_QUERY = '(min-width: 992px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

// Lead blob radius (px) and its trailing droplets: each smaller and lazier, so the liquid drags behind
// the cursor and stays on screen a while. Low damping lets them wobble like jelly.
const SPOT = 200
const TRAIL = [
  { scale: 1, stiffness: 150, damping: 16, stretch: 0.8 },
  { scale: 0.85, stiffness: 70, damping: 13, stretch: 0.6 },
  { scale: 0.7, stiffness: 38, damping: 11, stretch: 0.45 },
  { scale: 0.55, stiffness: 22, damping: 9, stretch: 0.3 },
]
// Goo: blur merges the droplets, the alpha threshold firms up their edges, noise warps them.
const GOO_BLUR = SPOT * 0.13
const GOO_WARP = SPOT * 0.2

/** Background video that shows through a liquid trail behind the cursor. Desktop only. */
export function HeroVideoReveal() {
  const isEnabled = useMediaQuery(REVEAL_QUERY)
  // Not rendering the video at all means small and touch screens never download it.
  return isEnabled ? <RevealLayer /> : null
}

function RevealLayer() {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const gooId = `hero-goo-${id}`
  const maskId = `hero-liquid-${id}`
  const layerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { pointerX, pointerY, blobRadius, jumpers, isVisible } = useCursorReveal(layerRef, SPOT)
  // Black in the mask = a hole in the white cover, so the video shows through.
  const holeFill = useMotionValue('#000')

  // Only decode video frames while some of the liquid is on screen.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isVisible) void video.play().catch(() => {})
    else video.pause()
  }, [isVisible])

  // An SVG mask can't reliably cut an HTML <video>, so the video plays underneath and a white cover
  // (matching the page) sits on top, with the liquid punched out of it.
  return (
    <div ref={layerRef} className="hero-reveal" aria-hidden="true">
      <video ref={videoRef} src={VIDEO_SRC} muted loop playsInline preload="auto" />
      <svg>
        <defs>
          <filter id={gooId} filterUnits="userSpaceOnUse" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={1} seed={4} result="noise" />
            <feGaussianBlur in="SourceGraphic" stdDeviation={GOO_BLUR} result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
            <feDisplacementMap in="goo" in2="noise" scale={GOO_WARP} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <rect width="100%" height="100%" fill="#fff" />
            <g filter={`url(#${gooId})`}>
              {TRAIL.map((t) => (
                <Blob
                  key={t.scale}
                  pointerX={pointerX}
                  pointerY={pointerY}
                  radius={blobRadius}
                  fill={holeFill}
                  jumpers={jumpers}
                  {...t}
                />
              ))}
            </g>
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="#fff" mask={`url(#${maskId})`} />
      </svg>
    </div>
  )
}
