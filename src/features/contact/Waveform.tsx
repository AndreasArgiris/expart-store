import { useEffect, useRef, type RefObject } from 'react'
import { useReducedMotion } from 'motion/react'
import { drawWaveform, HEIGHT } from './drawWaveform'

/** Sizes the canvas to its box and animates the waveform, but only while it's on screen (and motion is allowed). */
function useWaveform(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const isReducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const ink = getComputedStyle(canvas).color
    let width = 0
    let frame = 0
    let isVisible = false

    const loop = (t: number) => {
      drawWaveform(ctx, width, t, ink)
      if (isVisible && !isReducedMotion) frame = requestAnimationFrame(loop)
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      width = canvas.clientWidth
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(HEIGHT * dpr)
      drawWaveform(ctx, width, performance.now(), ink)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    const viewObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (isVisible) frame = requestAnimationFrame(loop)
    })
    viewObserver.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      viewObserver.disconnect()
    }
  }, [canvasRef, isReducedMotion])
}

/** Live-looking audio waveform: a row of bars whose heights ripple from layered sine waves. */
export function Waveform({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useWaveform(canvasRef)
  return <canvas ref={canvasRef} className={className} style={{ height: HEIGHT }} aria-hidden="true" />
}
