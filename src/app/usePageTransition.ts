import { useState } from 'react'
import type { Variants } from 'motion/react'
import type { Page, Route } from '../shared/hooks/useRoute'
import { jumpToTop } from '../shared/smoothScroll'

// Menu order decides slide direction: moving "forward" brings content in from the right.
const ORDER: Page[] = ['home', 'events', 'shop', 'product', 'vinyl', 'about']
const SLIDE = 35 // vw
// Cubic-bezier control points of the two curves below.
const ENTER_X1 = 0.16
const ENTER_X2 = 0.3
const EXIT_X1 = 0.4
const EXIT_X2 = 0.9
const EXIT_Y2 = 0.5
const ENTER_EASE = [ENTER_X1, 1, ENTER_X2, 1] as const
const EXIT_EASE = [EXIT_X1, 0, EXIT_X2, EXIT_Y2] as const
const ENTER_SLIDE = 0.55 // s
const ENTER_FADE = 0.35 // s
const EXIT = 0.28 // s

/** Page slide in/out; `custom` is the direction (1 forward, -1 back). Opacity runs gentler than the slide. */
export const pageSlide: Variants = {
  enter: (dir: number) => ({ x: `${dir * SLIDE}vw`, opacity: 0 }),
  center: {
    x: '0vw',
    opacity: 1,
    transition: { x: { duration: ENTER_SLIDE, ease: ENTER_EASE }, opacity: { duration: ENTER_FADE, ease: 'linear' } },
  },
  exit: (dir: number) => ({
    x: `${dir * -SLIDE}vw`,
    opacity: 0,
    transition: { x: { duration: EXIT, ease: EXIT_EASE }, opacity: { duration: EXIT, ease: 'easeIn' } },
  }),
}

// Each product is its own page, so moving between products slides too.
const routeKey = (r: Route) => (r.page === 'product' ? `product/${r.slug}` : r.page)

/**
 * Which way the page transition should slide, and the key that triggers it. Also `layoutPage`: the page whose
 * layout is on screen, which only switches once the old page has slid out (call `handleExitComplete`), so
 * locking to one viewport (Vinyl, Events) can't snap the scroll position mid-slide.
 */
export function usePageTransition(route: Route) {
  const { page } = route
  const key = routeKey(route)

  // State-during-render: derive the direction from the previous page, no effect needed.
  const [nav, setNav] = useState({ key, page, direction: 1 })
  if (nav.key !== key) setNav({ key, page, direction: ORDER.indexOf(page) >= ORDER.indexOf(nav.page) ? 1 : -1 })

  const [layoutPage, setLayoutPage] = useState(page)
  const handleExitComplete = () => {
    jumpToTop()
    setLayoutPage(page)
  }

  return { key, direction: nav.direction, layoutPage, handleExitComplete }
}
