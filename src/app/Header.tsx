import { useId, useLayoutEffect, useRef, type RefObject } from 'react'
import { pageHref, type Page } from '../shared/hooks/useRoute'
import { LiquidLogo } from './LiquidLogo'
import { MenuToggle } from './MenuToggle'
import { MobileMenu } from './MobileMenu'
import { isNavItemActive, NAV_ITEMS } from './navItems'
import { NavLink } from './NavLink'
import { useMobileMenu } from './useMobileMenu'

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

/** Logo (home link) and the main nav: a row of links on desktop, a burger and full-screen menu on mobile. */
export function Header({ page }: { page: Page }) {
  const navRef = useRef<HTMLElement>(null)
  useNavInset(navRef)
  const menu = useMobileMenu(page)
  const menuId = useId()

  return (
    <header className="row g-0 align-items-center align-items-lg-start site-header" onBlur={menu.handleHeaderBlur}>
      <div className="col col-lg-6">
        <a href={pageHref.home} className="logo-link" aria-label="Expart, home" onClick={menu.close}>
          <LiquidLogo width={125} />
        </a>
      </div>

      <nav ref={navRef} className="col-lg-6 d-none d-lg-block" aria-label="Main">
        <ul className="site-nav list-unstyled mb-0">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <NavLink item={item} isActive={isNavItemActive(item, page)} />
            </li>
          ))}
        </ul>
      </nav>

      <MenuToggle isOpen={menu.isOpen} menuId={menuId} onToggle={menu.handleToggle} />
      <MobileMenu id={menuId} isOpen={menu.isOpen} page={page} onNavigate={menu.close} />
    </header>
  )
}
