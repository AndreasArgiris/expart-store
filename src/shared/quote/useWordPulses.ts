import { useEffect, useState } from 'react'

// Calm pacing: a new word scrambles every ~1.8s.
export const PULSE_MS = 1800

/** Picks a random candidate, but never the same one twice in a row (when there's a choice). */
export function pickNext(candidates: number[], last: number) {
  const pick = candidates[Math.floor(Math.random() * candidates.length)]
  if (candidates.length > 1 && pick === last) return candidates[(candidates.indexOf(pick) + 1) % candidates.length]
  return pick
}

/**
 * While `isActive`, bumps one word's pulse counter every `PULSE_MS`, hopping between the `candidates`
 * (word indices). Each `QuoteWord` scrambles whenever its pulse changes.
 */
export function useWordPulses(wordCount: number, candidates: number[], isActive = true) {
  const [pulses, setPulses] = useState<number[]>(() => Array.from({ length: wordCount }, () => 0))

  useEffect(() => {
    if (!isActive || !candidates.length) return
    let last = -1
    const id = setInterval(() => {
      const pick = pickNext(candidates, last)
      last = pick
      setPulses((p) => p.map((n, i) => (i === pick ? n + 1 : n)))
    }, PULSE_MS)
    return () => clearInterval(id)
  }, [candidates, isActive])

  return pulses
}
