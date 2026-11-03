import { useEffect, useRef } from 'react'

const BAR_W = 2
const GAP = 3
const HEIGHT = 40
// Share of the width, at each end, over which the bars shrink and fade out.
const EDGE_FADE = 0.14

/**
 * Live-looking audio waveform: a row of bars whose heights ripple from layered sine waves.
 * Drawn on a canvas, and only animated while on screen.
 */
export function Waveform({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ink = getComputedStyle(canvas).color
    let width = 0
    let frame = 0
    let visible = false

    const draw = (t: number) => {
      const dpr = window.devicePixelRatio || 1
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, HEIGHT)
      ctx.fillStyle = ink
      const count = Math.floor((width + GAP) / (BAR_W + GAP))
      const s = t / 1000
      for (let i = 0; i < count; i++) {
        const x = i / count
        // Swelling envelope plus a few travelling waves at different speeds.
        const envelope = 0.35 + 0.65 * Math.abs(Math.sin(x * Math.PI * 2.2 + s * 0.35))
        const wave =
          0.5 * Math.sin(i * 0.33 + s * 3.1) + 0.3 * Math.sin(i * 0.11 - s * 1.7) + 0.2 * Math.sin(i * 0.71 + s * 5.3)
        // Taper both ends to nothing so the wave fades in and out instead of being cut off.
        const edge = Math.min(1, Math.min(x, 1 - x) / EDGE_FADE)
        const taper = edge * edge * (3 - 2 * edge)
        const amp = Math.max(0.04, envelope * (0.55 + 0.45 * wave) * taper)
        const h = Math.max(2, amp * HEIGHT)
        ctx.fillRect(i * (BAR_W + GAP), (HEIGHT - h) / 2, BAR_W, h)
      }
    }

    const loop = (t: number) => {
      draw(t)
      if (visible && !reduced) frame = requestAnimationFrame(loop)
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      width = canvas.clientWidth
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(HEIGHT * dpr)
      draw(performance.now())
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (visible) frame = requestAnimationFrame(loop)
    })
    viewObserver.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      viewObserver.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} style={{ height: HEIGHT }} aria-hidden="true" />
}
