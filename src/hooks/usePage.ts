import { useEffect, useState } from 'react'

export type Page = 'home' | 'vinyl' | 'events' | 'about' | 'shop' | 'product'

export interface Route {
  page: Page
  /** Product slug and pre-selected colour, on product pages. */
  slug?: string
  color?: string
}

export const pageHref: Record<Exclude<Page, 'product'>, string> = {
  home: '#/',
  vinyl: '#/vinyl',
  events: '#/events',
  about: '#/about',
  shop: '#/shop',
}

export const productHref = (slug: string, color?: string) => `#/shop/${slug}${color ? `/${color}` : ''}`

/** Pages taller than the screen; every other page is locked to one viewport on desktop. */
export const scrollingPages: ReadonlySet<Page> = new Set(['home', 'about', 'shop', 'product'])

function routeFromHash(hash: string): Route {
  const [first, slug, color] = hash.replace(/^#\/?/, '').split('/')
  if (first === 'events') return { page: 'events' }
  if (first === 'about') return { page: 'about' }
  if (first === 'vinyl') return { page: 'vinyl' }
  if (first === 'shop') return slug ? { page: 'product', slug, color } : { page: 'shop' }
  return { page: 'home' }
}

/** Minimal hash router: the few pages don't need more than this. */
export function useRoute(): Route {
  const [route, setRoute] = useState(() => routeFromHash(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}
