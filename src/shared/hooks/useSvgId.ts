import { useId } from 'react'

/** A unique id that is safe inside SVG `url(#...)` references (React's ids contain colons). */
export function useSvgId() {
  return useId().replace(/[^a-zA-Z0-9_-]/g, '')
}
