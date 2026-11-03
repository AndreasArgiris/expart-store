import { useEffect, useState } from 'react'

const TICK_MS = 1000

/** The current time, updated every second. */
export function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS)
    return () => clearInterval(id)
  }, [])
  return now
}
