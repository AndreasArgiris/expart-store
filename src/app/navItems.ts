import { events } from '../features/events/events'
import { releases } from '../features/vinyl/releases'
import type { Page } from '../shared/hooks/useRoute'

export type NavPage = Exclude<Page, 'product'>

export interface NavItem {
  label: string
  count?: number
  page?: NavPage
  /** Opens the cart drawer instead of navigating. */
  isCart?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Events', count: events.length, page: 'events' },
  { label: 'Shop', page: 'shop' },
  { label: 'Vinyls', count: releases.length, page: 'vinyl' },
  { label: 'About', page: 'about' },
  { label: 'Cart', isCart: true },
]

/** The Shop item stays lit on product pages. */
export const isNavItemActive = (item: NavItem, page: Page) =>
  item.page === page || (item.page === 'shop' && page === 'product')
