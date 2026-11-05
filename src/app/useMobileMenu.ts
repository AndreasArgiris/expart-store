import { useCallback, useState, type FocusEvent } from 'react'
import { useMediaQuery } from '../shared/hooks/useMediaQuery'
import { useOverlayDismiss } from '../shared/hooks/useOverlayDismiss'
import type { Page } from '../shared/hooks/useRoute'
import { BREAKPOINT_LG } from '../shared/theme'

const MOBILE_QUERY = `(width < ${BREAKPOINT_LG}px)`

/**
 * The mobile menu's open state. It closes on Escape, when the screen grows past the mobile layout, when the
 * page changes (including the back button), and when keyboard focus moves out of the header.
 */
export function useMobileMenu(page: Page) {
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const [openedOn, setOpenedOn] = useState<Page | null>(null)
  const isOpen = isMobile && openedOn === page

  const close = useCallback(() => setOpenedOn(null), [])
  useOverlayDismiss(isOpen, close)

  const handleToggle = () => setOpenedOn(isOpen ? null : page)

  const handleHeaderBlur = (e: FocusEvent<HTMLElement>) => {
    const next = e.relatedTarget
    if (next instanceof Node && !e.currentTarget.contains(next)) close()
  }

  return { isOpen, close, handleToggle, handleHeaderBlur }
}
