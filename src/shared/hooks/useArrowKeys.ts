import { useEffect } from 'react'

const FORWARD = ['ArrowRight']
const BACK = ['ArrowLeft']
const FORWARD_VERTICAL = ['ArrowRight', 'ArrowDown']
const BACK_VERTICAL = ['ArrowLeft', 'ArrowUp']

/**
 * Steps a carousel with the arrow keys: right is +1, left is -1, and with `vertical` down/up too.
 * `onStep` should be stable (wrap it in useCallback), or the listener is re-attached every render.
 */
export function useArrowKeys(onStep: (delta: number) => void, { vertical = false } = {}) {
  useEffect(() => {
    const forward = vertical ? FORWARD_VERTICAL : FORWARD
    const back = vertical ? BACK_VERTICAL : BACK
    const handleKeyDown = (e: KeyboardEvent) => {
      if (forward.includes(e.key)) onStep(1)
      if (back.includes(e.key)) onStep(-1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onStep, vertical])
}
