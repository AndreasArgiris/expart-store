import { useEffect } from 'react'
import { pauseScroll, resumeScroll } from '../smoothScroll'

/** While a full-screen overlay is open: Escape closes it, and the page behind can't scroll. */
export function useOverlayDismiss(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    pauseScroll()
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = overflow
      resumeScroll()
    }
  }, [isOpen, onClose])
}
