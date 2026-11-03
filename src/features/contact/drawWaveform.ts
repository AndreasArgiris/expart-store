export const BAR_W = 2
export const GAP = 3
export const HEIGHT = 40
// Share of the width, at each end, over which the bars shrink and fade out.
const EDGE_FADE = 0.14
const MS_PER_S = 1000
const MIN_AMP = 0.04
const MIN_BAR = 2 // px

// Envelope: a slow swell travelling along the row.
const SWELL_FLOOR = 0.35
const SWELL_WAVES = 2.2
const SWELL_SPEED = 0.35
// Three travelling waves at different frequencies, speeds and weights.
const WAVES = [
  { weight: 0.5, freq: 0.33, speed: 3.1 },
  { weight: 0.3, freq: 0.11, speed: -1.7 },
  { weight: 0.2, freq: 0.71, speed: 5.3 },
]
const WAVE_FLOOR = 0.55

/** Bar height (0–1) for bar `i` of `count`, at `s` seconds: a swelling envelope × ripples, tapered at the ends. */
export function barAmplitude(i: number, count: number, s: number) {
  const x = i / count
  const envelope = SWELL_FLOOR + (1 - SWELL_FLOOR) * Math.abs(Math.sin(x * Math.PI * SWELL_WAVES + s * SWELL_SPEED))
  const wave = WAVES.reduce((sum, w) => sum + w.weight * Math.sin(i * w.freq + s * w.speed), 0)
  // Taper both ends to nothing so the wave fades in and out instead of being cut off.
  const edge = Math.min(1, Math.min(x, 1 - x) / EDGE_FADE)
  const taper = edge * edge * (3 - 2 * edge)
  return Math.max(MIN_AMP, envelope * (WAVE_FLOOR + (1 - WAVE_FLOOR) * wave) * taper)
}

/** Draws the row of bars for time `t` (ms) across `width` px, in `color`. */
export function drawWaveform(ctx: CanvasRenderingContext2D, width: number, t: number, color: string) {
  const dpr = window.devicePixelRatio || 1
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, HEIGHT)
  ctx.fillStyle = color
  const count = Math.floor((width + GAP) / (BAR_W + GAP))
  const s = t / MS_PER_S
  for (let i = 0; i < count; i++) {
    const h = Math.max(MIN_BAR, barAmplitude(i, count, s) * HEIGHT)
    ctx.fillRect(i * (BAR_W + GAP), (HEIGHT - h) / 2, BAR_W, h)
  }
}
