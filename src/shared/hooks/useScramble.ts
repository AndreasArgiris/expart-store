import { useCallback, useEffect, useRef, useState } from 'react'

const DIGITS = '0123456789'
// How often scrambled characters re-roll (ms) — fast, but slow enough to read as flicker.
const ROLL_MS = 35

const isScramblable = (ch: string) => /[a-z0-9]/i.test(ch)
const randomDigit = () => DIGITS[Math.floor(Math.random() * DIGITS.length)]

/**
 * Decoder-style text effect: every letter flickers through random digits, then the word
 * resolves left to right. Spaces and punctuation stay put, so with a monospace font the
 * width never changes. `running` is true while the effect plays.
 */
export function useScramble(target: string, duration = 420, rollMs = ROLL_MS) {
  const [text, setText] = useState(target)
  const [running, setRunning] = useState(false)
  const frame = useRef(0)

  // Follow label changes (e.g. a live count) when no scramble is playing.
  const [shownTarget, setShownTarget] = useState(target)
  if (shownTarget !== target) {
    setShownTarget(target)
    if (!running) setText(target)
  }

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const scramble = useCallback(() => {
    cancelAnimationFrame(frame.current)
    const start = performance.now()
    let lastRoll = -Infinity
    setRunning(true)

    const tick = (now: number) => {
      const t = (now - start) / duration
      if (t >= 1) {
        setText(target)
        setRunning(false)
        return
      }
      if (now - lastRoll >= rollMs) {
        lastRoll = now
        let out = ''
        for (let i = 0; i < target.length; i++) {
          const ch = target[i]
          // Each character locks in at its own moment, sweeping left → right.
          const lockAt = 0.25 + 0.75 * (i / target.length)
          out += !isScramblable(ch) || t >= lockAt ? ch : randomDigit()
        }
        setText(out)
      }
      frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
  }, [target, duration, rollMs])

  return { text, running, scramble }
}
