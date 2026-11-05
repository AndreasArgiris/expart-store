import { AnimatePresence, motion } from 'motion/react'
import type { Page } from '../shared/hooks/useRoute'
import { rise } from '../shared/motion'
import { FrameMarks } from './FrameMarks'
import { isNavItemActive, NAV_ITEMS } from './navItems'
import { NavLink } from './NavLink'

const PANEL_FADE = { duration: 0.25 }
const LINK_STAGGER = 0.06 // s

interface MobileMenuProps {
  id: string
  isOpen: boolean
  page: Page
  onNavigate: () => void
}

/** Full-screen nav panel for mobile; the links rise in one after another. */
export function MobileMenu({ id, isOpen, page, onNavigate }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav
          key="menu"
          id={id}
          className="mobile-menu"
          data-lenis-prevent
          aria-label="Main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={PANEL_FADE}
        >
          <FrameMarks />
          <ul className="mobile-menu-list list-unstyled mb-0">
            {NAV_ITEMS.map((item, i) => (
              <motion.li key={item.label} {...rise(i * LINK_STAGGER)}>
                <NavLink item={item} isActive={isNavItemActive(item, page)} onNavigate={onNavigate} />
              </motion.li>
            ))}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
