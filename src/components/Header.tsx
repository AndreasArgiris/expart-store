import { useLayoutEffect, useRef, type RefObject } from 'react'
import { useCart } from '../cart/cartContext'
import { events } from '../data/events'
import { releases } from '../data/releases'
import { pageHref, type Page } from '../hooks/usePage'
import { useScramble } from '../hooks/useScramble'
import { LiquidLogo } from './LiquidLogo'

type NavPage = Exclude<Page, 'product'>

interface NavItem {
  label: string
  count?: number
  page?: NavPage
  /** Opens the cart drawer instead of navigating. */
  cart?: boolean
}

const NAV: NavItem[] = [
  { label: 'Events', count: events.length, page: 'events' },
  { label: 'Shop', page: 'shop' },
  { label: 'Vinyls', count: releases.length, page: 'vinyl' },
  { label: 'About', page: 'about' },
  { label: 'Cart', cart: true },
]

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const { count: cartCount, open: openCart } = useCart()
  const count = item.cart ? cartCount : item.count
  const label = count !== undefined ? `${item.label} [${count}]` : item.label
  const { text, scramble } = useScramble(label)

  return (
    <a
      href={item.page ? pageHref[item.page] : '#'}
      className={`sq-link nav-link-scramble fw-bold${active ? ' active' : ''}`}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      onPointerEnter={scramble}
      onFocus={scramble}
      onClick={
        item.cart
          ? (e) => {
              e.preventDefault()
              openCart()
            }
          : undefined
      }
    >
      <span aria-hidden="true">{text}</span>
    </a>
  )
}

/**
 * Publishes the gap between the viewport's right edge and the end of the widest nav label as
 * `--nav-inset`, so page content can line its right edge up with the nav's visible text.
 */
function useNavInset(navRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const update = () => {
      const right = Math.max(...[...nav.querySelectorAll('a')].map((a) => a.getBoundingClientRect().right))
      const inset = document.documentElement.clientWidth - right
      document.documentElement.style.setProperty('--nav-inset', `${Math.round(inset)}px`)
    }
    update()
    // Label widths change once the web font arrives.
    document.fonts.ready.then(update)
    const observer = new ResizeObserver(update)
    observer.observe(nav)
    return () => observer.disconnect()
  }, [navRef])
}

export function Header({ page }: { page: Page }) {
  const navRef = useRef<HTMLElement>(null)
  useNavInset(navRef)

  return (
    <header className="row g-0 align-items-start site-header">
      <div className="col-12 col-lg-6 mb-4 mb-lg-0">
        <a href={pageHref.home} className="logo-link" aria-label="Expart, home">
          <LiquidLogo width={125} />
        </a>
      </div>

      <nav ref={navRef} className="col-12 col-lg-6" aria-label="Main">
        <ul className="site-nav list-unstyled mb-0">
          {NAV.map((item) => (
            <li key={item.label}>
              <NavLink item={item} active={item.page === page || (item.page === 'shop' && page === 'product')} />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
