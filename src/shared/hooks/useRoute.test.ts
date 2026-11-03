import { describe, expect, it } from 'vitest'
import { productHref, routeFromHash } from './useRoute'

describe('routeFromHash', () => {
  it('maps each section hash to its page', () => {
    expect(routeFromHash('#/events')).toEqual({ page: 'events' })
    expect(routeFromHash('#/vinyl')).toEqual({ page: 'vinyl' })
    expect(routeFromHash('#/about')).toEqual({ page: 'about' })
    expect(routeFromHash('#/shop')).toEqual({ page: 'shop' })
  })

  it('reads a product slug and colour', () => {
    expect(routeFromHash('#/shop/cotton-tee/white')).toEqual({ page: 'product', slug: 'cotton-tee', color: 'white' })
  })

  it('treats an empty or unknown hash as home', () => {
    expect(routeFromHash('')).toEqual({ page: 'home' })
    expect(routeFromHash('#/nope')).toEqual({ page: 'home' })
  })

  it('round-trips the links it builds', () => {
    expect(routeFromHash(productHref('cotton-tee', 'black'))).toEqual({
      page: 'product',
      slug: 'cotton-tee',
      color: 'black',
    })
  })
})
