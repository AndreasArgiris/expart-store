/** Small easing and random helpers for the cover liquid's per-frame drawing. All take and return 0–1 unless noted. */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** 0 below `a`, 1 above `b`, a smooth S-curve between. */
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/** Overshoots past 1 before settling, like a drop landing. */
export const easeOutBack = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2

/** Random number in [min, max). */
export const rand = (min: number, max: number) => min + Math.random() * (max - min)
