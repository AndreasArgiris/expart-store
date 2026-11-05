import type { MouseEvent } from 'react'
import { useCart } from '../features/cart/cartContext'
import { pageHref } from '../shared/hooks/useRoute'
import { useScramble } from '../shared/hooks/useScramble'
import type { NavItem } from './navItems'

interface NavLinkProps {
  item: NavItem
  isActive: boolean
  /** Called after the link is followed, or the cart opened. */
  onNavigate?: () => void
}

/** One nav entry: its label scrambles on hover, and the Cart entry opens the drawer. */
export function NavLink({ item, isActive, onNavigate }: NavLinkProps) {
  const { count: cartCount, open: openCart } = useCart()
  const count = item.isCart ? cartCount : item.count
  const label = count !== undefined ? `${item.label} [${count}]` : item.label
  const { text, scramble } = useScramble(label)

  const handleClick = (e: MouseEvent) => {
    if (item.isCart) {
      e.preventDefault()
      openCart()
    }
    onNavigate?.()
  }

  return (
    <a
      href={item.page ? pageHref[item.page] : '#'}
      className={`sq-link nav-link-scramble fw-bold${isActive ? ' active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      onPointerEnter={scramble}
      onFocus={scramble}
      onClick={handleClick}
    >
      <span aria-hidden="true">{text}</span>
    </a>
  )
}
